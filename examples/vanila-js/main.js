import './style.css'

const markActiveLinks = () => {
    const current = window.location.pathname
    document.querySelectorAll('a[data-demo]').forEach((link) => {
        const url = new URL(link.href)
        if (url.pathname === current) {
            link.dataset.active = 'true'
        }
    })
}

markActiveLinks()
