import { JanusAudioBridgePlugin } from 'typed_janus_js'
import { config } from './conf'
import { $, clearChildren, setDisabled, setText } from './helpers/dom'
import { applyRemoteJsep, createJanusConnection, stopPluginWebrtc } from './helpers/janus'

const ui = {
    startButton: $('#start'),
    details: $('#details'),
    audioJoin: $('#audiojoin'),
    registerRow: $('#registernow'),
    registerButton: $('#register'),
    usernameInput: $('#username'),
    youBadge: $('#you'),
    room: $('#room'),
    participantBadge: $('#participant'),
    participantsList: $('#list'),
    toggleAudioButton: $('#toggleaudio'),
    toggleSuspendButton: $('#togglesuspend'),
    positionButton: $('#position'),
    mixedAudioContainer: $('#mixedaudio'),
}

const params = new URLSearchParams(window.location.search)

const parseNumericParam = (key, fallback) => {
    const raw = params.get(key)
    if (raw === null || raw === '') return fallback
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? fallback : parsed
}

const options = {
    server:
        config.servercheap?.server ||
        config.meetecho?.server ||
        config.default?.server ||
        '',
    room: parseNumericParam('room', 1234),
    audioCodec: params.get('acodec') || null,
    stereo: params.get('stereo') === 'true',
    group: params.get('group') || null,
}

const initialAudioButtonClasses = ui.toggleAudioButton?.className || ''
const initialSuspendButtonClasses = ui.toggleSuspendButton?.className || ''

const state = {
    janus: null,
    session: null,
    plugin: null,
    connecting: false,
    joined: false,
    webrtcUp: false,
    audioEnabled: false,
    audioSuspended: false,
    username: null,
    participantId: null,
    roomId: options.room,
    participants: new Map(),
    remoteStream: null,
    remoteAudioEl: null,
    spinnerEl: null,
}

const hide = (el) => el && el.classList.add('hide')
const show = (el) => el && el.classList.remove('hide')
const resetClass = (el, className) => {
    if (!el) return
    el.className = className
}
const setBadge = (message, variant = 'info') => {
    if (!ui.youBadge) return
    ui.youBadge.textContent = message || ''
    ui.youBadge.className = 'badge'
    if (message) {
        ui.youBadge.classList.add(`bg-${variant}`)
        show(ui.youBadge)
    } else {
        hide(ui.youBadge)
    }
}

const normalizeId = (value) => {
    if (value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
}

const parseBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true
        if (value.toLowerCase() === 'false') return false
    }
    return fallback
}

const escapeHtml = (value) => {
    if (value == null) return ''
    return String(value)
        .replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[char]))
}

const ensureSpinner = () => {
    if (!ui.mixedAudioContainer || state.spinnerEl) return
    const wrapper = document.createElement('div')
    wrapper.className = 'text-center'
    const spinner = document.createElement('div')
    spinner.id = 'spinner'
    spinner.className = 'spinner-border'
    spinner.setAttribute('role', 'status')
    const hiddenSpan = document.createElement('span')
    hiddenSpan.className = 'visually-hidden'
    hiddenSpan.textContent = 'Loading...'
    spinner.appendChild(hiddenSpan)
    wrapper.appendChild(spinner)
    ui.mixedAudioContainer.appendChild(wrapper)
    state.spinnerEl = wrapper
}

const removeSpinner = () => {
    if (state.spinnerEl?.parentElement) {
        state.spinnerEl.parentElement.removeChild(state.spinnerEl)
    }
    state.spinnerEl = null
}

const ensureRemoteAudioElement = () => {
    if (!ui.mixedAudioContainer) return null
    if (state.remoteAudioEl) return state.remoteAudioEl
    const audio = document.createElement('audio')
    audio.id = 'roomaudio'
    audio.className = 'rounded centered w-100'
    audio.controls = true
    audio.autoplay = true
    ui.mixedAudioContainer.appendChild(audio)
    state.remoteAudioEl = audio
    return audio
}

const detachRemoteAudio = () => {
    if (state.remoteAudioEl) {
        state.remoteAudioEl.pause()
        state.remoteAudioEl.srcObject = null
        if (state.remoteAudioEl.parentElement) {
            state.remoteAudioEl.parentElement.removeChild(state.remoteAudioEl)
        }
    }
    if (state.remoteStream) {
        state.remoteStream.getTracks().forEach((track) => track.stop())
    }
    state.remoteStream = null
    state.remoteAudioEl = null
}

