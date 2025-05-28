import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { JanusPlugin, JanusPlugins } from '../janus_plugin'
import { JanusSession } from '../janus_session'

export class JanusVideoCallPlugin extends JanusPlugin {
    static identifier: string = JanusPlugins.VIDEO_CALL
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    ) {
        super(instance, session, handle, controllers)
    }
    /**
     * Register user to videocall plugin to make or recieve a call from another registered user
     * @param {string} username - username of the user to call
     * */
    async register(username: string): Promise<void> {
        await this.send({
            message: {
                request: 'register',
                username: username,
            },
        })
    }

    /**
     * Register user to videocall plugin to make or recieve a call from another registered user
     * @param {string} username - username of the user to call
     * @param {RTCSessionDescription} offer- webrtc offer of your choice
     * */
    async call(
        username: string,
        offer: RTCSessionDescription = null
    ): Promise<void> {
        if (offer === null) {
            offer = await this.createOffer({
                media: {
                    videoSend: true,
                    videoRecv: true,
                    audioSend: true,
                    audioRecv: true,
                },
            })
        }
        await this.send({
            message: {
                request: 'call',
                username: username,
            },
            jsep: offer,
        })
    }
}
