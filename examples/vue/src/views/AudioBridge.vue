<template>
    <div class="relative">
        <a
            class="fixed top-3 left-3 z-50 inline-flex items-center gap-2 rounded-full bg-sky-600/90 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-lg shadow-sky-900/50 transition hover:bg-sky-500"
            href="https://github.com/meetecho/janus-gateway"
            target="_blank"
            rel="noreferrer"
        >
            <i class="fa-brands fa-github"></i>
            Contribute on GitHub
        </a>
        <main class="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:px-8">
        <header class="panel">
            <div class="panel-body flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-2">
                    <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Plugin Demo
                    </p>
                    <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Audio Bridge (Mixed Contributions)
                    </h1>
                    <p class="max-w-2xl text-sm text-slate-300">
                        Connect to a Janus AudioBridge room, publish your microphone, and manage spatial audio, mute,
                        and suspension controls for every participant.
                    </p>
                </div>
                <button
                    :disabled="connecting"
                    class="btn btn-secondary text-base shadow-lg shadow-slate-900/60 disabled:cursor-not-allowed disabled:opacity-60"
                    @click="handleStartClick"
                >
                    <span v-if="connecting" class="flex items-center gap-2">
                        <span class="inline-block h-3 w-3 animate-ping rounded-full bg-slate-200"></span>
                        Working…
                    </span>
                    <span v-else>{{ startButtonLabel }}</span>
                </button>
            </div>
        </header>

        <section v-if="showDetails" class="panel">
            <div class="panel-body space-y-6">
                <div class="rounded-2xl bg-sky-600/20 p-4 text-sky-100">
                    Want to learn more about the <strong class="font-semibold text-sky-200">AudioBridge</strong>
                    plugin? Explore the
                    <a
                        href="https://janus.conf.meetecho.com/docs/audiobridge"
                        target="_blank"
                        rel="noreferrer"
                        class="font-medium text-sky-300 underline decoration-sky-500/60 underline-offset-4 hover:text-sky-200"
                    >official documentation</a>.
                </div>
                <div class="space-y-4 text-sm leading-relaxed text-slate-200">
                    <p>
                        The AudioBridge demo showcases a fully mixed audio-room experience using the Janus Gateway.
                        Once you join, Janus mixes every contribution so your browser only needs a single
                        PeerConnection regardless of how many peers participate.
                    </p>
                    <p>
                        Provide a display name to enter the default room, publish your microphone, and keep track of
                        everyone else in real time. Participant rows highlight mute status, suspended feeds, and
                        advertised spatial positions.
                    </p>
                    <p>
                        Press
                        <code class="rounded bg-slate-800/70 px-1 py-0.5 text-xs text-sky-300">Start</code>
                        to connect to your configured gateway and begin the session.
                    </p>
                </div>
            </div>
        </section>

        <section v-if="showJoinCard" class="panel">
            <div class="panel-body space-y-4">
                <div class="flex flex-wrap items-center gap-3">
                    <span
                        v-if="badge.text"
                        :class="['badge', badge.variant ? `bg-${badge.variant}` : 'bg-info']"
                        role="status"
                    >
                        {{ badge.text }}
                    </span>
                    <span class="text-sm text-slate-300">Set your display name to join the audio bridge.</span>
                </div>
                <div class="w-full">
                    <form class="flex flex-col gap-3 md:flex-row" autocomplete="off" @submit.prevent="handleRegister">
                        <label
                            class="flex w-full items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 shadow-inner shadow-slate-950/50 transition focus-within:border-sky-500"
                        >
                            <i class="fa-solid fa-user text-slate-400"></i>
                            <input
                                ref="usernameInput"
                                v-model.trim="usernameDraft"
                                :disabled="inputDisabled"
                                class="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                                type="text"
                                placeholder="Choose a display name"
                                autocomplete="off"
                                @keyup.enter.prevent="handleRegister"
                            />
                        </label>
                        <button
                            type="submit"
                            class="btn btn-success w-full md:w-auto"
                            :disabled="inputDisabled"
                        >
                            Join the room
                        </button>
                    </form>
                </div>
            </div>
        </section>

        <section v-if="showRoom" class="panel">
            <div class="panel-body grid gap-6 lg:grid-cols-2">
                <article class="panel">
                    <div class="panel-header flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3 text-lg font-semibold text-white">
                            Participants
                            <span v-if="participantBadge" class="badge bg-info">{{ participantBadge }}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <button
                                v-if="audioControlsVisible"
                                type="button"
                                class="btn btn-danger"
                                @click="handleToggleAudio"
                            >
                                {{ audioButtonLabel }}
                            </button>
                            <button
                                v-if="positionButtonVisible"
                                type="button"
                                class="btn btn-primary"
                                @click="handlePositionClick"
                            >
                                Position
                            </button>
                            <button
                                v-if="suspendButtonVisible"
                                type="button"
                                class="btn btn-secondary"
                                @click="handleToggleSuspend"
                            >
                                {{ suspendButtonLabel }}
                            </button>
                        </div>
                    </div>
                    <div class="panel-body">
                        <ul v-if="participants.length" class="flex flex-col gap-3 text-sm">
                            <li
                                v-for="participant in participants"
                                :key="participant.id"
                                class="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 shadow-sm shadow-slate-950/40"
                            >
                                <div class="flex items-start justify-between gap-3">
                                    <div>
                                        <p class="font-semibold text-white">
                                            {{ participantLabel(participant) }}
                                            <span v-if="participant.codec" class="ml-2 text-xs font-normal text-slate-400">
                                                {{ participant.codec }}
                                            </span>
                                        </p>
                                        <p class="text-xs uppercase tracking-wide text-slate-400">
                                            {{ participantStatusText(participant) }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-3 text-base text-slate-300">
                                        <i
                                            v-if="!participant.setup"
                                            class="fa-solid fa-link-slash text-amber-400"
                                            title="No PeerConnection"
                                        ></i>
                                        <i
                                            v-if="participant.suspended"
                                            class="fa-solid fa-eye-slash text-rose-400"
                                            title="Suspended"
                                        ></i>
                                        <i
                                            v-if="participant.muted"
                                            class="fa-solid fa-microphone-slash text-slate-400"
                                            title="Muted"
                                        ></i>
                                        <i
                                            v-if="participant.talking"
                                            class="fa-solid fa-wave-square text-emerald-400"
                                            title="Speaking"
                                        ></i>
                                    </div>
                                </div>
                                <div
                                    v-if="participant.spatialPosition !== null"
                                    class="mt-3 flex items-center gap-3 text-xs text-slate-400"
                                >
                                    <span>[L</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        :value="participant.spatialPosition"
                                        disabled
                                        class="h-1 w-full cursor-default rounded-full bg-slate-700"
                                    />
                                    <span>R]</span>
                                </div>
                            </li>
                        </ul>
                        <p v-else class="text-sm text-slate-400">
                            Waiting for participants to join…
                        </p>
                    </div>
                </article>

                <article class="panel">
                    <div class="panel-header text-lg font-semibold text-white">
                        Mixed Audio Output
                    </div>
                    <div class="panel-body flex flex-col items-center justify-center gap-4 text-sm text-slate-300">
                        <div v-if="spinnerVisible" class="flex flex-col items-center gap-3 text-slate-400">
                            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-white"></span>
                            <span>Awaiting audio setup…</span>
                        </div>
                        <audio
                            v-if="remoteStream"
                            ref="remoteAudio"
                            class="w-full max-w-md rounded-2xl border border-slate-800/70 bg-slate-900/80 p-3 shadow-inner shadow-slate-950/60"
                            controls
                            autoplay
                        ></audio>
                        <p v-if="!remoteStream" class="text-center text-slate-500">
                            Publish to the room to start receiving mixed audio.
                        </p>
                    </div>
                </article>
            </div>
        </section>
        </main>
    </div>
</template>

<script>
import { JanusAudioBridgePlugin } from 'typed_janus_js'
import { config } from '../config'
import {
    applyRemoteJsep,
    createJanusConnection,
    stopPluginWebrtc,
} from '../helpers/janus'

const parseBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
        const lowered = value.toLowerCase()
        if (lowered === 'true') return true
        if (lowered === 'false') return false
    }
    return fallback
}

