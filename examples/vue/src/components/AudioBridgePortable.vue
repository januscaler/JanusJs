<template>
    <div class="panel portable-bridge">
        <header
            class="panel-header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
            <div class="space-y-1">
                <p class="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Audio Bridge
                </p>
                <h2 class="text-xl font-semibold text-white">
                    {{ displayNameLabel }}
                </h2>
                <p class="text-xs text-slate-400">Room {{ activeRoomLabel }}</p>
            </div>
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    class="btn btn-secondary"
                    :disabled="!hasJoined || !webrtcUp || connecting"
                    @click="handleToggleAudio"
                >
                    <span v-if="connecting" class="flex items-center gap-2">
                        <span
                            class="inline-block h-3 w-3 animate-ping rounded-full bg-slate-200"
                        ></span>
                        Working…
                    </span>
                    <span v-else>{{ muteButtonLabel }}</span>
                </button>
            </div>
        </header>
        <section class="panel-body space-y-6">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <p class="text-sm text-slate-200">
                        <span class="font-semibold text-white">Status:</span>
                        {{ statusMessage }}
                    </p>
                    <p v-if="audioSuspended" class="text-xs text-amber-400">
                        Audio suspended by the bridge.
                    </p>
                </div>
                <div
                    v-if="spinnerVisible"
                    class="flex items-center gap-2 text-xs text-slate-400"
                >
                    <span
                        class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-white"
                    ></span>
                    Connecting…
                </div>
            </div>

            <div class="space-y-3">
                <div
                    class="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400"
                >
                    <span>Participants</span>
                    <span>{{ participants.length }}</span>
                </div>
                <ul
                    v-if="participants.length"
                    class="flex flex-col gap-3 text-sm"
                >
                    <li
                        v-for="participant in participants"
                        :key="participant.id"
                        :class="[
                            'rounded-xl border px-4 py-3 shadow-sm transition',
                            participant.talking
                                ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100 shadow-emerald-600/20'
                                : 'border-slate-800/70 bg-slate-900/60 text-slate-200 shadow-slate-950/40',
                        ]"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="space-y-1">
                                <p class="font-semibold text-white">
                                    {{ participantLabel(participant) }}
                                </p>
                                <p
                                    class="text-xs uppercase tracking-wide"
                                    :class="participantStatusClass(participant)"
                                >
                                    {{ participantStatusText(participant) }}
                                </p>
                            </div>
                            <div
                                class="flex items-center gap-3 text-base text-slate-300"
                            >
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
                    </li>
                </ul>
                <p v-else class="text-sm text-slate-400">
                    Waiting for participants…
                </p>
            </div>

            <div class="space-y-2">
                <audio
                    v-if="remoteStream"
                    ref="remoteAudio"
                    class="w-full rounded-xl border border-slate-800/60 bg-slate-900/80 p-3"
                    controls
                    autoplay
                ></audio>
                <p class="text-xs text-slate-500">
                    Mixed audio from the bridge plays here. Adjust the media
                    element if browser blocks autoplay.
                </p>
            </div>
        </section>
    </div>
</template>

<script>
import { JanusAudioBridgePlugin } from 'typed_janus_js'
const createJanusConnection = async ({ server, debug = false }) => {
    const janus = new JanusJs({ server })
    await janus.init({ debug })
    const session = await janus.createSession()
    return { janus, session }
}

const applyRemoteJsep = async (plugin, jsep) => {
    if (!plugin || !jsep) return
    await plugin.handleRemoteJsep({ jsep })
}

const stopPluginWebrtc = async (plugin) => {
    if (!plugin) return
    try {
        if (typeof plugin.hangup === 'function') {
            plugin.hangup(true)
        }
    } catch (error) {
        console.warn('hangup failed', error)
    }
    try {
        await plugin.detach()
    } catch (error) {
        console.warn('detach failed', error)
    }
}
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

