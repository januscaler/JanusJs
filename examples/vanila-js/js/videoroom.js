import { JanusJs, JanusVideoRoomPlugin } from 'typed_janus_js'
import { config } from './conf'
import {
    $,
    appendLogLine,
    clearChildren,
    ensureMediaElement,
    renderList,
    setDisabled,
    setText,
} from './helpers/dom'
import { createJanusConnection, applyRemoteJsep } from './helpers/janus'

const vrElements = {
    server: $('#server'),
    room: $('#room'),
    display: $('#display'),
    bitrate: $('#bitrate'),
    maxSubscribers: $('#max-subscribers'),
    status: $('#status'),
    connect: $('#connect'),
    join: $('#join'),
    leave: $('#leave'),
    publish: $('#publish'),
    unpublish: $('#unpublish'),
    refresh: $('#refresh'),
    muteAudio: $('#mute-audio'),
    muteVideo: $('#mute-video'),
    participants: $('#participants'),
    localPane: $('#local-pane'),
    remotePane: $('#remote-pane'),
    log: $('#log'),
}

const vrDefaults = {
    server: config.servercheap?.server || config.meetecho?.server || '',
    room: 1234,
    bitrate: 512000,
    maxSubscribers: 12,
}

const vrState = {
    janus: null,
    session: null,
    publisher: null,
    subscriber: null,
    publishing: false,
    feeds: new Map(), // feedId -> publisher info
    subscribedFeeds: new Set(),
    midToFeed: new Map(),
    remoteStreams: new Map(), // feedId -> { audio: MediaStream, video: MediaStream, audioEl, videoEl }
    localStreams: new Map(),
    ownFeedId: null,
    privateId: null,
}

const vrLog = (message, level = 'info') =>
    appendLogLine(vrElements.log, message, { level })
const vrSetStatus = (message) => setText(vrElements.status, message)
const vrGetMaxSubscribers = () =>
    Number(vrElements.maxSubscribers?.value || 0) || vrDefaults.maxSubscribers

const vrResetUiState = () => {
    setDisabled(vrElements.join, true)
    setDisabled(vrElements.leave, true)
    setDisabled(vrElements.publish, true)
    setDisabled(vrElements.unpublish, true)
    setDisabled(vrElements.refresh, true)
    setDisabled(vrElements.muteAudio, true)
    setDisabled(vrElements.muteVideo, true)
}

const vrEnsureRemoteEntry = (feedId) => {
    let entry = vrState.remoteStreams.get(feedId)
    if (!entry) {
        entry = { audio: null, video: null, audioEl: null, videoEl: null }
        vrState.remoteStreams.set(feedId, entry)
    }
    return entry
}

const vrCleanupRemoteFeed = (feedId) => {
    const entry = vrState.remoteStreams.get(feedId)
    if (!entry) return
    entry.audio?.getTracks().forEach((track) => track.stop())
    entry.video?.getTracks().forEach((track) => track.stop())
    entry.audioEl?.remove()
    entry.videoEl?.remove()
    vrState.remoteStreams.delete(feedId)
    vrState.subscribedFeeds.delete(feedId)
    vrState.midToFeed.forEach((value, key) => {
        if (value === feedId) vrState.midToFeed.delete(key)
    })
}

const vrCleanupApp = async () => {
    vrState.localStreams.forEach((stream) => JanusJs.stopAllTracks(stream))
    vrState.localStreams.clear()
    vrState.remoteStreams.forEach(({ audio, video }) => {
        audio?.getTracks().forEach((track) => track.stop())
        video?.getTracks().forEach((track) => track.stop())
    })
    vrState.remoteStreams.clear()
    vrState.feeds.clear()
    vrState.subscribedFeeds.clear()
    vrState.midToFeed.clear()
    clearChildren(vrElements.participants)
    clearChildren(vrElements.remotePane)
    clearChildren(vrElements.localPane)
}

