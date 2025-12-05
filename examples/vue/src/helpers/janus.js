import { JanusJs } from 'typed_janus_js'

export const createJanusConnection = async ({
    server,
    debug = false,
    iceServers,
    token,
    apisecret,
    apiSecret,
    protocol,
}) => {
    if (!server) {
        throw new Error('Janus server URL is required')
    }
    const janusOptions = {
        server,
    }
    if (iceServers) {
        janusOptions.iceServers = iceServers
    }
    if (token) {
        janusOptions.token = token
    }
    if (apisecret) {
        janusOptions.apisecret = apisecret
    }
    if (apiSecret) {
        janusOptions.apiSecret = apiSecret
    }
    if (protocol) {
        janusOptions.protocol = protocol
    }
    const janus = new JanusJs(janusOptions)
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
