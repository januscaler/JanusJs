<template>
    <main class="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:px-8">
        <section class="panel">
            <div class="panel-body space-y-6">
                <div class="space-y-3">
                    <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Janus Gateway</p>
                    <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        WebRTC playground for typed_janus_js examples
                    </h1>
                    <p class="max-w-3xl text-sm text-slate-300">
                        Explore ready-to-run demos powered by Janus Gateway and the <code class="bg-slate-900/80 px-1 text-xs text-sky-300">typed_janus_js</code>
                        client. Each example showcases a different plugin integration, from audio conferencing to advanced
                        multistream video rooms with simulcast and SVC enabled.
                    </p>
                </div>
                <div class="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span class="badge bg-secondary">Simulcast &amp; SVC ready</span>
                    <span class="badge bg-info">SPA powered by Vue</span>
                    <span class="badge bg-warning">Tailwind-inspired UI</span>
                </div>
            </div>
        </section>

        <section class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <article class="panel">
                <div class="panel-body space-y-4">
                    <div class="space-y-1">
                        <h2 class="text-xl font-semibold text-white">Audio Bridge</h2>
                        <p class="text-sm text-slate-300">
                            Join a mixed audio room, control mute/suspend states, and monitor participant activity in real time.
                        </p>
                    </div>
                    <router-link class="btn btn-primary w-full justify-center" to="/audiobridge">
                        Launch Audio Bridge
                    </router-link>
                </div>
            </article>

            <article class="panel">
                <div class="panel-body space-y-4">
                    <div class="space-y-1">
                        <h2 class="text-xl font-semibold text-white">Video Room</h2>
                        <p class="text-sm text-slate-300">
                            Publish local audio/video with simulcast, subscribe to remote publishers, and inspect bitrate and layer stats.
                        </p>
                    </div>
                    <router-link class="btn btn-primary w-full justify-center" to="/videoroom">
                        Launch Video Room
                    </router-link>
                </div>
            </article>

            <article class="panel">
                <div class="panel-body space-y-4">
                    <div class="space-y-1">
                        <h2 class="text-xl font-semibold text-white">Portable Widget</h2>
                        <p class="text-sm text-slate-300">
                            Embed the lightweight AudioBridgePortable component anywhere and auto-connect with minimal wiring.
                        </p>
                    </div>
                    <router-link class="btn btn-primary w-full justify-center" to="/portable">
                        View Portable Demo
                    </router-link>
                </div>
            </article>
        </section>
    </main>
</template>

<script>
export default {
    name: 'HomeComponent',
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

.bg-secondary {
    background-color: #475569;
    color: #f8fafc;
}

.bg-info {
    background-color: #0ea5e9;
    color: #f8fafc;
}

.bg-warning {
    background-color: #facc15;
    color: #111827;
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
</style>
