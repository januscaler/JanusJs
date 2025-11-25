const defaultLogLimit = 200

export const $ = (selector, scope = document) => scope.querySelector(selector)
export const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector))

export const setText = (element, text) => {
    if (!element) return
    element.textContent = text ?? ''
}

export const setHTML = (element, html) => {
    if (!element) return
    element.innerHTML = html ?? ''
}

export const setDisabled = (element, disabled = true) => {
    if (!element) return
    element.disabled = !!disabled
}

export const toggleHidden = (element, hidden) => {
    if (!element) return
    element.classList.toggle('hidden', hidden)
}

export const appendLogLine = (
    container,
    message,
    { level = 'info', limit = defaultLogLimit } = {}
) => {
    if (!container) return
    const entry = document.createElement('div')
    entry.dataset.level = level
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
    container.appendChild(entry)
    while (container.childElementCount > limit) {
        container.firstElementChild.remove()
    }
    container.scrollTop = container.scrollHeight
}

export const clearChildren = (element) => {
    if (!element) return
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

export const createOption = (value, label = value) => {
    const option = document.createElement('option')
    option.value = value
    option.label = label
    option.textContent = label
    return option
}

export const renderList = (container, items, renderItem) => {
    if (!container) return
    clearChildren(container)
    items.forEach((item) => {
        const node = renderItem(item)
        if (node) {
            container.appendChild(node)
        }
    })
}

export const formatBitrate = (bitrate) => {
    if (!bitrate && bitrate !== 0) return 'n/a'
    const kbps = Math.round(bitrate / 1024)
    return `${kbps} kbps`
}

export const ensureMediaElement = (
    container,
    { id, kind = 'video', autoplay = true, muted = false }
) => {
    if (!container) return null
    let element = container.querySelector(`#${id}`)
    if (!element) {
        element = document.createElement(kind)
        element.id = id
        element.autoplay = autoplay
        element.playsInline = true
        element.controls = kind === 'audio'
        element.muted = muted
        container.appendChild(element)
    }
    return element
}