const resetParticipantsUi = () => {
    state.participants.clear()
    if (ui.participantsList) {
        clearChildren(ui.participantsList)
    }
}

const createParticipantRow = (id) => {
    if (!ui.participantsList) return null
    const listItem = document.createElement('li')
    listItem.id = `rp${id}`
    listItem.className = 'list-group-item'

    const sliderWrapper = document.createElement('span')
    sliderWrapper.className = 'ab-slider-section hide'
    sliderWrapper.append('[L ')
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = '0'
    slider.max = '100'
    slider.step = '1'
    slider.disabled = true
    slider.className = 'form-range ab-slider'
    sliderWrapper.appendChild(slider)
    sliderWrapper.append(' R] ')
    listItem.appendChild(sliderWrapper)

    const nameNode = document.createElement('span')
    nameNode.className = 'ab-name'
    listItem.appendChild(nameNode)

    const setupIcon = document.createElement('i')
    setupIcon.className = 'absetup fa-solid fa-link-slash ms-2 hide'
    setupIcon.title = 'No PeerConnection'
    listItem.appendChild(setupIcon)

    const suspendedIcon = document.createElement('i')
    suspendedIcon.className = 'absusp fa-solid fa-eye-slash ms-2 hide'
    suspendedIcon.title = 'Suspended'
    listItem.appendChild(suspendedIcon)

    const mutedIcon = document.createElement('i')
    mutedIcon.className = 'abmuted fa-solid fa-microphone-slash ms-2 hide'
    mutedIcon.title = 'Muted'
    listItem.appendChild(mutedIcon)

    ui.participantsList.appendChild(listItem)

    return {
        id,
        element: listItem,
        nameNode,
        sliderWrapper,
        slider,
        icons: {
            setup: setupIcon,
            suspended: suspendedIcon,
            muted: mutedIcon,
        },
    }
}

const getOrCreateParticipantRow = (id) => {
    const existing = state.participants.get(id)
    if (existing) return existing
    const row = createParticipantRow(id)
    if (row) {
        state.participants.set(id, row)
        return row
    }
    return null
}

const setIconVisibility = (icon, visible) => {
    if (!icon) return
    icon.classList.toggle('hide', !visible)
}

const updateParticipantRow = (participant) => {
    const id = normalizeId(participant.id)
    if (id == null) return
    const row = getOrCreateParticipantRow(id)
    if (!row) return

    const displayName = participant.display || `User ${id}`
    const label = id === state.participantId ? `${displayName} (you)` : displayName
    row.nameNode.textContent = label

    const setup = parseBoolean(participant.setup, true)
    const muted = parseBoolean(participant.muted, false)
    const suspended = parseBoolean(participant.suspended, false)
    const spatial = typeof participant.spatial_position === 'number' ? participant.spatial_position : null

    setIconVisibility(row.icons.setup, !setup)
    setIconVisibility(row.icons.muted, muted)
    setIconVisibility(row.icons.suspended, suspended)

    if (spatial != null) {
        row.slider.value = String(spatial)
        show(row.sliderWrapper)
        show(ui.positionButton)
    } else {
        hide(row.sliderWrapper)
    }
}

const removeParticipantRow = (id) => {
    const normalized = normalizeId(id)
    const entry = state.participants.get(normalized)
    if (entry?.element?.parentElement) {
        entry.element.parentElement.removeChild(entry.element)
    }
    state.participants.delete(normalized)
}

const maybeEnableStereo = (offer) => {
    if (!options.stereo || !offer?.sdp) return offer
    if (offer.sdp.includes('stereo=1')) return offer
    const updatedSdp = offer.sdp.replace(/useinbandfec=1/g, 'useinbandfec=1;stereo=1')
    return new RTCSessionDescription({ type: offer.type, sdp: updatedSdp })
}

const showRoomUi = () => {
    hide(ui.audioJoin)
    show(ui.room)
    if (state.username) {
        setText(ui.participantBadge, state.username)
        show(ui.participantBadge)
    }
}

