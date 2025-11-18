import { JanusJs } from 'typed_janus_js'

export const createJanusConnection = async ({ server, debug = false }) => {
    const janus = new JanusJs({ server })
    await janus.init({ debug })
    const session = await janus.createSession()
    return { janus, session }
}

export const attachPlugin = async (session, Plugin, options = {}) => {
    if (!session) throw new Error('Session not ready')
    return session.attach(Plugin, options)
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
    } catch (err) {
        console.warn('hangup failed', err)
    }
    try {
        await plugin.detach()
    } catch (err) {
        console.warn('detach failed', err)
    }
}

export const stopJanusConnection = async ({ session }) => {
    try {
        if (session) {
            await session.destroy({})
        }
    } catch (err) {
        console.warn('session destroy failed', err)
    }
}
