import Janus, { Controllers, DetachOptions, JSEP, PluginCreateAnswerParam, OfferParams, PluginHandle, PluginMessage, WebRTCInfo, PluginReplaceTracksParam, TrackDesc, DataParams } from './interfaces/janus';
import { JanusSession } from './janus_session';
export declare class JanusPlugin implements PluginHandle {
    protected statsReportHookTimer: any;
    protected controllers: Controllers;
    protected instance: Janus;
    static identifier: string;
    protected handle: PluginHandle;
    protected session: JanusSession;
    protected mediaRecorder: MediaRecorder;
    plugin: string;
    id: string;
    token?: string;
    detached: boolean;
    webrtcStuff: WebRTCInfo;
    recording: boolean;
    statsQueryInterval: number;
    constructor(instance: Janus, session: JanusSession, handle: PluginHandle, controllers: Controllers);
    protected promisify<T>(functionCall: any, ...parameters: any[]): Promise<T>;
    replaceTracks(options: Pick<PluginReplaceTracksParam, 'tracks'>): Promise<void>;
    getVolume(mid: string): Promise<number>;
    getRemoteVolume(mid: string): Promise<number>;
    getLocalVolume(mid: string): Promise<number>;
    isAudioMuted(): boolean;
    muteAudio(): void;
    unmuteAudio(): void;
    isVideoMuted(): boolean;
    muteVideo(): void;
    unmuteVideo(): void;
    getBitrate(): string;
    setMaxBitrate(bitrate: number): void;
    getLocalTracks(): TrackDesc[];
    getRemoteTracks(): TrackDesc[];
    recordingTimeSlice?: number;
    protected handleRecordingSetup(controllers: Controllers): void;
    sendTrickle(): Promise<void>;
    protected handleStatsHook(plugin: PluginHandle, controllers: Controllers, mediaStreamTrack?: MediaStreamTrack): number;
    get recorder(): MediaRecorder;
    get onRecordingData(): import("rxjs").Observable<{
        blob: Blob;
        chunkNumber: number;
    }>;
    get onStatReports(): import("rxjs").Observable<any[]>;
    get onMessage(): import("rxjs").Observable<{
        message: import("./interfaces/janus").MessageCallback | any;
        jsep: JSEP;
    }>;
    get onLocalTrack(): import("rxjs").Observable<{
        track: MediaStreamTrack;
        on: boolean;
    }>;
    get onData(): import("rxjs").Observable<any>;
    get onError(): import("rxjs").Observable<any>;
    get onRemoteTrack(): import("rxjs").Observable<{
        track: MediaStreamTrack;
        on: boolean;
        mid: string;
    }>;
    get onMediaState(): import("rxjs").Observable<{
        medium: "audio" | "video";
        recieving: boolean;
        mid: number;
    }>;
    get onSlowLink(): import("rxjs").Observable<{
        uplink: boolean;
        lost: number;
        mid: string;
    }>;
    get onWebRTCState(): import("rxjs").Observable<boolean>;
    get onIceState(): import("rxjs").Observable<"connected" | "failed" | "disconnected" | "closed">;
    get onDataOpen(): import("rxjs").Observable<void>;
    get onDetached(): import("rxjs").Observable<void>;
    get onCleanup(): import("rxjs").Observable<void>;
    getId(): string;
    getPlugin(): string;
    send(message: Omit<PluginMessage, 'success' | 'error'>): Promise<any>;
    createOffer(params: Omit<OfferParams, 'success' | 'error'>): Promise<RTCSessionDescription>;
    createAnswer(params: Omit<PluginCreateAnswerParam, 'success' | 'error'>): Promise<RTCSessionDescription>;
    data(params: DataParams): Promise<void>;
    handleRemoteJsep(params: {
        jsep: JSEP;
    }): Promise<void>;
    dtmf(params: any): void;
    hangup(sendRequest?: boolean): Promise<void>;
    detach(params?: Omit<DetachOptions, 'success' | 'error'>): Promise<void>;
    stopCollectingStats(): void;
}
export declare abstract class JanusPlugins {
    static VIDEO_ROOM: string;
    static VIDEO_CALL: string;
    static AUDIO_BRIDGE: string;
    static SIP: string;
    static STREAMING: string;
    static ECHO_TEST: string;
}
//# sourceMappingURL=janus_plugin.d.ts.map