const updateAudioButton = () => {
    if (!ui.toggleAudioButton) return
    resetClass(ui.toggleAudioButton, initialAudioButtonClasses || 'btn btn-danger hide')
    if (!state.joined || !state.webrtcUp) {
        hide(ui.toggleAudioButton)
        return
    }
    if (state.audioEnabled) {
        ui.toggleAudioButton.textContent = 'Mute'
        ui.toggleAudioButton.classList.add('btn-danger')
        show(ui.toggleAudioButton)
    } else {
        ui.toggleAudioButton.textContent = 'Unmute'
        ui.toggleAudioButton.classList.add('btn-success')
        show(ui.toggleAudioButton)
    }
}

const updateSuspendButton = () => {
    if (!ui.toggleSuspendButton) return
    resetClass(ui.toggleSuspendButton, initialSuspendButtonClasses || 'btn btn-secondary hide')
    if (!state.joined || !state.webrtcUp) {
        hide(ui.toggleSuspendButton)
        return
    }
    if (state.audioSuspended) {
        ui.toggleSuspendButton.textContent = 'Resume'
        ui.toggleSuspendButton.classList.add('btn-info')
        show(ui.toggleSuspendButton)
    } else {
        ui.toggleSuspendButton.textContent = 'Suspend'
        ui.toggleSuspendButton.classList.add('btn-secondary')
        show(ui.toggleSuspendButton)
    }
}

const updateStartButtonLabel = (label) => {
    if (ui.startButton) {
        ui.startButton.textContent = label
    }
}

const validateUsername = (value) => {
    if (!value) {
        setBadge('Insert your display name (e.g., pippo)', 'warning')
        return null
    }
    if (/[^a-zA-Z0-9]/.test(value)) {
        setBadge('Input is not alphanumeric', 'warning')
        return null
    }
    return value
}

const buildJoinOptions = (display) => {
    const payload = {
        display,
    }
    if (options.audioCodec && ['opus', 'pcmu', 'pcma'].includes(options.audioCodec)) {
        payload.codec = options.audioCodec
    }
    if (options.group) {
        payload.group = options.group
    }
    return payload
}

const startPublisher = async () => {
    if (!state.plugin || state.webrtcUp) return
    state.webrtcUp = true
    try {
        ensureSpinner()
        let offer = await state.plugin.createOffer({
            tracks: [{ type: 'audio', capture: true, recv: true }],
        })
        offer = maybeEnableStereo(offer)
        await state.plugin.configure({
            offer,
            muted: false,
        })
    } catch (error) {
        console.error('Failed to start audio publishing', error)
        window.alert(`WebRTC error: ${error?.message || error}`)
    }
}

const handleParticipantsList = (list, { replace = false } = {}) => {
    if (!Array.isArray(list)) return
    if (replace) {
        resetParticipantsUi()
    }
    list.forEach((participant) => updateParticipantRow(participant))
}

const handleAudioBridgeJoined = async (message) => {
    const participantId = normalizeId(message.id)
    if (state.joined) {
        if (participantId && participantId !== state.participantId) {
            state.participantId = participantId
        }
        if (Array.isArray(message.participants)) {
            handleParticipantsList(message.participants)
        }
        return
    }

    state.joined = true
    state.participantId = participantId
    state.roomId = message.room ?? state.roomId
    setBadge('Joined room', 'success')
    handleParticipantsList(message.participants || [])
    await startPublisher()
}

const handleAudioBridgeRoomChanged = (message) => {
    state.roomId = message.room ?? state.roomId
    state.participantId = normalizeId(message.id)
    resetParticipantsUi()
    handleParticipantsList(message.participants || [])
}

const handleAudioBridgeDestroyed = () => {
    window.alert('The room has been destroyed')
    window.location.reload()
}

const handleAudioBridgeEvent = (message) => {
    if (message.resumed === true) {
        state.audioSuspended = false
        updateSuspendButton()
        handleParticipantsList(message.participants || [], { replace: true })
    } else if (Array.isArray(message.participants)) {
        handleParticipantsList(message.participants)
    }

    if (message.suspended != null) {
        const suspendedId = normalizeId(message.suspended)
        if (suspendedId === state.participantId) {
            state.audioSuspended = true
            updateSuspendButton()
        }
        const entry = state.participants.get(suspendedId)
        if (entry) {
            setIconVisibility(entry.icons.suspended, true)
        }
    }

    if (message.resumed != null && message.resumed !== true) {
        const resumedId = normalizeId(message.resumed)
        if (resumedId === state.participantId) {
            state.audioSuspended = false
            updateSuspendButton()
        }
        const entry = state.participants.get(resumedId)
        if (entry) {
            setIconVisibility(entry.icons.suspended, false)
        }
    }

    if (message.error) {
        if (message.error_code === 485) {
            window.alert(
                `Room ${state.roomId} does not exist. Ensure the AudioBridge configuration contains this room.`
            )
        } else {
            window.alert(message.error)
        }
    }

    if (message.leaving) {
        removeParticipantRow(message.leaving)
    }
}

