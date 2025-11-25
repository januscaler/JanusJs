<template>
    <div class="relative">
        <main class="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 lg:px-8">
            <header class="panel">
                <div
                    class="panel-body flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
                >
                    <div class="space-y-2">
                        <p
                            class="text-xs uppercase tracking-[0.3em] text-slate-400"
                        >
                            Portable Demo
                        </p>
                        <h1
                            class="text-3xl font-bold tracking-tight text-white md:text-4xl"
                        >
                            Audio Bridge Portable Widget
                        </h1>
                        <p class="max-w-2xl text-sm text-slate-300">
                            Experiment with the lightweight
                            <code
                                class="bg-slate-900/80 px-1 text-xs text-sky-300"
                                >AudioBridgePortable</code
                            >
                            component. Provide a display name, choose a room,
                            and it will automatically connect to the configured
                            Janus server and mix remote audio for you.
                        </p>
                    </div>
                    <div
                        class="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 text-xs text-slate-300"
                    >
                        <p class="font-semibold text-slate-200">
                            Current Gateway
                        </p>
                        <p class="truncate text-sky-300">{{ janusServer }}</p>
                    </div>
                </div>
            </header>

            <section class="panel">
                <div class="panel-body space-y-6">
                    <form
                        class="grid gap-4 sm:grid-cols-[1fr_minmax(120px,200px)_auto]"
                        @submit.prevent="handleApply"
                    >
                        <label class="flex w-full flex-col gap-2">
                            <span
                                class="text-xs uppercase tracking-wide text-slate-400"
                                >Display Name</span
                            >
                            <input
                                v-model.trim="displayNameInput"
                                class="rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-base text-white outline-none focus:border-sky-500"
                                type="text"
                                placeholder="Alphanumeric only"
                                autocomplete="off"
                            />
                        </label>
                        <label class="flex w-full flex-col gap-2">
                            <span
                                class="text-xs uppercase tracking-wide text-slate-400"
                                >Room</span
                            >
                            <input
                                v-model="roomInput"
                                class="rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-base text-white outline-none focus:border-sky-500"
                                type="number"
                                min="1"
                                step="1"
                            />
                        </label>
                        <div class="flex items-end gap-2">
                            <button type="submit" class="btn btn-primary">
                                Apply
                            </button>
                            <button
                                type="button"
                                class="btn btn-secondary"
                                @click="randomizeDisplayName"
                            >
                                Randomize
                            </button>
                        </div>
                    </form>
                    <p v-if="errorMessage" class="text-sm text-rose-300">
                        {{ errorMessage }}
                    </p>
                    <div
                        class="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 text-xs text-slate-400"
                    >
                        <p>
                            Change the display name or room and click
                            <strong class="text-slate-200">Apply</strong> to
                            reconnect the portable widget below. The component
                            handles reconnections automatically when its props
                            change.
                        </p>
                    </div>
                </div>
            </section>

            <section class="flex justify-center">
                <AudioBridgePortable
                    class="w-full max-w-2xl"
                    :janus-server="janusServer"
                    :room="currentRoom"
                    :display-name="currentDisplayName"
                    :audio-codec="audioCodec"
                    :stereo="stereo"
                    :group="group"
                    :debug="debug"
                />
            </section>
        </main>
    </div>
</template>

<script>
import AudioBridgePortable from '../components/AudioBridgePortable.vue'

const DEFAULT_ROOM = 1234

const toRoomNumber = (value) => {
    if (value === null || value === undefined || value === '') {
        return DEFAULT_ROOM
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? DEFAULT_ROOM : parsed
}

const generateHandle = () => `Guest${Math.floor(Math.random() * 9000 + 1000)}`

export default {
    name: 'PortableDemo',
    components: {
        AudioBridgePortable,
    },
    data() {
        const initialHandle = generateHandle()
        return {
            janusServer: 'wss://janus1.januscaler.com/janus/ws',
            roomInput: DEFAULT_ROOM,
            displayNameInput: initialHandle,
            currentRoom: DEFAULT_ROOM,
            currentDisplayName: initialHandle,
            audioCodec: null,
            stereo: false,
            group: null,
            debug: false,
            errorMessage: '',
        }
    },
    methods: {
        handleApply() {
            const name = this.displayNameInput.trim()
            if (!name) {
                this.errorMessage = 'Display name is required.'
                return
            }
            if (!/^[a-zA-Z0-9]+$/.test(name)) {
                this.errorMessage = 'Display name must be alphanumeric.'
                return
            }
            const room = toRoomNumber(this.roomInput)
            if (!Number.isInteger(room) || room <= 0) {
                this.errorMessage = 'Room must be a positive integer.'
                return
            }
            this.errorMessage = ''
            this.currentDisplayName = name
            this.currentRoom = room
        },
        randomizeDisplayName() {
            this.displayNameInput = generateHandle()
            this.handleApply()
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
</style>
