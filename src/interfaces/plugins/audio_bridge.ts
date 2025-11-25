import { BasicMessageBody } from '.'
export interface AudioBridgeCreateOptions {
    id?: string | number
    permanent: boolean
    description?: string
    secret?: string
    pin?: string
    is_private?: boolean
    allowed?: string[]
    sampling_rate?: number
    spatial_audio?: boolean
    audiolevel_ext?: boolean
    audiolevel_event?: boolean
    audio_active_packets?: number
    audio_level_average?: number
    default_prebuffering?: number
    default_expectedloss?: number
    default_bitrate?: number
    record?: boolean
    record_file?: string
    record_dir?: string
    mjrs?: boolean
    mjrs_dir?: string
    allow_rtp_participants?: boolean
    groups?: string[]
}
export interface AudioBridgeCreateRoomPayload {
    request: 'create' | 'edit'
    id: string | number
    room: string | number
    permanent: boolean
    description: string
    secret: string
    pin: string
    is_private: boolean
    allowed: string[]
    sampling_rate: number
    spatial_audio: boolean
    audiolevel_ext: boolean
    audiolevel_event: boolean
    audio_active_packets: number
    audio_level_average: number
    default_prebuffering: number
    default_expectedloss: number
    default_bitrate: number
    record: boolean
    record_file: string
    record_dir: string
    mjrs: boolean
    mjrs_dir: string
    allow_rtp_participants: boolean
    groups: string[]
}
export interface AudioBridgeCreateRoomBody extends BasicMessageBody {
    body: AudioBridgeCreateRoomPayload
}
