<template>
    <header class="app-header">
        <div class="header-container">
            <router-link class="brand" to="/">
                Janus Vue Examples
            </router-link>
            <nav class="nav-links">
                <router-link
                    v-for="link in links"
                    :key="link.to"
                    class="nav-link"
                    :to="link.to"
                    :exact="link.exact"
                    active-class="is-active"
                >
                    <i v-if="link.icon" :class="['nav-icon', link.icon]"></i>
                    <span>{{ link.label }}</span>
                </router-link>
            </nav>
        </div>
    </header>
</template>

<script>
export default {
    name: 'AppHeader',
    computed: {
        links() {
            return [
                { to: '/', label: 'Home', exact: true, icon: 'fa-solid fa-house' },
                {
                    to: '/audiobridge',
                    label: 'Audio Bridge',
                    exact: false,
                    icon: 'fa-solid fa-wave-square',
                },
                {
                    to: '/videoroom',
                    label: 'Video Room',
                    exact: false,
                    icon: 'fa-solid fa-video',
                },
                {
                    to: '/portable',
                    label: 'Portable Demo',
                    exact: false,
                    icon: 'fa-solid fa-plug',
                },
            ]
        },
    },
}
</script>

<style scoped>
.app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(16px);
    background-color: rgba(15, 23, 42, 0.9);
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.header-container {
    margin: 0 auto;
    max-width: 80rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1rem 1.5rem;
}

.brand {
    font-size: 1.125rem;
    font-weight: 700;
    color: #f8fafc;
    text-decoration: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #cbd5f5;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    padding: 0.4rem 0.75rem;
    border-radius: 9999px;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-link:hover {
    background-color: rgba(30, 64, 175, 0.25);
    color: #f8fafc;
    transform: translateY(-1px);
}

.nav-link.is-active {
    background-color: rgba(14, 165, 233, 0.25);
    color: #38bdf8;
    box-shadow: 0 10px 25px -15px rgba(56, 189, 248, 0.7);
}

.nav-icon {
    font-size: 0.85rem;
}

@media (max-width: 640px) {
    .header-container {
        flex-direction: column;
        align-items: stretch;
    }

    .nav-links {
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