const vrRenderParticipants = () => {
    const rows = Array.from(vrState.feeds.values())
    renderList(vrElements.participants, rows, (publisher) => {
        const tr = document.createElement('tr')

        const nameCell = document.createElement('td')
        const isOwnFeed = publisher.id === vrState.ownFeedId
        nameCell.textContent =
            publisher.display || `${isOwnFeed ? 'You' : 'Feed'} ${publisher.id}`

        const streamsCell = document.createElement('td')
        streamsCell.textContent =
            (publisher.streams || [])
                .map((stream) => `${stream.type} (${stream.mid})`)
                .join(', ') || 'n/a'

        const actionCell = document.createElement('td')
        const button = document.createElement('button')
        if (isOwnFeed) {
            button.textContent = 'Own feed'
            button.disabled = true
            actionCell.appendChild(button)
            tr.appendChild(nameCell)
            tr.appendChild(streamsCell)
            tr.appendChild(actionCell)
            return tr
        }
        const subscribed = vrState.subscribedFeeds.has(publisher.id)
        button.textContent = subscribed ? 'Unsubscribe' : 'Subscribe'
        if (subscribed) button.classList.add('secondary')
        button.addEventListener('click', () => {
            if (subscribed) {
                vrUnsubscribeFromFeed(publisher.id)
            } else {
                vrSubscribeToFeed(publisher.id)
            }
        })
        actionCell.appendChild(button)

        tr.appendChild(nameCell)
        tr.appendChild(streamsCell)
        tr.appendChild(actionCell)
        return tr
    })
}

const vrUpdateFeeds = (publishers = []) => {
    publishers.forEach((publisher) => {
        if (!publisher || publisher.id == null) return
        const feedIdRaw = Number(publisher.id)
        const feedId = Number.isNaN(feedIdRaw) ? publisher.id : feedIdRaw
        const existingMids = []
        vrState.midToFeed.forEach((value, key) => {
            if (value === feedId) existingMids.push(key)
        })
        existingMids.forEach((mid) => vrState.midToFeed.delete(mid))
        const normalized = { ...publisher, id: feedId }
        vrState.feeds.set(feedId, normalized)
        ;(normalized.streams || []).forEach((stream) => {
            vrState.midToFeed.set(stream.mid, feedId)
        })
    })
    vrRenderParticipants()
    vrSubscribeAutomatically()
}
const vrSubscribeAutomatically = () => {
    const limit = vrGetMaxSubscribers()
    const available = Array.from(vrState.feeds.keys()).filter(
        (id) => id !== vrState.ownFeedId && !vrState.subscribedFeeds.has(id)
    )
    for (const feedId of available) {
        if (vrState.subscribedFeeds.size >= limit) break
        vrSubscribeToFeed(feedId)
    }
}
const vrSubscribeToFeed = async (feedId) => {
    const parsed = Number(feedId)
    const normalizedId = Number.isNaN(parsed) ? feedId : parsed
    if (!normalizedId || normalizedId === vrState.ownFeedId) return
    const publisher = vrState.feeds.get(normalizedId)
    if (!publisher || !vrState.publisher) return
    const subscribe = (publisher.streams || []).map((stream) => ({
        feed: publisher.id,
        mid: stream.mid,
    }))
    if (subscribe.length === 0) {
        vrLog(`Publisher ${publisher.id} has no subscribable streams`, 'warn')
        return
    }
    try {
        await vrEnsureSubscriber({ subscribe })
        vrState.subscribedFeeds.add(normalizedId)
        vrRenderParticipants()
        vrLog(`Subscribed to feed ${normalizedId}`)
    } catch (error) {
        vrLog(`Subscribe failed: ${error}`, 'error')
    }
}