export default {
    name: 'AudioBridgePortable',
    props: {
        janusServer: {
            type: String,
            required: true,
        },
        room: {
            type: [Number, String],
            default: 1234,
        },
        displayName: {
            type: String,
            required: true,
        },
        audioCodec: {
            type: String,
            default: null,
        },
        stereo: {
            type: Boolean,
            default: false,
        },
        group: {
            type: String,
            default: null,
        },
        debug: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            statusMessage: 'Idle',
            connecting: false,
            janus: null,
            session: null,
            plugin: null,
            hasJoined: false,
            webrtcUp: false,
            audioEnabled: false,
            audioSuspended: false,
            remoteStream: null,
            spinnerVisible: false,
            participantId: null,
            participantMap: null,
            participants: [],
            unsubscribeFns: [],
            beforeUnloadHandler: null,
            activeRoom: null,
        }
    },
    computed: {
        normalizedRoom() {
            const parsed = Number(this.room)
            return Number.isNaN(parsed) ? this.room : parsed
        },
        displayNameLabel() {
            return this.displayName || '—'
        },
        activeRoomLabel() {
            return this.activeRoom ?? this.normalizedRoom ?? '—'
        },
        muteButtonLabel() {
            return this.audioEnabled ? 'Mute' : 'Unmute'
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
                            console.warn(
                                'User interaction is required to play remote audio'
                            )
                        })
                    }
                } else {
                    audio.pause?.()
                    audio.srcObject = null
                }
            })
        },
        janusServer(newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                return this.reinitialize()
            }
        },
        room(newVal, oldVal) {
            if (newVal !== oldVal) {
                return this.reinitialize()
            }
        },
        displayName(newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                return this.reinitialize()
            }
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
    mounted() {
        this.connectAndJoin()
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler)
        this.cleanup().catch(() => {})
    },
    methods: {
        async reinitialize() {
            await this.cleanup()
            await this.connectAndJoin()
        },
        async connectAndJoin() {
            if (!this.janusServer) {
                this.statusMessage = 'Missing Janus server URL'
                return
            }
            if (!this.displayName) {
                this.statusMessage = 'Missing display name'
                return
            }
            if (!/^[a-zA-Z0-9]+$/.test(this.displayName)) {
                this.statusMessage = 'Display name must be alphanumeric'
                return
            }
            if (this.connecting) return

            this.statusMessage = 'Connecting to Janus…'
            this.connecting = true
            this.spinnerVisible = true
            try {
                const { janus, session } = await createJanusConnection({
                    server: this.janusServer,
                    debug: this.debug,
                })
                this.janus = janus
                this.session = session
                this.plugin = await session.attach(JanusAudioBridgePlugin)

                this.trackSubscription(
                    this.plugin.onMessage.subscribe(this.handlePluginMessage)
                )
                this.trackSubscription(
                    this.plugin.onRemoteTrack.subscribe(this.handleRemoteTrack)
                )
                this.trackSubscription(
                    this.plugin.onLocalTrack.subscribe(this.handleLocalTrack)
                )
                this.trackSubscription(
                    this.plugin.onCleanup.subscribe(this.handlePluginCleanup)
                )

                this.resetParticipants()
                this.statusMessage = 'Joining room…'

                const payload = {
                    display: this.displayName,
                }
                if (
                    this.audioCodec &&
                    ['opus', 'pcmu', 'pcma'].includes(this.audioCodec)
                ) {
                    payload.codec = this.audioCodec
                }
                if (this.group) {
                    payload.group = this.group
                }

                await this.plugin.joinRoom(this.normalizedRoom, payload)
            } catch (error) {
                console.error('AudioBridgePortable connection failed', error)
                this.statusMessage = `Error: ${error?.message || error}`
                this.$emit('error', error)
                await this.cleanup()
            } finally {
                this.connecting = false
            }
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
            this.activeRoom = null
            this.statusMessage = 'Idle'
            this.resetParticipants()
            this.connecting = false
        },
        resetParticipants() {
            this.participantMap.clear()
            this.refreshParticipants()
        },
        refreshParticipants() {
            this.participants = Array.from(this.participantMap.values())
        },
        trackSubscription(subscription) {
            if (!subscription) return
            if (typeof subscription === 'function') {
                this.unsubscribeFns.push(subscription)
            } else if (typeof subscription.unsubscribe === 'function') {
                this.unsubscribeFns.push(() => subscription.unsubscribe())
            }
        },
        participantLabel(participant) {
            const display = participant.display || `User ${participant.id}`
            return participant.id === this.participantId
                ? `${display} (you)`
                : display
        },
        participantStatusText(participant) {
            if (participant.suspended) return 'Suspended'
            if (participant.talking) return 'Speaking'
            if (participant.muted) return 'Muted'
            return 'Listening'
        },
        participantStatusClass(participant) {
            if (participant.suspended) return 'text-rose-300'
            if (participant.talking) return 'text-emerald-300'
            if (participant.muted) return 'text-slate-400'
            return 'text-slate-500'
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
                    setup: parseBoolean(
                        participant.setup,
                        existing.setup ?? true
                    ),
                    muted: parseBoolean(
                        participant.muted,
                        existing.muted ?? false
                    ),
                    talking: parseBoolean(
                        participant.talking,
                        existing.talking ?? false
                    ),
                    suspended: parseBoolean(
                        participant.suspended,
                        existing.suspended ?? false
                    ),
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
                this.statusMessage = 'Room destroyed'
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
            this.hasJoined = true
            this.participantId = normalizeId(message.id)
            this.activeRoom = message.room ?? this.normalizedRoom
            this.handleParticipantsList(message.participants || [])
            this.statusMessage = 'Connected. Publishing audio…'
            await this.startPublisher()
        },
        handleAudioBridgeRoomChanged(message) {
            this.activeRoom = message.room ?? this.normalizedRoom
            this.participantId = normalizeId(message.id)
            this.handleParticipantsList(message.participants || [], {
                replace: true,
            })
        },
        handleAudioBridgeEvent(message) {
            if (Array.isArray(message.participants)) {
                this.handleParticipantsList(message.participants)
            } else if (message.participant) {
                this.handleParticipantsList([message.participant])
            }
            if (message.leaving) {
                this.removeParticipant(message.leaving)
            }
            if (message.error) {
                if (message.error_code === 485) {
                    this.statusMessage = `Room ${this.normalizedRoom} does not exist`
                } else {
                    this.statusMessage = `Error: ${message.error}`
                }
            }
            if (message.suspended != null) {
                const suspendedId = normalizeId(message.suspended)
                if (suspendedId === this.participantId) {
                    this.audioSuspended = true
                }
                if (suspendedId !== null && suspendedId !== 'ok') {
                    const record = this.participantMap.get(suspendedId)
                    if (record) {
                        this.participantMap.set(suspendedId, {
                            ...record,
                            suspended: true,
                        })
                        this.refreshParticipants()
                    }
                }
            }
            if (message.resumed === true) {
                this.audioSuspended = false
                if (Array.isArray(message.participants)) {
                    this.handleParticipantsList(message.participants, {
                        replace: true,
                    })
                }
            } else if (message.resumed != null) {
                const resumedId = normalizeId(message.resumed)
                if (resumedId === this.participantId) {
                    this.audioSuspended = false
                }
                if (resumedId !== null && resumedId !== 'ok') {
                    const record = this.participantMap.get(resumedId)
                    if (record) {
                        this.participantMap.set(resumedId, {
                            ...record,
                            suspended: false,
                        })
                        this.refreshParticipants()
                    }
                }
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
                if (
                    this.stereo &&
                    offer?.sdp &&
                    !offer.sdp.includes('stereo=1')
                ) {
                    const updatedSdp = offer.sdp.replace(
                        /useinbandfec=1/g,
                        'useinbandfec=1;stereo=1'
                    )
                    offer = new RTCSessionDescription({
                        type: offer.type,
                        sdp: updatedSdp,
                    })
                }
                await this.plugin.configure({
                    offer,
                    muted: false,
                })
                this.audioEnabled = true
                this.statusMessage = 'Awaiting mixed audio…'
            } catch (error) {
                console.error('Failed to start audio publishing', error)
                this.statusMessage = `WebRTC error: ${error?.message || error}`
                window.alert(`WebRTC error: ${error?.message || error}`)
                this.webrtcUp = false
                this.spinnerVisible = false
            }
        },
        handleLocalTrack({ track, on }) {
            if (!track || track.kind !== 'audio') return
            if (!on) {
                this.webrtcUp = false
            }
        },
        handleRemoteTrack({ track, on }) {
            if (!track || track.kind !== 'audio') return
            if (!on) {
                if (this.remoteStream) {
                    const current = this.remoteStream
                    current
                        .getAudioTracks()
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
            stream
                .getAudioTracks()
                .forEach((existing) => stream.removeTrack(existing))
            stream.addTrack(track)
            this.remoteStream = stream
            this.audioEnabled = true
            this.statusMessage = 'Receiving mixed audio'
        },
        handlePluginCleanup() {
            this.webrtcUp = false
            this.audioEnabled = false
            this.audioSuspended = false
            this.remoteStream = null
            this.spinnerVisible = false
            this.statusMessage = 'Plugin cleanup complete'
            this.refreshParticipants()
        },
        async handleToggleAudio() {
            if (!this.plugin || !this.hasJoined || !this.webrtcUp) return
            try {
                this.audioEnabled = !this.audioEnabled
                await this.plugin.configure({ muted: !this.audioEnabled })
                this.statusMessage = this.audioEnabled
                    ? 'Audio unmuted'
                    : 'Audio muted'
            } catch (error) {
                console.error('Failed to toggle audio', error)
                this.statusMessage = 'Audio toggle failed'
                this.audioEnabled = !this.audioEnabled
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
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
    background-color: #1f2937;
    color: #f8fafc;
}

.btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 18px -12px rgba(15, 23, 42, 0.65);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.portable-bridge {
    width: 100%;
    max-width: 32rem;
}
</style>