const handlePluginMessage = async ({ message, jsep }) => {
    const event = message?.audiobridge

    if (event === 'joined') {
        await handleAudioBridgeJoined(message)
    } else if (event === 'roomchanged') {
        handleAudioBridgeRoomChanged(message)
    } else if (event === 'destroyed') {
        handleAudioBridgeDestroyed()
        return
    } else if (event === 'event') {
        handleAudioBridgeEvent(message)
    }

    if (jsep) {
        try {
            await applyRemoteJsep(state.plugin, jsep)
        } catch (error) {
            console.error('Failed to handle remote SDP', error)
        }
    }
}

const handleLocalTrack = ({ track, on }) => {
    if (!track || track.kind !== 'audio') return
    if (on) {
        showRoomUi()
    }
}

const handleRemoteTrack = ({ track, on, mid }) => {
    console.log({ track, on, mid })
    if (!track || track.kind !== 'audio') return
    if (!on) {
        detachRemoteAudio()
        return
    }

    removeSpinner()
    const stream = state.remoteStream || new MediaStream()
    stream.getAudioTracks().forEach((existing) => stream.removeTrack(existing))
    stream.addTrack(track)
    state.remoteStream = stream

    const audioElement = ensureRemoteAudioElement()
    if (!audioElement) return
    audioElement.srcObject = stream
    audioElement.volume = 1
    const playPromise = audioElement.play?.()
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
            console.warn('User interaction is required to play remote audio')
        })
    }

    state.audioEnabled = true
    updateAudioButton()
    updateSuspendButton()
}

const handlePluginCleanup = () => {
    state.webrtcUp = false
    state.joined = false
    state.audioEnabled = false
    state.audioSuspended = false
    setBadge('Plugin cleanup', 'info')
    detachRemoteAudio()
    resetParticipantsUi()
    hide(ui.positionButton)
    updateAudioButton()
    updateSuspendButton()
}

const connect = async () => {
    if (!options.server) {
        throw new Error('No Janus server configured')
    }
    const { janus, session } = await createJanusConnection({
        server: options.server,
        debug: false,
    })
    state.janus = janus
    state.session = session
    state.plugin = await session.attach(JanusAudioBridgePlugin)

    state.plugin.onMessage.subscribe(handlePluginMessage)
    state.plugin.onRemoteTrack.subscribe(handleRemoteTrack)
    state.plugin.onLocalTrack.subscribe(handleLocalTrack)
    state.plugin.onCleanup.subscribe(handlePluginCleanup)

    if (ui.details && ui.details.parentElement) {
        ui.details.parentElement.removeChild(ui.details)
    }
    show(ui.audioJoin)
    show(ui.registerRow)
    hide(ui.positionButton)
    setBadge('Choose a display name', 'info')
    if (ui.usernameInput) ui.usernameInput.focus()
    updateStartButtonLabel('Stop')
}

const resetState = () => {
    state.janus = null
    state.session = null
    state.plugin = null
    state.connecting = false
    state.joined = false
    state.webrtcUp = false
    state.audioEnabled = false
    state.audioSuspended = false
    state.username = null
    state.participantId = null
    state.roomId = options.room
    detachRemoteAudio()
    resetParticipantsUi()
    hide(ui.positionButton)
    updateAudioButton()
    updateSuspendButton()
    show(ui.audioJoin)
    hide(ui.room)
    setText(ui.participantBadge, '')
    hide(ui.participantBadge)
    removeSpinner()
    setBadge('', 'info')
}

