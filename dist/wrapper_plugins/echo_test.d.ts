import Janus, { PluginHandle, Controllers } from '../interfaces/janus'
import { JanusPlugin } from '../janus_plugin'
import { JanusSession } from '../janus_session'
export declare class JanusEchoTestPlugin extends JanusPlugin {
    static identifier: string
    constructor(
        instance: Janus,
        session: JanusSession,
        handle: PluginHandle,
        controllers: Controllers
    )
    boomCall(): void
}
//# sourceMappingURL=echo_test.d.ts.map
