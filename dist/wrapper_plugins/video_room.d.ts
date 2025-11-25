import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { JanusPlugin } from '../janus_plugin'
import { JanusSession } from '../janus_session'
export interface UpdateAsSubscriberStream {
    feed: any
    mid?: any
    crossrefid?: any
}
export declare class JanusVideoRoomPlugin extends JanusPlugin {
    static identifier: string
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    )
    createRoom(options?: {
        room?: number
        permanent?: boolean
        description?: string
        secret?: string
        pin?: string
        is_private?: boolean
        allowed?: string[]
    }): Promise<any>
    joinRoomAsPublisher(
        roomId: string | number,
        options: {
            token?: string
            display?: string
            id?: string
        }
    ): Promise<any>
    listParticipants(room: string | number): Promise<any>
    joinRoomAsSubscriber(
        room: string | number,
        options: {
            feed_id?: number
            private_id?: number
            streams?: {
                feed: number
                mid: number
            }[]
        }
    ): Promise<any>
    startAsSubscriber(answer: RTCSessionDescription): Promise<any>
    publishAsPublisher(
        offer: RTCSessionDescription,
        options: {
            audiocodec?: string
            videocodec?: string
            bitrate?: number
            record?: boolean
            filename?: string
            display?: string
            audio_level_average?: number
            audio_active_packets?: number
            descriptions?: {
                mid: number
                description: string
            }[]
        }
    ): Promise<any>
    unpublishAsPublisher(): Promise<any>
    updateAsSubscriber({
        subscribe,
        unsubscribe,
    }: {
        subscribe: UpdateAsSubscriberStream[] | undefined
        unsubscribe: UpdateAsSubscriberStream[] | undefined
    }): Promise<any>
    leave(): Promise<any>
}
//# sourceMappingURL=video_room.d.ts.map