const vrUnsubscribeFromFeed = async (feedId) => {
    if (!vrState.subscriber) return
    const parsed = Number(feedId)
    const normalizedId = Number.isNaN(parsed) ? feedId : parsed
    try {
        await vrState.subscriber.updateAsSubscriber({
            unsubscribe: [{ feed: normalizedId }],
        })
        vrCleanupRemoteFeed(normalizedId)
        vrRenderParticipants()
        vrLog(`Unsubscribed from feed ${normalizedId}`)
    } catch (error) {
        vrLog(`Unsubscribe failed: ${error}`, 'error')
    }
}
const vrEnsureSubscriber = async ({ subscribe }) => {
    if (!subscribe || subscribe.length === 0) return
    if (!vrState.subscriber) {
        vrState.subscriber = await vrState.session.attach(JanusVideoRoomPlugin)
        vrState.subscriber.onMessage.subscribe(async ({ jsep, message }) => {
            if (message?.videoroom === 'attached') {
                vrLog('Attached to room as subscriber')
            }
            if (jsep) {
                const answer = await vrState.subscriber.createAnswer({
                    jsep,
                    tracks: [
                        { type: 'audio', capture: false, recv: true },
                        { type: 'video', capture: false, recv: true },
                    ],
                })
                await vrState.subscriber.startAsSubscriber(answer)
            }
        })
        vrState.subscriber.onRemoteTrack.subscribe(({ track, on, mid }) => {
            const feedId = vrState.midToFeed.get(mid)
            if (!feedId) return
            const entry = vrEnsureRemoteEntry(feedId)
            if (on) {
                const stream = entry[track.kind] || new MediaStream()
                stream
                    .getTracks()
                    .filter((t) => t.kind === track.kind)
                    .forEach((t) => stream.removeTrack(t))
                stream.addTrack(track.clone())
                entry[track.kind] = stream
            } else if (entry[track.kind]) {
                const stream = entry[track.kind]
                stream
                    .getTracks()
                    .filter((t) => t.id === track.id)
                    .forEach((t) => stream.removeTrack(t))
                if (stream.getTracks().length === 0) entry[track.kind] = null
            }

            if (entry.video) {
                entry.videoEl = ensureMediaElement(vrElements.remotePane, {
                    id: `remote-video-${feedId}`,
                    kind: 'video',
                })
                entry.videoEl.srcObject = entry.video
            } else {
                entry.videoEl?.remove()
                entry.videoEl = null
            }

            if (entry.audio) {
                entry.audioEl = ensureMediaElement(vrElements.remotePane, {
                    id: `remote-audio-${feedId}`,
                    kind: 'audio',
                })
                entry.audioEl.srcObject = entry.audio
            } else {
                entry.audioEl?.remove()
                entry.audioEl = null
            }
        })

        const roomId = Number(vrElements.room.value)
        await vrState.subscriber.joinRoomAsSubscriber(roomId, {
            streams: subscribe,
            private_id: vrState.privateId ?? undefined,
        })
        return
    }

    await vrState.subscriber.updateAsSubscriber({ subscribe })
}
const vrAttachPublisherHandlers = () => {
    vrState.publisher.onMessage.subscribe(async ({ jsep, message }) => {
        const { videoroom, publishers, unpublished, leaving, error, room } =
            message || {}
        if (error) {
            vrLog(`Plugin error: ${error}`, 'error')
            return
        }

        if (videoroom === 'joined') {
            const ownFeedId = Number(message.id)
            vrState.ownFeedId = Number.isNaN(ownFeedId) ? message.id : ownFeedId
            vrState.privateId = message.private_id ?? null
            vrSetStatus(`Joined room ${room}`)
            setDisabled(vrElements.publish, false)
            setDisabled(vrElements.leave, false)
            setDisabled(vrElements.refresh, false)
            if (publishers?.length) vrUpdateFeeds(publishers)
        }
        if (videoroom === 'event') {
            if (publishers?.length) vrUpdateFeeds(publishers)
            const removed = unpublished || leaving
            const removedId =
                typeof removed === 'number' ? removed : Number(removed)
            if (Number.isFinite(removedId)) {
                vrCleanupRemoteFeed(removedId)
                vrState.feeds.delete(removedId)
                vrRenderParticipants()
                vrLog(`Feed ${removedId} removed`)
            }
        }
        if (videoroom === 'destroyed') {
            vrLog('Room destroyed by server', 'warn')
            await vrDisconnect()
            return
        }
        if (jsep) {
            await applyRemoteJsep(vrState.publisher, jsep)
        }
    })

    vrState.publisher.onLocalTrack.subscribe(({ track, on }) => {
        if (!track) return
        const kind = track.kind
        let stream = vrState.localStreams.get(kind)
        if (!stream) {
            stream = new MediaStream()
            vrState.localStreams.set(kind, stream)
        }
        if (on) {
            stream
                .getTracks()
                .filter((t) => t.kind === kind)
                .forEach((t) => stream.removeTrack(t))
            stream.addTrack(track)
        } else {
            stream
                .getTracks()
                .filter((t) => t.id === track.id)
                .forEach((t) => stream.removeTrack(t))
        }

        const element = ensureMediaElement(vrElements.localPane, {
            id: `local-${kind}`,
            kind: kind === 'audio' ? 'audio' : 'video',
            muted: true,
        })
        element.srcObject = stream
    })

    vrState.publisher.onSlowLink.subscribe(({ uplink, lost }) => {
        vrLog(
            `Slow ${uplink ? 'uplink' : 'downlink'} detected (lost ${lost} packets)`,
            'warn'
        )
    })
}
const vrConnect = async () => {
    if (vrState.session) return
    setDisabled(vrElements.connect, true)
    vrSetStatus('Connecting…')
    vrLog('Connecting to Janus gateway')
    try {
        const { session, janus } = await createJanusConnection({
            server: vrElements.server.value.trim(),
            debug: false,
        })
        vrState.janus = janus
        vrState.session = session
        vrState.publisher = await session.attach(JanusVideoRoomPlugin)
        vrAttachPublisherHandlers()
        vrSetStatus('Connected. Join a room to continue.')
        setDisabled(vrElements.join, false)
        vrLog('Session established')
    } catch (error) {
        setDisabled(vrElements.connect, false)
        vrSetStatus('Failed to connect')
        vrLog(`Connection failed: ${error}`, 'error')
    }
}
const vrJoinRoom = async () => {
    if (!vrState.publisher) return
    const roomId = Number(vrElements.room.value)
    if (!roomId) {
        vrLog('Room ID required', 'warn')
        return
    }
    const display = vrElements.display.value.trim() || `User-${Date.now()}`
    setDisabled(vrElements.join, true)
    try {
        await vrState.publisher.joinRoomAsPublisher(roomId, { display })
        vrSetStatus(`Joining room ${roomId}…`)
        vrLog(`Join request sent for room ${roomId}`)
    } catch (error) {
        setDisabled(vrElements.join, false)
        vrLog(`Join failed: ${error}`, 'error')
    }
}
const vrPublishFeed = async () => {
    if (!vrState.publisher || vrState.publishing) return
    try {
        const offer = await vrState.publisher.createOffer({
            tracks: [
                { type: 'video', capture: true, recv: false },
                { type: 'audio', capture: true, recv: false },
            ],
        })
        await vrState.publisher.publishAsPublisher(offer, {
            bitrate: Number(vrElements.bitrate.value) || vrDefaults.bitrate,
        })
        vrState.publishing = true
        setDisabled(vrElements.publish, true)
        setDisabled(vrElements.unpublish, false)
        setDisabled(vrElements.muteAudio, false)
        setDisabled(vrElements.muteVideo, false)
        vrLog('Publishing local media')
    } catch (error) {
        vrLog(`Publish failed: ${error}`, 'error')
    }
}
const vrUnpublishFeed = async () => {
    if (!vrState.publisher || !vrState.publishing) return
    try {
        await vrState.publisher.unpublishAsPublisher()
        vrState.publishing = false
        setDisabled(vrElements.publish, false)
        setDisabled(vrElements.unpublish, true)
        setDisabled(vrElements.muteAudio, true)
        setDisabled(vrElements.muteVideo, true)
        vrLog('Stopped publishing')
    } catch (error) {
        vrLog(`Unpublish failed: ${error}`, 'error')
    }
}
const vrRefreshParticipants = async () => {
    if (!vrState.publisher) return
    try {
        const response = await vrState.publisher.listParticipants(
            Number(vrElements.room.value)
        )
        vrState.feeds.clear()
        vrState.midToFeed.clear()
        vrUpdateFeeds(response?.participants || [])
        vrLog(`Room has ${response?.participants?.length || 0} participant(s)`)
    } catch (error) {
        vrLog(`List participants failed: ${error}`, 'error')
    }
}
const vrToggleAudio = () => {
    if (!vrState.publisher) return
    if (vrState.publisher.isAudioMuted()) {
        vrState.publisher.unmuteAudio()
        vrLog('Audio unmuted')
    } else {
        vrState.publisher.muteAudio()
        vrLog('Audio muted')
    }
}
const vrToggleVideo = () => {
    if (!vrState.publisher) return
    if (vrState.publisher.isVideoMuted()) {
        vrState.publisher.unmuteVideo()
        vrLog('Video unmuted')
    } else {
        vrState.publisher.muteVideo()
        vrLog('Video muted')
    }
}
const vrLeaveRoom = async () => {
    if (!vrState.publisher) return
    try {
        await vrState.publisher.leave()
    } catch (error) {
        vrLog(`Leave failed: ${error}`, 'warn')
    }
    vrState.publishing = false
    vrState.privateId = null
    vrState.ownFeedId = null
    setDisabled(vrElements.publish, true)
    setDisabled(vrElements.unpublish, true)
    setDisabled(vrElements.leave, true)
    setDisabled(vrElements.join, false)
    setDisabled(vrElements.refresh, true)
    setDisabled(vrElements.muteAudio, true)
    setDisabled(vrElements.muteVideo, true)
    vrSetStatus('Ready to join a room.')
    vrLog('Left room')
    await vrCleanupApp()
}
const vrDisconnect = async () => {
    await vrLeaveRoom()
    if (vrState.subscriber) {
        try {
            await vrState.subscriber.detach()
        } catch (error) {
            vrLog(`Subscriber detach failed: ${error}`, 'warn')
        }
        vrState.subscriber = null
    }
    if (vrState.publisher) {
        try {
            await vrState.publisher.detach()
        } catch (error) {
            vrLog(`Publisher detach failed: ${error}`, 'warn')
        }
        vrState.publisher = null
    }
    if (vrState.session) {
        try {
            await vrState.session.destroy({})
        } catch (error) {
            vrLog(`Session destroy failed: ${error}`, 'warn')
        }
        vrState.session = null
    }
    vrState.janus = null
    vrResetUiState()
    setDisabled(vrElements.connect, false)
    vrSetStatus('Disconnected')
    vrLog('Disconnected from gateway')
}
const vrBindUi = () => {
    if (vrDefaults.server) vrElements.server.value = vrDefaults.server
    if (vrDefaults.room) vrElements.room.value = vrDefaults.room
    if (vrDefaults.bitrate && vrElements.bitrate)
        vrElements.bitrate.value = vrDefaults.bitrate
    if (vrDefaults.maxSubscribers && vrElements.maxSubscribers)
        vrElements.maxSubscribers.value = vrDefaults.maxSubscribers

    vrResetUiState()
    vrElements.connect?.addEventListener('click', vrConnect)
    vrElements.join?.addEventListener('click', vrJoinRoom)
    vrElements.leave?.addEventListener('click', vrLeaveRoom)
    vrElements.publish?.addEventListener('click', vrPublishFeed)
    vrElements.unpublish?.addEventListener('click', vrUnpublishFeed)
    vrElements.refresh?.addEventListener('click', vrRefreshParticipants)
    vrElements.muteAudio?.addEventListener('click', vrToggleAudio)
    vrElements.muteVideo?.addEventListener('click', vrToggleVideo)

    window.addEventListener('beforeunload', () => {
        if (vrState.session) {
            vrDisconnect().catch(() => {})
        }
    })
}

vrBindUi()
