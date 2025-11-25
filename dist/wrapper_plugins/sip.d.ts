import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { JanusPlugin } from '../janus_plugin'
import { JanusSession } from '../janus_session'
export declare class JanusSipPlugin extends JanusPlugin {
    static identifier: string
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    )
    register(
        username: string,
        server: string,
        options: {
            type?: 'guest' | 'helper'
            send_register?: boolean
            force_udp?: boolean
            force_tcp?: boolean
            sips?: boolean
            rfc2543_cancel?: boolean
            secret?: string
            ha1_secret?: string
            authuser?: string
            display_name?: string
            user_agent?: string
            proxy?: string
            outbound_proxy?: string
            headers?: any
            contact_params?: any
            incoming_header_prefixes?: string[]
            refresh?: boolean
            master_id?: string
            register_ttl?: number
        }
    ): Promise<void>
    call(
        uri: string,
        options?: {
            call_id?: string
            refer_id?: string
            headers?: any
            srtp?: string
            srtp_profile?: string
            autoaccept_reinvites?: boolean
            secret?: string
            ha1_secret?: string
            authuser?: string
        },
        offer?: RTCSessionDescription
    ): Promise<void>
    update(offer?: RTCSessionDescription): Promise<void>
    decline(code?: number, headers?: any): Promise<void>
    accept(options?: {
        srtp?: string
        headers: any
        autoaccept_reinvites: boolean
    }): Promise<void>
    hold(direction: 'sendonly' | 'recvonly' | 'inactive'): Promise<void>
    unhold(): Promise<void>
    record(
        action: 'start' | 'stop',
        options?: {
            audio?: boolean
            video?: boolean
            peer_audio?: boolean
            peer_video?: boolean
            filename?: string
        }
    ): Promise<void>
}
//# sourceMappingURL=sip.d.ts.map