const normalizeId = (value) => {
    if (value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
}

const parseNumericParam = (params, key, fallback) => {
    const raw = params.get(key)
    if (raw === null || raw === '') return fallback
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? fallback : parsed
}

export default {
    name: 'AudioBridgePage',
    data() {
        const params = new URLSearchParams(window.location.search)
        const selectedServer =
            params.get('server') ||
            config.servercheap?.server ||
            config.meetecho?.server ||
            config.default?.server ||
            ''
        return {
            params,
            options: {
                server: selectedServer,
                room: parseNumericParam(params, 'room', 1234),
                audioCodec: params.get('acodec') || null,
                stereo: params.get('stereo') === 'true',
                group: params.get('group') || null,
            },
            connecting: false,
            showDetails: true,
            showJoinCard: false,
            showRoom: false,
            badge: {
                text: '',
                variant: 'info',
            },
            usernameDraft: '',
            username: null,
            participantBadge: '',
            participantId: null,
            participantMap: null,
            participants: [],
            roomId: parseNumericParam(params, 'room', 1234),
            janus: null,
            session: null,
            plugin: null,
            webrtcUp: false,
            audioEnabled: false,
            audioSuspended: false,
            hasJoined: false,
            remoteStream: null,
            spinnerVisible: false,
            inputDisabled: false,
            unsubscribeFns: [],
            beforeUnloadHandler: null,
        }
    },
    computed: {
        startButtonLabel() {
            return this.session ? 'Stop' : 'Start'
        },
        audioButtonLabel() {
            return this.audioEnabled ? 'Mute' : 'Unmute'
        },
        suspendButtonLabel() {
            return this.audioSuspended ? 'Resume' : 'Suspend'
        },
        audioControlsVisible() {
            return this.hasJoined && this.webrtcUp
        },
        suspendButtonVisible() {
            return this.hasJoined && this.webrtcUp
        },
        positionButtonVisible() {
            return this.hasJoined && this.participants.some((p) => p.spatialPosition !== null)
        },
    },
    watch: {
        remoteStream(stream) {
            this.$nextTick(() => {
                const audio = this.$refs.remoteAudio
                if (!audio) return
                if (stream) {
                    audio.srcObject = stream
                    audio.volume = 1
                    const playPromise = audio.play?.()
                    if (playPromise && typeof playPromise.then === 'function') {
                        playPromise.catch(() => {
                            console.warn('User interaction is required to play remote audio')
                        })
                    }
                } else {
                    audio.pause?.()
                    audio.srcObject = null
                }
            })
        },
    },
    created() {
        this.participantMap = new Map()
        this.beforeUnloadHandler = () => {
            if (this.session) {
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
        setBadge(message, variant = 'info') {
            this.badge.text = message
            this.badge.variant = variant
        },
        clearBadge() {
            this.badge.text = ''
            this.badge.variant = 'info'
        },
        resetParticipants() {
            this.participantMap.clear()
            this.participants = []
        },
        refreshParticipants() {
            this.participants = Array.from(this.participantMap.values())
        },
        participantLabel(participant) {
            const display = participant.display || `User ${participant.id}`
            return participant.id === this.participantId ? `${display} (you)` : display
        },
        participantStatusText(participant) {
            const flags = []
            if (!participant.setup) flags.push('no peerconnection')
            if (participant.muted) flags.push('muted')
            if (participant.talking) flags.push('talking')
            if (participant.suspended) flags.push('suspended')
            return flags.length ? flags.join(' • ') : 'listening'
        },
        async handleStartClick() {
            if (this.connecting) return
            this.connecting = true
            try {
                if (this.session) {
                    await this.cleanup()
                } else {
                    await this.connect()
                }
            } catch (error) {
                console.error('AudioBridge start/stop failed', error)
                window.alert(error?.message || error)
                await this.cleanup()
            } finally {
                this.connecting = false
            }
        },
        async connect() {
            if (!this.options.server) {
                throw new Error('No Janus server configured')
            }
            const { janus, session } = await createJanusConnection({
                server: this.options.server,
                debug: false,
            })
            this.janus = janus
            this.session = session
            this.plugin = await session.attach(JanusAudioBridgePlugin)

            this.trackSubscription(this.plugin.onMessage.subscribe(this.handlePluginMessage))
            this.trackSubscription(this.plugin.onRemoteTrack.subscribe(this.handleRemoteTrack))
            this.trackSubscription(this.plugin.onLocalTrack.subscribe(this.handleLocalTrack))
            this.trackSubscription(this.plugin.onCleanup.subscribe(this.handlePluginCleanup))

            this.showDetails = false
            this.showJoinCard = true
            this.showRoom = false
            this.setBadge('Choose a display name')
            this.$nextTick(() => {
                this.$refs.usernameInput?.focus()
            })
        },
        async cleanup() {
            try {
                this.unsubscribeFns.forEach((unsubscribe) => {
                    try {
                        unsubscribe?.()
                    } catch (error) {
                        console.warn('Unsubscribe callback failed', error)
                    }
                })
            } catch (error) {
                console.warn('Unsubscribe failed', error)
            }
            this.unsubscribeFns = []

            await stopPluginWebrtc(this.plugin)
            this.plugin = null

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
            this.hasJoined = false
            this.webrtcUp = false
            this.audioEnabled = false
            this.audioSuspended = false
            this.remoteStream = null
            this.spinnerVisible = false
            this.participantId = null
            this.participantBadge = ''
            this.username = null
            this.usernameDraft = ''
            this.roomId = this.options.room
            this.inputDisabled = false
            this.resetParticipants()
            this.showDetails = true
            this.showJoinCard = false
            this.showRoom = false
            this.clearBadge()
        },
        trackSubscription(subscription) {
            if (!subscription) return
            if (typeof subscription === 'function') {
                this.unsubscribeFns.push(subscription)
            } else if (typeof subscription.unsubscribe === 'function') {
                this.unsubscribeFns.push(() => subscription.unsubscribe())
            }
        },
        async handleRegister(event) {
            event?.preventDefault?.()
            if (!this.plugin) return
            const name = this.usernameDraft
            if (!name) {
                this.setBadge('Insert your display name (e.g., pippo)', 'warning')
                return
            }
            if (/[^a-zA-Z0-9]/.test(name)) {
                this.setBadge('Input is not alphanumeric', 'warning')
                return
            }
            this.username = name
            this.participantBadge = name
            this.inputDisabled = true
            try {
                const payload = {
                    display: name,
                }
                if (this.options.audioCodec && ['opus', 'pcmu', 'pcma'].includes(this.options.audioCodec)) {
                    payload.codec = this.options.audioCodec
                }
                if (this.options.group) {
                    payload.group = this.options.group
                }
                await this.plugin.joinRoom(this.roomId, payload)
                this.setBadge('Joining room…', 'info')
            } catch (error) {
                console.error('Failed to join room', error)
                this.setBadge(`Join failed: ${error?.message || error}`, 'danger')
                this.inputDisabled = false
            }
        },
        async startPublisher() {
            if (!this.plugin || this.webrtcUp) return
            this.webrtcUp = true
            this.spinnerVisible = true
            try {
                let offer = await this.plugin.createOffer({
                    tracks: [{ type: 'audio', capture: true, recv: true }],
                })
                if (this.options.stereo && offer?.sdp && !offer.sdp.includes('stereo=1')) {
                    const updatedSdp = offer.sdp.replace(/useinbandfec=1/g, 'useinbandfec=1;stereo=1')
                    offer = new RTCSessionDescription({ type: offer.type, sdp: updatedSdp })
                }
                await this.plugin.configure({
                    offer,
                    muted: false,
                })
            } catch (error) {
                console.error('Failed to start audio publishing', error)
                window.alert(`WebRTC error: ${error?.message || error}`)
                this.webrtcUp = false
                this.spinnerVisible = false
            }
        },
        handleParticipantsList(list, { replace = false } = {}) {
            if (!Array.isArray(list)) return
            if (replace) {
                this.resetParticipants()
            }
            list.forEach((participant) => {
                const id = normalizeId(participant?.id)
                if (id == null) return
                const existing = this.participantMap.get(id) || {}
                this.participantMap.set(id, {
                    id,
                    display: participant.display ?? existing.display ?? null,
                    setup: parseBoolean(participant.setup, existing.setup ?? true),
                    muted: parseBoolean(participant.muted, existing.muted ?? false),
                    talking: parseBoolean(participant.talking, existing.talking ?? false),
                    suspended: parseBoolean(participant.suspended, existing.suspended ?? false),
                    spatialPosition:
                        typeof participant.spatial_position === 'number'
                            ? participant.spatial_position
                            : existing.spatialPosition ?? null,
                    codec: participant.codec || existing.codec || null,
                })
            })
            this.refreshParticipants()
        },
        removeParticipant(id) {
            const normalized = normalizeId(id)
            if (normalized == null || normalized === 'ok') return
            this.participantMap.delete(normalized)
            this.refreshParticipants()
        },
        async handlePluginMessage({ message, jsep }) {
            const event = message?.audiobridge
            if (event === 'joined') {
                await this.handleAudioBridgeJoined(message)
            } else if (event === 'roomchanged') {
                this.handleAudioBridgeRoomChanged(message)
            } else if (event === 'destroyed') {
                window.alert('The room has been destroyed')
                await this.cleanup()
                return
            } else if (event === 'event') {
                this.handleAudioBridgeEvent(message)
            }
            if (jsep) {
                try {
                    await applyRemoteJsep(this.plugin, jsep)
                } catch (error) {
                    console.error('Failed to handle remote SDP', error)
                }
            }
        },
        async handleAudioBridgeJoined(message) {
            const participantId = normalizeId(message.id)
            if (this.hasJoined) {
                if (participantId && participantId !== this.participantId) {
                    this.participantId = participantId
                }
                if (Array.isArray(message.participants)) {
                    this.handleParticipantsList(message.participants)
                }
                return
            }
            this.hasJoined = true
            this.participantId = participantId
            this.roomId = message.room ?? this.roomId
            this.handleParticipantsList(message.participants || [])
            this.showJoinCard = false
            this.showRoom = true
            await this.startPublisher()
        },
        handleAudioBridgeRoomChanged(message) {
            this.roomId = message.room ?? this.roomId
            this.participantId = normalizeId(message.id)
            this.handleParticipantsList(message.participants || [], { replace: true })
        },
        handleAudioBridgeEvent(message) {
            if (message.resumed === true) {
                this.audioSuspended = false
                this.handleParticipantsList(message.participants || [], { replace: true })
            } else if (Array.isArray(message.participants)) {
                this.handleParticipantsList(message.participants)
            } else if (message.participant) {
                this.handleParticipantsList([message.participant])
            }
            if (message.suspended != null) {
                const suspendedId = normalizeId(message.suspended)
                if (suspendedId === this.participantId) {
                    this.audioSuspended = true
                }
                const record = this.participantMap.get(suspendedId)
                if (record) {
                    this.participantMap.set(suspendedId, { ...record, suspended: true })
                    this.refreshParticipants()
                }
            }
            if (message.resumed != null && message.resumed !== true) {
                const resumedId = normalizeId(message.resumed)
                if (resumedId === this.participantId) {
                    this.audioSuspended = false
                }
                const record = this.participantMap.get(resumedId)
                if (record) {
                    this.participantMap.set(resumedId, { ...record, suspended: false })
                    this.refreshParticipants()
                }
            }
            if (message.leaving) {
                this.removeParticipant(message.leaving)
            }
            if (message.error) {
                if (message.error_code === 485) {
                    window.alert(
                        `Room ${this.roomId} does not exist. Ensure the AudioBridge configuration contains this room.`
                    )
                } else {
                    window.alert(message.error)
                }
            }
        },
        handleLocalTrack({ track, on }) {
            if (!track || track.kind !== 'audio') return
            if (on) {
                this.showRoom = true
            }
        },
        handleRemoteTrack({ track, on }) {
            if (!track || track.kind !== 'audio') return
            if (!on) {
                if (this.remoteStream) {
                    const current = this.remoteStream
                    current.getAudioTracks()
                        .filter((t) => t.id === track.id)
                        .forEach((t) => current.removeTrack(t))
                    if (!current.getAudioTracks().length) {
                        this.remoteStream = null
                        this.spinnerVisible = true
                    }
                }
                return
            }
            this.spinnerVisible = false
            const stream = this.remoteStream || new MediaStream()
            stream.getAudioTracks().forEach((existing) => stream.removeTrack(existing))
            stream.addTrack(track)
            this.remoteStream = stream
            this.audioEnabled = true
        },
        handlePluginCleanup() {
            this.webrtcUp = false
            this.audioEnabled = false
            this.audioSuspended = false
            this.remoteStream = null
            this.spinnerVisible = false
            this.refreshParticipants()
        },
        async handleToggleAudio() {
            if (!this.plugin || !this.hasJoined) return
            try {
                this.audioEnabled = !this.audioEnabled
                await this.plugin.configure({ muted: !this.audioEnabled })
            } catch (error) {
                console.error('Failed to toggle audio', error)
                this.setBadge('Audio toggle failed', 'danger')
            }
        },
        async handleToggleSuspend() {
            if (!this.plugin || !this.hasJoined || this.participantId == null) return
            const request = this.audioSuspended ? 'resume' : 'suspend'
            try {
                await this.plugin.send({
                    message: {
                        request,
                        room: this.roomId,
                        id: this.participantId,
                    },
                })
                this.audioSuspended = !this.audioSuspended
            } catch (error) {
                console.error('Failed to toggle suspend', error)
                this.setBadge('Suspend toggle failed', 'danger')
            }
        },
        async handlePositionClick() {
            if (!this.plugin || !this.hasJoined) return
            const result = window.prompt('Insert new spatial position: [0-100] (0=left, 50=center, 100=right)')
            if (result === null) return
            const spatial = Number(result)
            if (Number.isNaN(spatial) || spatial < 0 || spatial > 100) {
                window.alert('Invalid value')
                return
            }
            try {
                await this.plugin.configure({ spatialPosition: spatial })
            } catch (error) {
                console.error('Failed to update spatial position', error)
                this.setBadge('Position update failed', 'danger')
            }
        },
    },
}
</script>

<style scoped>
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

.bg-success {
    background-color: #22c55e;
    color: #052e16;
}

.bg-warning {
    background-color: #facc15;
    color: #111827;
}

.bg-danger {
    background-color: #ef4444;
    color: #f8fafc;
}

.bg-secondary {
    background-color: #475569;
    color: #f8fafc;
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

.btn-danger {
    background-color: #ef4444;
    color: #f8fafc;
}

.btn-info {
    background-color: #0ea5e9;
    color: #f8fafc;
}

.btn-success {
    background-color: #22c55e;
    color: #052e16;
}

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
</style>
