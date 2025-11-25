import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { JanusPlugin } from '../janus_plugin'
import { JanusSession } from '../janus_session'
export declare class JanusVideoCallPlugin extends JanusPlugin {
    static identifier: string
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    )
    /**
     * Register user to videocall plugin to make or recieve a call from another registered user
     * @param {string} username - username of the user to call
     * */
    register(username: string): Promise<void>
    /**
     * Register user to videocall plugin to make or recieve a call from another registered user
     * @param {string} username - username of the user to call
     * @param {RTCSessionDescription} offer- webrtc offer of your choice
     * */
    call(username: string, offer?: RTCSessionDescription): Promise<void>
}
//# sourceMappingURL=video_call.d.ts.map
