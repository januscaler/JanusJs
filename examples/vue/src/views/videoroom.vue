<template>
    <div class="relative">
        <main class="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:px-8">
            <header class="panel">
                <div class="panel-body flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-2">
                        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Video Room Demo</p>
                        <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Janus VideoRoom (Simulcast + SVC)
                        </h1>
                        <p class="max-w-2xl text-sm text-slate-300">
                            Connect to a Janus VideoRoom, publish your local audio/video, and subscribe to remote publishers. Simulcast
                            and SVC are enabled by default so quality can adapt when you switch layers.
                        </p>
                    </div>
                    <div class="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 text-xs text-slate-300">
                        <p class="font-semibold text-slate-200">Gateway</p>
                        <p class="truncate text-sky-300">{{ options.server }}</p>
                        <p class="mt-2 font-semibold text-slate-200">Room</p>
                        <p class="truncate text-sky-300">{{ roomId }}</p>
                    </div>
                </div>
            </header>

            <section class="panel">
                <div class="panel-body space-y-6">
                    <div class="flex flex-wrap items-center gap-3">
                        <span
                            v-if="statusText"
                            class="badge bg-info"
                            role="status"
                        >
                            {{ statusText }}
                        </span>
                        <span v-if="errorText" class="badge bg-danger">{{ errorText }}</span>
                    </div>
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
                        <label class="flex w-full flex-col gap-2 lg:max-w-sm">
                            <span class="text-xs uppercase tracking-wide text-slate-400">Display Name</span>
                            <input
                                v-model.trim="displayNameDraft"
                                :disabled="sessionActive && hasJoined"
                                class="rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-base text-white outline-none focus:border-sky-500"
                                type="text"
                                placeholder="Alphanumeric only"
                                autocomplete="off"
                            />
                        </label>
                        <div class="flex flex-wrap gap-3">
                            <button
                                type="button"
                                class="btn btn-primary"
                                :disabled="connecting"
                                @click="handleStartClick"
                            >
                                <span v-if="connecting" class="flex items-center gap-2">
                                    <span class="inline-block h-3 w-3 animate-ping rounded-full bg-slate-200"></span>
                                    Working…
                                </span>
                                <span v-else>{{ sessionActive ? 'Stop Session' : 'Start Session' }}</span>
                            </button>
                            <button
                                type="button"
                                class="btn btn-secondary"
                                :disabled="!sessionActive || hasJoined"
                                @click="handleJoinClick"
                            >
                                Join Room
                            </button>
                            <button
                                type="button"
                                class="btn btn-secondary"
                                :disabled="!isPublishing || subscriberMode"
                                @click="toggleMuteAudio"
                            >
                                {{ audioMuted ? 'Unmute' : 'Mute' }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-secondary"
                                :disabled="subscriberMode || !hasJoined"
                                @click="toggleVideoPublishing"
                            >
                                {{ isPublishing ? 'Unpublish' : 'Publish' }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-secondary"
                                :disabled="subscriberMode || !hasJoined"
                                @click="toggleBroadcast"
                            >
                                {{ isBroadcasting ? 'Stop Broadcast' : 'Start Broadcast' }}
                            </button>
                        </div>
                    </div>
                    <p class="text-xs text-slate-400">
                        Simulcast and SVC negotiation happen during publish. Use the buttons above to toggle mute, unpublish, and
                        broadcast control messages.
                    </p>
                </div>
            </section>

            <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <article class="panel">
                    <div class="panel-header text-lg font-semibold text-white">Local Preview</div>
                    <div class="panel-body">
                        <div class="relative aspect-video overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/70">
                            <video
                                ref="localVideo"
                                controls
                                class="h-full w-full object-cover"
                                playsinline
                                autoplay
                                muted
                            ></video>
                            <div
                                v-if="!localStream"
                                class="absolute inset-0 flex items-center justify-center text-sm text-slate-500"
                            >
                                Waiting for local media…
                            </div>
                            <span
                                v-if="localResolution"
                                class="absolute bottom-3 left-3 rounded bg-slate-900/80 px-2 py-1 text-xs text-slate-200"
                            >
                                {{ localResolution }}
                            </span>
                            <span
                                v-if="localBitrate"
                                class="absolute bottom-3 right-3 rounded bg-slate-900/80 px-2 py-1 text-xs text-slate-200"
                            >
                                {{ localBitrate }}
                            </span>
                        </div>
                    </div>
                </article>

                <article class="panel">
                    <div class="panel-header flex items-center justify-between text-lg font-semibold text-white">
                        Remote Publishers
                        <span class="badge bg-secondary">{{ remoteVideoEntries.length }}</span>
                    </div>
                    <div class="panel-body grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                        <div
                            v-for="tile in remoteVideoEntries"
                            :key="tile.key"
                            class="space-y-2"
                        >
                            <div class="relative aspect-video overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/70">
                                <video
                                    :ref="tile.videoRef"
                                    controls
                                    class="h-full w-full object-cover"
                                    autoplay
                                    playsinline
                                ></video>
                                <div
                                    v-if="tile.loading"
                                    class="absolute inset-0 flex items-center justify-center text-sm text-slate-400"
                                >
                                    Waiting for video…
                                </div>
                                <span class="absolute top-3 left-3 rounded bg-slate-900/80 px-2 py-1 text-xs text-slate-200">
                                    {{ tile.displayLabel }}
                                </span>
                                <span
                                    v-if="tile.resolution"
                                    class="absolute bottom-3 left-3 rounded bg-slate-900/80 px-2 py-1 text-xs text-slate-200"
                                >
                                    {{ tile.resolution }}
                                </span>
                                <span
                                    v-if="tile.bitrate"
                                    class="absolute bottom-3 right-3 rounded bg-slate-900/80 px-2 py-1 text-xs text-slate-200"
                                >
                                    {{ tile.bitrate }}
                                </span>
                            </div>
                                <div
                                    v-if="tile.layer && tile.layer.mode"
                                    class="rounded-xl border border-slate-800/60 bg-slate-900/70 p-3 text-xs text-slate-200"
                                >
                                    <div class="flex items-center justify-between text-slate-300">
                                        <span>{{ qualityHeader(tile.layer) }}</span>
                                    </div>
                                    <div class="mt-2 flex gap-2">
                                        <button
                                            v-for="sub in [2, 1, 0]"
                                            :key="`substream-${tile.key}-${sub}`"
                                            type="button"
                                            :class="layerButtonClass(tile.layer.currentQuality, sub)"
                                            @click="requestQualityLayer(tile.mid, sub)"
                                        >
                                            SL {{ sub }}
                                        </button>
                                    </div>
                                    <div
                                        v-if="tile.layer.temporalSupported"
                                        class="mt-3"
                                    >
                                        <span class="block text-slate-300">Temporal Layers</span>
                                        <div class="mt-2 flex gap-2">
                                            <button
                                                v-for="temporal in [1, 0]"
                                                :key="`temporal-${tile.key}-${temporal}`"
                                                type="button"
                                                :class="layerButtonClass(tile.layer.currentTemporal, temporal)"
                                                @click="requestTemporalLayer(tile.mid, temporal)"
                                            >
                                                TL {{ temporal }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <p v-if="!remoteVideoEntries.length" class="text-sm text-slate-400">
                            No active remote publishers yet.
                        </p>
                    </div>
                </article>
            </section>

            <audio
                v-for="audio in remoteAudioEntries"
                :key="audio.key"
                :ref="audio.audioRef"
                class="hidden"
                autoplay
                playsinline
            ></audio>
        </main>
    </div>
</template>

<script>
import { JanusVideoRoomPlugin } from 'typed_janus_js'
import { createJanusConnection, applyRemoteJsep, stopPluginWebrtc } from '../helpers/janus'

/** @typedef {import('typed_janus_js').Janus} JanusInstance */
/** @typedef {import('typed_janus_js').JanusSession} JanusSession */

const parseBooleanParam = (params, key, fallback = false) => {
    const raw = params.get(key)
    if (raw == null || raw === '') return fallback
    const lowered = raw.toLowerCase()
    if (lowered === 'true' || lowered === 'yes') return true
    if (lowered === 'false' || lowered === 'no') return false
    return fallback
}

const parseStringParam = (params, key, fallback = null) => {
    const raw = params.get(key)
    if (raw == null || raw === '') return fallback
    return raw
}

const DEFAULT_ROOM = 1234

const parseIceServers = (params, fallback) => {
    const raw = params.get('iceServers')
    if (!raw) return fallback
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return parsed
        }
    } catch (error) {
        console.warn('Invalid iceServers parameter, using fallback')
    }
    return fallback
}

export default {
    name: 'VideoRoom',
    data() {
        const params = new URLSearchParams(window.location.search)
        const server = parseStringParam(params, 'server', 'wss://janus1.januscaler.com/janus/ws')
        const roomFromQuery = parseStringParam(params, 'room', DEFAULT_ROOM)
        const pin = parseStringParam(params, 'pin', '')
        const token = parseStringParam(params, 'token', '')
        const apisecret = parseStringParam(params, 'apisecret', 'g#sK8*M2p@qR')
        const apiSecret = parseStringParam(params, 'apiSecret', 'janusscalerrocks')
        const protocol = parseStringParam(params, 'protocol', 'janus-protocol')
        const iceServers = parseIceServers(params, [
            { urls: 'stun:stun.l.google.com:19302' },
        ])
        const defaultDisplay = `Guest${Math.floor(Math.random() * 9000 + 1000)}`
        return {
            params,
            options: {
                server,
                pin,
                token,
                apisecret,
                apiSecret,
                protocol,
                iceServers,
            },
            roomId: roomFromQuery,
            acodec: parseStringParam(params, 'acodec', null),
            vcodec: parseStringParam(params, 'vcodec', null),
            subscriberMode: parseBooleanParam(params, 'subscriber-mode', false),
            useMsid: parseBooleanParam(params, 'msid', true),
            simulcast: true,
            svcMode: parseStringParam(params, 'svc', 'spatial-temporal'),
            displayNameDraft: defaultDisplay,
            displayName: null,
            connecting: false,
            sessionActive: false,
            hasJoined: false,
            /** @type {JanusInstance | null} */ janus: null,
            /** @type {JanusSession | null} */ session: null,
            /** @type {JanusVideoRoomPlugin | null} */ publisherPlugin: null,
            /** @type {JanusVideoRoomPlugin | null} */ subscriberPlugin: null,
            subscriberReady: false,
            subscriberJoining: false,
            myId: null,
            privateId: null,
            localStream: null,
            localResolution: '',
            localBitrate: '',
            audioMuted: false,
            isPublishing: false,
            isBroadcasting: false,
            statusText: '',
            errorText: '',
            localTrackMap: {},
            remoteFeeds: {},
            remoteStreamsByMid: {},
            subStreams: {},
            remoteBitrates: {},
            remoteResolutions: {},
            remoteTimers: {},
            remoteLayerInfo: {},
            pendingSubscribe: new Map(),
            pendingUnsubscribe: new Set(),
            subscriptions: new Map(),
            beforeUnloadHandler: null,
            publisherUnsubscribes: [],
            subscriberUnsubscribes: [],
        }
    },
    computed: {
          /**
             * @return {import('typed_janus_js').JanusVideoRoomPlugin | null}
             *  */ 
        subscriberPluginInstance(){
            return this.subscriberPlugin
        },
        remoteVideoEntries() {
            return Object.values(this.remoteStreamsByMid)
                .filter((entry) => entry.kind === 'video')
                .map((entry) => ({
                    key: entry.mid,
                    videoRef: `remote-${entry.mid}`,
                    displayLabel: entry.display || `Feed ${entry.feedId}`,
                    loading: !entry.stream,
                    bitrate: this.remoteBitrates[entry.feedId] || '',
                    resolution: this.remoteResolutions[entry.feedId] || '',
                    layer: this.remoteLayerInfo[entry.mid] || null,
                    mid: entry.mid,
                }))
        },
        remoteAudioEntries() {
            return Object.values(this.remoteStreamsByMid)
                .filter((entry) => entry.kind === 'audio')
                .map((entry) => ({
                    key: entry.mid,
                    audioRef: `remote-audio-${entry.mid}`,
                }))
        },
    },
    watch: {
        localStream(stream) {
            this.attachLocalStream(stream)
        },
    },
    created() {
        this.beforeUnloadHandler = () => {
            if (this.sessionActive) {
                this.cleanup().catch(() => {})
            }
        }
        window.addEventListener('beforeunload', this.beforeUnloadHandler)
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler)
        this.cleanup().catch(() => {})
    },
    methods: {
        async handleStartClick() {
            if (this.connecting) return
            this.connecting = true
            try {
                if (this.sessionActive) {
                    await this.cleanup()
                } else {
                    await this.initializeSession()
                }
            } catch (error) {
                console.error('VideoRoom start/stop error', error)
                this.errorText = error?.message || String(error)
            } finally {
                this.connecting = false
            }
        },
        async initializeSession() {
            if (!this.options.server) {
                throw new Error('No Janus server configured')
            }
            this.errorText = ''
            this.statusText = 'Connecting to Janus…'
            const { janus, session } = await createJanusConnection({
                server: this.options.server,
                debug: true,
                iceServers: this.options.iceServers,
                token: this.options.token || undefined,
                apisecret: this.options.apisecret || undefined,
                apiSecret: this.options.apiSecret || undefined,
                protocol: this.options.protocol || undefined,
            })
            this.janus = janus
            this.session = session
            this.publisherPlugin = await session.attach(JanusVideoRoomPlugin)
            this.sessionActive = true
            this.statusText = 'Session ready. Provide a display name and join.'
            this.subscribePublisherEvents()
        },
        subscribePublisherEvents() {
            if (!this.publisherPlugin) return
            this.trackPublisherSubscription(
                this.publisherPlugin.onMessage.subscribe(this.handlePublisherMessage)
            )
            this.trackPublisherSubscription(
                this.publisherPlugin.onLocalTrack.subscribe(this.handleLocalTrack)
            )
            this.trackPublisherSubscription(
                this.publisherPlugin.onCleanup.subscribe(this.handlePublisherCleanup)
            )
            this.trackPublisherSubscription(
                this.publisherPlugin.onWebRTCState.subscribe((on) => {
                if (on) {
                    this.statusText = 'Publisher PeerConnection active'
                }
                })
            )
        },
        async handleJoinClick() {
            if (!this.publisherPlugin || this.hasJoined) return
            const name = this.displayNameDraft.trim()
            if (!name) {
                this.errorText = 'Display name is required.'
                return
            }
            if (!/^[a-zA-Z0-9]+$/.test(name)) {
                this.errorText = 'Display name must be alphanumeric.'
                return
            }
            this.errorText = ''
            this.displayName = name
            this.statusText = 'Joining room…'
            try {
                await this.publisherPlugin.send({
                    message: {
                        request: 'join',
                        room: this.roomId,
                        ptype: 'publisher',
                        display: name,
                        token: this.options.token,
                        pin: this.options.pin,
                    },
                })
            } catch (error) {
                console.error('Join failed', error)
                this.errorText = error?.message || String(error)
            }
        },
        async handlePublisherMessage({ message, jsep }) {
            const event = message?.videoroom
            if (event === 'joined') {
                await this.handlePublisherJoined(message)
            } else if (event === 'event') {
                await this.handlePublisherEvent(message)
            } else if (event === 'destroyed') {
                this.errorText = 'Room was destroyed'
                await this.cleanup()
                return
            }
            if (jsep) {
                try {
                    await applyRemoteJsep(this.publisherPlugin, jsep)
                } catch (error) {
                    console.error('Failed to apply remote SDP', error)
                }
            }
        },
        async handlePublisherJoined(message) {
            this.hasJoined = true
            this.statusText = 'Joined room. Publishing…'
            this.myId = message.id
            this.privateId = message.private_id
            if (Array.isArray(message.publishers)) {
                this.handlePublisherList(message.publishers)
            }
            if (!this.subscriberMode) {
                await this.publishOwnFeed(true)
            } else {
                this.statusText = 'Subscriber mode active. Waiting for remote feeds.'
            }
        },
        async publishOwnFeed(withAudio) {
            if (!this.publisherPlugin) return
            try {
                const tracks = []
                if (withAudio) {
                    tracks.push({ type: 'audio', capture: true, recv: false })
                }
                tracks.push({
                    type: 'screen',
                    capture: true,
                    recv: false,
                    simulcast: true,
                    svc: this.svcMode,
                })
                const offer = await this.publisherPlugin.createOffer({ tracks })
                await this.publisherPlugin.publishAsPublisher(offer, {
                    display: this.displayName,
                    audiocodec: this.acodec || undefined,
                    videocodec: this.vcodec || undefined,
                })
                this.isPublishing = true
                this.audioMuted = false
                this.statusText = 'Publishing local stream'
            } catch (error) {
                console.error('Publish failed', error)
                this.errorText = error?.message || String(error)
                if (withAudio) {
                    await this.publishOwnFeed(false)
                }
            }
        },
        async toggleVideoPublishing() {
            if (this.subscriberMode) return
            if (!this.publisherPlugin) return
            if (!this.isPublishing) {
                await this.publishOwnFeed(true)
                return
            }
            try {
                await this.publisherPlugin.unpublishAsPublisher()
                this.isPublishing = false
                this.localStream = null
                this.statusText = 'Unpublished local stream'
            } catch (error) {
                console.error('Unpublish failed', error)
                this.errorText = error?.message || String(error)
            }
        },
        async toggleMuteAudio() {
            if (this.subscriberMode) return
            if (!this.publisherPlugin || !this.isPublishing) return
            try {
                if (this.audioMuted) {
                    this.publisherPlugin.unmuteAudio()
                } else {
                    this.publisherPlugin.muteAudio()
                }
                this.audioMuted = !this.audioMuted
            } catch (error) {
                console.error('Toggle mute failed', error)
            }
        },
        async toggleBroadcast() {
            if (this.subscriberMode) return
            if (!this.publisherPlugin || !this.myId) return
            const action = this.isBroadcasting ? 'stop' : 'start'
            try {
                await this.publisherPlugin.send({
                    message: {
                        request: 'broadcast',
                        action,
                        streamName: 'My stream1',
                        publisherId: this.myId,
                    },
                })
                this.isBroadcasting = !this.isBroadcasting
                this.statusText = this.isBroadcasting ? 'Broadcast started' : 'Broadcast stopped'
            } catch (error) {
                console.error('Broadcast toggle failed', error)
                this.errorText = error?.message || String(error)
            }
        },
        async handlePublisherEvent(message) {
            if (Array.isArray(message.publishers)) {
                this.handlePublisherList(message.publishers)
            }
            if (Array.isArray(message.streams)) {
                this.updateOwnStreams(message.streams)
            }
            if (message.leaving) {
                await this.unsubscribeFrom(message.leaving)
            }
            if (message.unpublished) {
                await this.unsubscribeFrom(message.unpublished)
            }
            if (message.error) {
                this.errorText = message.error
            }
        },
        updateOwnStreams(streams) {
            if (!Array.isArray(streams)) return
            streams.forEach((stream) => {
                if (stream.type === 'video' && stream.codec && stream.codec.toLowerCase() === 'h264') {
                    this.statusText = 'Publishing H.264 video'
                }
            })
        },
        handlePublisherList(publishers) {
            const sources = []
            publishers.forEach((pub) => {
                if (pub.dummy) return
                const streams = Array.isArray(pub.streams) ? pub.streams : []
                streams.forEach((stream) => {
                    sources.push({
                        feed: pub.id,
                        mid: stream.mid,
                        type: stream.type,
                        display: pub.display,
                        codec: stream.codec,
                    })
                })
                this.remoteFeeds[pub.id] = {
                    feedId: pub.id,
                    display: pub.display,
                }
            })
            if (sources.length) {
                this.subscribeToStreams(sources)
            }
        },
        async subscribeToStreams(streams) {
            if (!streams.length) return
            await this.ensureSubscriberPlugin()
            const subscribeRequests = []
            const unsubscribeRequests = []
            streams.forEach((stream) => {
                const parsedFeed = Number(stream.feed)
                const feedId = Number.isFinite(parsedFeed) ? parsedFeed : stream.feed
                const key = `${feedId}:${stream.mid}`
                if (stream.disabled) {
                    this.pendingSubscribe.delete(key)
                    if (this.subscriptions.has(key)) {
                        this.subscriptions.delete(key)
                        if (this.subscriberReady) {
                            unsubscribeRequests.push({ feed: feedId, mid: stream.mid })
                        } else {
                            this.pendingUnsubscribe.add(key)
                        }
                    }
                    this.detachRemoteTrack(stream.mid)
                    return
                }
                if (this.subscriptions.has(key) || this.pendingSubscribe.has(key)) {
                    return
                }
                if (!this.subscriberReady) {
                    this.pendingSubscribe.set(key, { feed: feedId, mid: stream.mid })
                } else {
                    subscribeRequests.push({ feed: feedId, mid: stream.mid })
                    this.subscriptions.set(key, { feed: feedId, mid: stream.mid })
                    this.pendingSubscribe.delete(key)
                    this.pendingUnsubscribe.delete(key)
                }
            })
            if (!this.subscriberReady) {
                if (!this.subscriberJoining) {
                    this.subscriberJoining = true
                    try {
                        const subscribeStreams = Array.from(this.pendingSubscribe.values()).map((stream) => ({
                            feed: stream.feed,
                            mid: stream.mid,
                        }))
                        const unsubscribeStreams = Array.from(this.pendingUnsubscribe.values()).map((key) => {
                            const [feed, mid] = key.split(':')
                            const parsedFeed = Number(feed)
                            const normalizedFeed = Number.isFinite(parsedFeed) ? parsedFeed : feed
                            return { feed: normalizedFeed, mid }
                        })
                        await this.subscriberPlugin.joinRoomAsSubscriber(this.roomId, {
                            streams: subscribeStreams,
                            private_id: this.privateId,
                            pin: this.options.pin,
                            use_msid: this.useMsid,
                            unsubscribe: unsubscribeStreams.length ? unsubscribeStreams : undefined,
                        })
                        subscribeStreams.forEach((stream) => {
                            const subKey = `${stream.feed}:${stream.mid}`
                            this.subscriptions.set(subKey, { feed: stream.feed, mid: stream.mid })
                            this.pendingSubscribe.delete(subKey)
                        })
                        this.pendingUnsubscribe.clear()
                    } catch (error) {
                        console.error('Subscriber join failed', error)
                        this.errorText = error?.message || String(error)
                    } finally {
                        this.subscriberJoining = false
                    }
                }
                return
            }
            if (!subscribeRequests.length && !unsubscribeRequests.length) return
            await this.subscriberPlugin.updateAsSubscriber({
                subscribe: subscribeRequests.length ? subscribeRequests : undefined,
                unsubscribe: unsubscribeRequests.length ? unsubscribeRequests : undefined,
            })
            subscribeRequests.forEach((item) => {
                const key = `${item.feed}:${item.mid}`
                this.subscriptions.set(key, item)
                this.pendingSubscribe.delete(key)
            })
            unsubscribeRequests.forEach((item) => {
                const key = `${item.feed}:${item.mid}`
                this.subscriptions.delete(key)
                this.pendingUnsubscribe.delete(key)
            })
        },
        async ensureSubscriberPlugin() {
            if (this.subscriberPlugin) return
            if (!this.session) return
            if (this.subscriberPlugin) return
            this.subscriberPlugin = await this.session.attach(JanusVideoRoomPlugin)
            this.trackSubscriberSubscription(
                this.subscriberPlugin.onMessage.subscribe(this.handleSubscriberMessage)
            )
            this.trackSubscriberSubscription(
                this.subscriberPlugin.onRemoteTrack.subscribe(this.handleSubscriberRemoteTrack)
            )
            this.trackSubscriberSubscription(
                this.subscriberPlugin.onCleanup.subscribe(this.handleSubscriberCleanup)
            )
        },
        async handleSubscriberMessage({ message, jsep }) {
            const event = message?.videoroom
            if (message?.error) {
                this.errorText = message.error
            }
            if (Array.isArray(message.streams)) {
                message.streams.forEach((stream) => {
                    const feedId = stream.feed_id
                    if (!this.remoteFeeds[feedId]) {
                        this.remoteFeeds[feedId] = {
                            feedId,
                            display: stream.display || `Feed ${feedId}`,
                        }
                    }
                    this.subStreams[stream.mid] = {
                        feedId,
                        type: stream.type,
                        display: this.remoteFeeds[feedId]?.display || `Feed ${feedId}`,
                    }
                    if (!this.remoteBitrates[feedId]) {
                        this.remoteBitrates[feedId] = ''
                    }
                })
            }
            if (event === 'attached') {
                this.subscriberReady = true
                const subscribe = []
                const unsubscribe = []
                this.pendingSubscribe.forEach((stream, key) => {
                    subscribe.push({ feed: stream.feed, mid: stream.mid })
                    this.subscriptions.set(key, { feed: stream.feed, mid: stream.mid })
                })
                this.pendingSubscribe.clear()
                this.pendingUnsubscribe.forEach((key) => {
                    const [feed, mid] = key.split(':')
                    const parsedFeed = Number(feed)
                    const normalizedFeed = Number.isFinite(parsedFeed) ? parsedFeed : feed
                    unsubscribe.push({ feed: normalizedFeed, mid })
                    this.subscriptions.delete(key)
                })
                this.pendingUnsubscribe.clear()
                if (subscribe.length || unsubscribe.length) {
                    try {
                        await this.subscriberPlugin.updateAsSubscriber({
                            subscribe: subscribe.length ? subscribe : undefined,
                            unsubscribe: unsubscribe.length ? unsubscribe : undefined,
                        })
                    } catch (error) {
                        console.error('Subscriber update failed', error)
                    }
                }
            } else if (event === 'event') {
                this.updateLayerInfoFromEvent(message)
            }
            if (jsep) {
                try {
                    const answer = await this.subscriberPlugin.createAnswer({
                        jsep,
                        tracks: [{ type: 'data' }],
                    })
                    await this.subscriberPlugin.startAsSubscriber(answer)
                } catch (error) {
                    console.error('Subscriber answer failed', error)
                }
            }
        },
        handleLocalTrack(data) {
            const { track, on } = data??{}
            const trackId = track?.id?.replace(/[{}]/g, '')
            if (!on) {
                delete this.localTrackMap[trackId]
                if (!Object.keys(this.localTrackMap).length) {
                    this.localStream = null
                }
                return
            }
            if (track.kind === 'video') {
                this.localTrackMap[trackId] = track
                const stream = new MediaStream([track])
                this.localStream = stream
                this.$nextTick(() => this.attachLocalStream(stream))
            }
        },
        attachLocalStream(stream) {
            const video = this.$refs.localVideo
            if (!video) return
            const element = Array.isArray(video) ? video[0] : video
            if (!element) return
            if (stream) {
                element.srcObject = stream
                const updateStats = () => {
                    if (!this.publisherPlugin || !this.isPublishing) return
                    this.localBitrate = this.publisherPlugin.getBitrate() || ''
                    if (element.videoWidth && element.videoHeight) {
                        this.localResolution = `${element.videoWidth}x${element.videoHeight}`
                    }
                }
                updateStats()
                element.onloadedmetadata = () => {
                    updateStats()
                }
            } else {
                element.srcObject = null
                this.localBitrate = ''
                this.localResolution = ''
            }
        },
        handleSubscriberRemoteTrack(data) {
            const { track, on, mid } = data??{}
            const info = this.subStreams[mid]
            if (!info) return
            if (!on) {
                this.detachRemoteTrack(mid)
                return
            }
            const stream = new MediaStream([track])
            this.$set(this.remoteStreamsByMid, mid, {
                mid,
                feedId: info.feedId,
                display: info.display,
                kind: track.kind,
                stream,
            })
            if (track.kind === 'video' && !this.remoteLayerInfo[mid]) {
                const temporalEnabled = Boolean(
                    this.simulcast || (this.svcMode && this.svcMode !== 'none')
                )
                const defaultMode = this.simulcast
                    ? 'simulcast'
                    : this.svcMode && this.svcMode !== 'none'
                        ? 'svc'
                        : null
                this.$set(this.remoteLayerInfo, mid, {
                    mode: defaultMode,
                    currentQuality: 2,
                    currentTemporal: 2,
                    temporalSupported: temporalEnabled,
                })
            }
            this.$nextTick(() => {
                if (track.kind === 'video') {
                    this.attachRemoteVideo(mid, stream)
                    this.startRemoteStatsTimer(info.feedId, mid)
                } else {
                    this.attachRemoteAudio(mid, stream)
                }
            })
        },
        attachRemoteVideo(mid, stream) {
            const ref = this.$refs[`remote-${mid}`]
            const element = Array.isArray(ref) ? ref[0] : ref
            if (!element) return
            element.srcObject = stream
        },
        attachRemoteAudio(mid, stream) {
            const ref = this.$refs[`remote-audio-${mid}`]
            const element = Array.isArray(ref) ? ref[0] : ref
            if (!element) return
            element.srcObject = stream
        },
        startRemoteStatsTimer(feedId, mid) {
            if (!this.subscriberPlugin) return
            if (this.remoteTimers[feedId]) return
            this.remoteTimers[feedId] = window.setInterval(() => {
                const bitrate = this.subscriberPlugin.getBitrate()
                if (bitrate) {
                    this.$set(this.remoteBitrates, feedId, bitrate)
                }
                const videoEl = this.$refs[`remote-${mid}`]
                const element = Array.isArray(videoEl) ? videoEl[0] : videoEl
                if (element && element.videoWidth && element.videoHeight) {
                    this.$set(
                        this.remoteResolutions,
                        feedId,
                        `${element.videoWidth}x${element.videoHeight}`
                    )
                }
            }, 1000)
        },
        resolveMidForLayerEvent(message) {
            const mid = message?.mid
            if (mid && (this.remoteStreamsByMid[mid] || this.remoteLayerInfo[mid])) {
                return mid
            }
            const feedIdRaw =
                message?.feed_id !== undefined
                    ? message.feed_id
                    : message?.feed !== undefined
                        ? message.feed
                        : message?.id
            if (feedIdRaw === undefined || feedIdRaw === null) return mid || null
            const feedIdNumber = Number(feedIdRaw)
            const matched = Object.values(this.remoteStreamsByMid).find((entry) => {
                if (!entry || entry.kind !== 'video') return false
                if (entry.feedId === feedIdRaw) return true
                if (Number.isFinite(feedIdNumber) && entry.feedId === feedIdNumber) return true
                return false
            })
            return matched?.mid || mid || null
        },
        updateLayerInfoFromEvent(message) {
            const mid = this.resolveMidForLayerEvent(message)
            if (mid == null) return
            const temporalEnabled = Boolean(
                this.simulcast || (this.svcMode && this.svcMode !== 'none')
            )
            const defaultMode = this.simulcast
                ? 'simulcast'
                : this.svcMode && this.svcMode !== 'none'
                    ? 'svc'
                    : null
            const base = this.remoteLayerInfo[mid] || {
                mode: defaultMode,
                currentQuality: null,
                currentTemporal: null,
                temporalSupported: temporalEnabled,
            }
            const next = { ...base }
            let changed = false
            const substream = this.parseLayerNumber(message.substream)
            if (substream != null && next.currentQuality !== substream) {
                next.mode = 'simulcast'
                next.currentQuality = substream
                changed = true
            }
            const spatial = this.parseLayerNumber(message.spatial_layer)
            if (spatial != null && next.currentQuality !== spatial) {
                next.mode = 'svc'
                next.currentQuality = spatial
                changed = true
            }
            const temporal = this.parseLayerNumber(message.temporal)
            if (temporal != null && next.currentTemporal !== temporal) {
                if (!next.mode) next.mode = 'simulcast'
                next.currentTemporal = temporal
                next.temporalSupported = true
                changed = true
            }
            const temporalLayer = this.parseLayerNumber(message.temporal_layer)
            if (temporalLayer != null && next.currentTemporal !== temporalLayer) {
                next.mode = next.mode || 'svc'
                next.currentTemporal = temporalLayer
                next.temporalSupported = true
                changed = true
            }
            const configured = typeof message.configured === 'string' ? message.configured : null
            if (!changed && configured && next.mode) {
                changed = true
            }
            if (changed) {
                this.$set(this.remoteLayerInfo, mid, next)
            }
        },
        parseLayerNumber(value) {
            if (value === null || value === undefined || value === '') return null
            const parsed = Number(value)
            if (Number.isNaN(parsed)) return null
            return parsed
        },
        qualityHeader(layer) {
            return layer.mode === 'svc' ? 'Spatial Layers' : 'Simulcast Layers'
        },
        layerButtonClass(current, value) {
            const base = 'rounded-lg border border-slate-700/60 px-3 py-1 text-xs transition'
            const active = current === value
                ? ' border-sky-500 bg-sky-500/10 text-sky-200'
                : ' text-slate-300 hover:border-sky-500 hover:text-sky-200'
            return `${base}${active}`
        },
        async requestQualityLayer(mid, value) {
            if (!this.subscriberPlugin) return
            const info = this.remoteLayerInfo[mid]
            if (!info || !info.mode) return
            const target = this.parseLayerNumber(value)
            const payload = { request: 'configure', mid }
            if (info.mode === 'svc') {
                payload.spatial_layer = target
            } else {
                payload.substream = target
            }
            try {
                await this.subscriberPlugin.send({ message: payload })
                this.statusText = info.mode === 'svc'
                    ? `Requested spatial layer SL ${target}`
                    : `Requested simulcast layer SL ${target}`
                this.$set(this.remoteLayerInfo, mid, {
                    ...info,
                    currentQuality: target,
                })
            } catch (error) {
                console.error('Layer change failed', error)
                this.errorText = error?.message || String(error)
            }
        },
        async requestTemporalLayer(mid, value) {
            if (!this.subscriberPlugin) return
            const info = this.remoteLayerInfo[mid]
            if (!info || !info.mode) return
            if (!info.temporalSupported) return
            const target = this.parseLayerNumber(value)
            if (target == null) return
            const payload = { request: 'configure', mid }
            if (info.mode === 'svc') {
                payload.temporal_layer = target
            } else {
                payload.temporal = target
            }
            try {
                await this.subscriberPlugin.send({ message: payload })
                this.statusText = `Requested temporal layer TL ${target}`
                this.$set(this.remoteLayerInfo, mid, {
                    ...info,
                    currentTemporal: target,
                    temporalSupported: true,
                })
            } catch (error) {
                console.error('Temporal layer change failed', error)
                this.errorText = error?.message || String(error)
            }
        },
        detachRemoteTrack(mid) {
            const entry = this.remoteStreamsByMid[mid]
            if (!entry) return
            const feedId = entry.feedId
            this.$delete(this.remoteStreamsByMid, mid)
            delete this.subStreams[mid]
            this.$delete(this.remoteLayerInfo, mid)
            if (!Object.values(this.remoteStreamsByMid).some((item) => item.feedId === feedId)) {
                if (this.remoteTimers[feedId]) {
                    window.clearInterval(this.remoteTimers[feedId])
                    delete this.remoteTimers[feedId]
                }
                delete this.remoteBitrates[feedId]
                delete this.remoteResolutions[feedId]
            }
        },
        async unsubscribeFrom(feedId) {
            if (!feedId) return
            if (feedId === 'ok') return
            Object.entries(this.remoteStreamsByMid).forEach(([mid, entry]) => {
                if (entry.feedId === feedId) {
                    this.detachRemoteTrack(mid)
                }
            })
            delete this.remoteFeeds[feedId]
            if (this.subscriberPlugin && this.subscriberReady) {
                await this.subscriberPlugin.updateAsSubscriber({
                    subscribe: undefined,
                    unsubscribe: [{ feed: feedId }],
                })
            }
        },
        handlePublisherCleanup() {
            this.localStream = null
            this.localBitrate = ''
            this.localResolution = ''
            this.isPublishing = false
            this.audioMuted = false
        },
        handleSubscriberCleanup() {
            Object.keys(this.remoteTimers).forEach((feedId) => {
                window.clearInterval(this.remoteTimers[feedId])
            })
            this.remoteTimers = {}
            this.remoteBitrates = {}
            this.remoteResolutions = {}
            this.remoteStreamsByMid = {}
            this.subStreams = {}
            this.remoteLayerInfo = {}
            this.subscriberReady = false
            this.pendingSubscribe = new Map()
        },
        async cleanup() {
            this.statusText = 'Cleaning up session'
            this.errorText = ''
            try {
                await stopPluginWebrtc(this.publisherPlugin)
            } catch (error) {
                console.warn('Publisher cleanup failed', error)
            }
            try {
                await stopPluginWebrtc(this.subscriberPlugin)
            } catch (error) {
                console.warn('Subscriber cleanup failed', error)
            }
            this.publisherPlugin = null
            this.subscriberPlugin = null
            this.subscriberReady = false
            this.subscriberJoining = false
            this.remoteStreamsByMid = {}
            this.remoteFeeds = {}
            Object.values(this.remoteTimers).forEach((timer) => window.clearInterval(timer))
            this.remoteTimers = {}
            this.remoteBitrates = {}
            this.remoteResolutions = {}
            this.remoteLayerInfo = {}
            this.localStream = null
            this.localTrackMap = {}
            this.isPublishing = false
            this.audioMuted = false
            this.isBroadcasting = false
            this.hasJoined = false
            this.myId = null
            this.privateId = null
            this.pendingSubscribe = new Map()
            this.publisherUnsubscribes.forEach((fn) => {
                try {
                    fn?.()
                } catch (error) {
                    console.warn('Publisher unsubscribe failed', error)
                }
            })
            this.subscriberUnsubscribes.forEach((fn) => {
                try {
                    fn?.()
                } catch (error) {
                    console.warn('Subscriber unsubscribe failed', error)
                }
            })
            this.publisherUnsubscribes = []
            this.subscriberUnsubscribes = []
            try {
                if (this.session) {
                    await this.session.destroy({})
                }
            } catch (error) {
                console.warn('Session destroy failed', error)
            }
            try {
                this.janus?.destroy?.()
            } catch (error) {
                console.warn('Janus destroy failed', error)
            }
            this.janus = null
            this.session = null
            this.sessionActive = false
            this.statusText = 'Idle'
        },
        trackPublisherSubscription(subscription) {
            if (!subscription) return
            if (typeof subscription === 'function') {
                this.publisherUnsubscribes.push(subscription)
            } else if (typeof subscription.unsubscribe === 'function') {
                this.publisherUnsubscribes.push(() => subscription.unsubscribe())
            }
        },
        trackSubscriberSubscription(subscription) {
            if (!subscription) return
            if (typeof subscription === 'function') {
                this.subscriberUnsubscribes.push(subscription)
            } else if (typeof subscription.unsubscribe === 'function') {
                this.subscriberUnsubscribes.push(() => subscription.unsubscribe())
            }
        },
    },
}
</script>

<style scoped>
.panel {
    backdrop-filter: blur(18px);
    background-color: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(100, 116, 139, 0.25);
    border-radius: 1rem;
    box-shadow: 0 24px 45px -25px rgba(2, 6, 23, 0.8);
}

.panel-header {
    padding: 1.25rem 1.5rem 0.75rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.panel-body {
    padding: 1.5rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 18px -12px rgba(15, 23, 42, 0.65);
}

.btn-primary {
    background-color: #2563eb;
    color: #f8fafc;
}

.btn-secondary {
    background-color: #1f2937;
    color: #f8fafc;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    letter-spacing: 0.01em;
}

.bg-info {
    background-color: #0ea5e9;
    color: #f8fafc;
}

.bg-secondary {
    background-color: #475569;
    color: #f8fafc;
}

.bg-danger {
    background-color: #ef4444;
    color: #f8fafc;
}
</style>
