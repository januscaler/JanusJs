<template>
    <div id="app" class="min-h-screen bg-slate-950 text-slate-100">
        <router-view />
    </div>
</template>

<script>
export default {
    name: 'App',
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
