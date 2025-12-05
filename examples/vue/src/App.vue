<template>
    <div id="app" class="min-h-screen bg-slate-950 text-slate-100">
        <AppHeader />
        <router-view />
    </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'

export default {
    name: 'App',
    components: {
        AppHeader,
    },
}
</script>

<style>
html,
body {
    min-height: 100vh;
}

#app {
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        'Helvetica Neue',
        Arial,
        'Noto Sans',
        sans-serif;
}
</style>
