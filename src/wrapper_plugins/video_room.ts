import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { JanusPlugin, JanusPlugins } from '../janus_plugin'
import { JanusSession } from '../janus_session'
import _ from 'lodash'
export interface UpdateAsSubscriberStream {
    feed: any
    mid?: any
    crossrefid?: any
}

export class JanusVideoRoomPlugin extends JanusPlugin {
    static identifier: string = JanusPlugins.VIDEO_ROOM
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    ) {
        super(instance, session, handle, controllers)
    }

    async createRoom(
        options: {
            room?: number
            permanent?: boolean
            description?: string
            secret?: string
            pin?: string
            is_private?: boolean
            allowed?: string[]
        } = {}
    ): Promise<any> {
        const payload = {
            request: 'create',
            ...options,
        }
        return this.send({ message: payload })
    }

    joinRoomAsPublisher(
        roomId: string | number,
        options: {
            token?: string
            display?: string
            id?: string
        }
    ): Promise<any> {
        const payload = {
            request: 'join',
            room: roomId,
            ptype: 'publisher',
            ...options,
        }
        return this.send({ message: payload })
    }

    async listParticipants(room: string | number): Promise<any> {
        const payload = {
            request: 'listparticipants',
            room,
        }
        return this.send({ message: payload })
    }
    async joinRoomAsSubscriber(
        room: string | number,
        options: {
            feed_id?: number
            private_id?: number
            streams?: { feed: number; mid: number }[]
        }
    ): Promise<any> {
        const payload = {
            request: 'join',
            ptype: 'subscriber',
            room,
            ...options,
        }
        return this.send({ message: payload })
    }
    async startAsSubscriber(answer: RTCSessionDescription) {
        const payload = {
            request: 'start',
        }
        return this.send({ message: payload, jsep: answer })
    }

    async publishAsPublisher(
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
            descriptions?: { mid: number; description: string }[]
        }
    ): Promise<any> {
        const payload = {
            request: 'publish',
            ...options,
        }
        return this.send({ message: payload, jsep: offer })
    }
    async unpublishAsPublisher(): Promise<any> {
        const payload = {
            request: 'unpublish',
        }
        return this.send({ message: payload })
    }
    async updateAsSubscriber({
        subscribe,
        unsubscribe,
    }: {
        subscribe: UpdateAsSubscriberStream[] | undefined
        unsubscribe: UpdateAsSubscriberStream[] | undefined
    }): Promise<any> {
        const payload = {
            request: 'update',
            subscribe,
            unsubscribe,
        }
        return this.send({ message: payload })
    }

    async leave(): Promise<any> {
        const payload = {
            request: 'leave',
        }
        return this.send({ message: payload })
    }
}
