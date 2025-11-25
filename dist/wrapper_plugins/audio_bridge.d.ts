import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { AudioBridgeCreateOptions } from '../interfaces/plugins/audio_bridge'
import { JanusPlugin } from '../janus_plugin'
import { JanusSession } from '../janus_session'
export declare class JanusAudioBridgePlugin extends JanusPlugin {
    static identifier: string
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    )
    createRoom(
        room: string | number,
        options: AudioBridgeCreateOptions
    ): Promise<any>
    editRoom(
        room: string | number,
        options: AudioBridgeCreateOptions
    ): Promise<any>
    joinRoom(
        room: string | number,
        {
            id,
            group,
            pin,
            display,
            token,
            muted,
            codec,
            preBuffer,
            bitrate,
            quality,
            expectedLoss,
            volume,
            spatialPosition,
            secret,
            audioLevelAverage,
            audioActivePackets,
            record,
            filename,
        }?: {
            id?: string | number
            group?: string
            pin?: string
            display?: string
            token?: string
            muted?: boolean
            codec?: string
            preBuffer?: any
            bitrate?: number
            quality?: number
            expectedLoss?: number
            volume?: number
            spatialPosition?: number
            secret?: string
            audioLevelAverage?: number
            audioActivePackets?: number
            record?: boolean
            filename?: string
        }
    ): Promise<any>
    configure({
        muted,
        offer,
        display,
        preBuffer,
        bitrate,
        quality,
        expectedLoss,
        volume,
        spatialPosition,
        record,
        filename,
        group,
    }: {
        offer?: RTCSessionDescription
        muted?: boolean
        display?: string
        preBuffer?: number
        bitrate?: number
        quality?: number
        expectedLoss?: number
        volume?: number
        spatialPosition?: number
        record?: boolean
        filename?: string
        group?: string
    }): Promise<any>
}
//# sourceMappingURL=audio_bridge.d.ts.map
