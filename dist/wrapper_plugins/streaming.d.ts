import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { StreamingListResponse } from '../interfaces/plugins/streaming'
import { JanusPlugin } from '../janus_plugin'
import { JanusSession } from '../janus_session'
export declare class JanusStreamingPlugin extends JanusPlugin {
    static identifier: string
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    )
    list(): Promise<StreamingListResponse[]>
    info(id: number | string, secret?: string | undefined): Promise<any>
}
//# sourceMappingURL=streaming.d.ts.map
