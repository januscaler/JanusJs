import { JanusJs } from 'typed_janus_js'

export const createJanusConnection = async ({ server, debug = false }) => {
    const janus = new JanusJs({ server })
    await janus.init({ debug })
    const session = await janus.createSession()
    return { janus, session }
}

export const applyRemoteJsep = async (plugin, jsep) => {
    if (!plugin || !jsep) return
    await plugin.handleRemoteJsep({ jsep })
}

export const stopPluginWebrtc = async (plugin) => {
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