const disconnect = async () => {
    try {
        if (state.plugin) {
            await stopPluginWebrtc(state.plugin)
        }
    } catch (error) {
        console.warn('Plugin teardown failed', error)
    }

    try {
        if (state.session) {
            await state.session.destroy({})
        }
    } catch (error) {
        console.warn('Session destroy failed', error)
    }

    try {
        state.janus?.destroy?.()
    } catch (error) {
        console.warn('Janus destroy failed', error)
    }

    resetState()
    updateStartButtonLabel('Start')
}

const handleRegisterClick = async (event) => {
    event?.preventDefault?.()
    if (!state.plugin || !ui.usernameInput || !ui.registerButton) return

    const candidate = validateUsername(ui.usernameInput.value.trim())
    if (!candidate) {
        ui.usernameInput.removeAttribute('disabled')
        setDisabled(ui.registerButton, false)
        return
    }

    ui.usernameInput.setAttribute('disabled', 'true')
    setDisabled(ui.registerButton, true)
    state.username = escapeHtml(candidate)

    try {
        const joinOptions = buildJoinOptions(state.username)
        await state.plugin.joinRoom(state.roomId, joinOptions)
        setBadge('Joining room...', 'info')
    } catch (error) {
        console.error('Failed to join room', error)
        setBadge(`Join failed: ${error?.message || error}`, 'danger')
        ui.usernameInput.removeAttribute('disabled')
        setDisabled(ui.registerButton, false)
    }
}

const handleToggleAudio = async () => {
    if (!state.plugin || !state.joined) return
    try {
        state.audioEnabled = !state.audioEnabled
        await state.plugin.configure({ muted: !state.audioEnabled })
        updateAudioButton()
    } catch (error) {
        console.error('Failed to toggle audio', error)
        setBadge('Audio toggle failed', 'danger')
    }
}

const handleToggleSuspend = async () => {
    if (!state.plugin || !state.joined || state.participantId == null) return
    const request = state.audioSuspended ? 'resume' : 'suspend'
    try {
        await state.plugin.send({
            message: {
                request,
                room: state.roomId,
                id: state.participantId,
            },
        })
        state.audioSuspended = !state.audioSuspended
        updateSuspendButton()
    } catch (error) {
        console.error('Failed to toggle suspend', error)
        setBadge('Suspend toggle failed', 'danger')
    }
}

const handlePositionClick = async () => {
    if (!state.plugin || !state.joined) return
    const result = window.prompt('Insert new spatial position: [0-100] (0=left, 50=center, 100=right)')
    if (result === null) return
    const spatial = Number(result)
    if (Number.isNaN(spatial) || spatial < 0 || spatial > 100) {
        window.alert('Invalid value')
        return
    }
    try {
        await state.plugin.configure({ spatialPosition: spatial })
    } catch (error) {
        console.error('Failed to update spatial position', error)
        setBadge('Position update failed', 'danger')
    }
}

const handleStartClick = async () => {
    if (!ui.startButton || state.connecting) return
    state.connecting = true
    setDisabled(ui.startButton, true)

    try {
        if (state.session) {
            await disconnect()
        } else {
            await connect()
        }
    } catch (error) {
        console.error('AudioBridge start/stop failed', error)
        window.alert(error?.message || error)
        await disconnect()
    } finally {
        setDisabled(ui.startButton, false)
        state.connecting = false
    }
}

const init = () => {
    if (ui.startButton) ui.startButton.addEventListener('click', handleStartClick)
    if (ui.registerButton) ui.registerButton.addEventListener('click', handleRegisterClick)
    if (ui.toggleAudioButton) ui.toggleAudioButton.addEventListener('click', handleToggleAudio)
    if (ui.toggleSuspendButton) ui.toggleSuspendButton.addEventListener('click', handleToggleSuspend)
    if (ui.positionButton) ui.positionButton.addEventListener('click', handlePositionClick)

    hide(ui.audioJoin)
    hide(ui.room)
    hide(ui.positionButton)
    hide(ui.toggleAudioButton)
    hide(ui.toggleSuspendButton)

    window.addEventListener('beforeunload', () => {
        if (state.session) {
            disconnect().catch(() => { })
        }
    })
}

init()

// Preserve compatibility with the template inline handler
// eslint-disable-next-line no-unused-vars
export const checkEnter = (field, event) => {
    const key = event?.keyCode || event?.which || event?.charCode
    if (key === 13) {
        handleRegisterClick(event)
        return false
    }
    return true
}

window.checkEnter = checkEnter
