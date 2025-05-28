import { Subject } from 'rxjs'
import Janus, { JanusJS } from '../js/janus'
import _ from 'lodash'
import { Controllers } from './interfaces/janus'
import { JanusPlugin } from './janus_plugin'
import { BehaviorSubject } from 'rxjs'

export class JanusSession {
    protected instance: Janus

    constructor(instance: Janus) {
        this.instance = instance
    }

    getServer(): string {
        return this.instance.getServer()
    }
    isConnected(): boolean {
        return this.instance.isConnected()
    }

    getSessionId(): number {
        return this.instance.getSessionId()
    }
    private getObservableControllers(
        options: Pick<JanusJS.PluginOptions, 'plugin' | 'opaqueId'>
    ) {
        const finalOptions: JanusJS.PluginOptions = { ...options }
        const controllers: Controllers = {
            onRecordingDataController: new Subject(),
            onStatReportsController: new Subject(),
            onMessageController: new Subject(),
            onLocalTrackController: new BehaviorSubject(null),
            onRemoteTrackController: new Subject(),
            onDataController: new BehaviorSubject(null),
            onErrorController: new BehaviorSubject(null),
            onMediaStateController: new BehaviorSubject(null),
            onIceStateController: new BehaviorSubject(null),
            onSlowLinkController: new BehaviorSubject(null),
            onWebRTCStateController: new BehaviorSubject(null),
            onCleanupController: new BehaviorSubject(null),
            onDataOpenController: new BehaviorSubject(null),
            onDetachedController: new BehaviorSubject(null),
        }
        finalOptions.onmessage = (message: any, jsep: JanusJS.JSEP) => {
            controllers.onMessageController.next({ message, jsep })
        }
        finalOptions.onlocaltrack = (track, on) => {
            controllers.onLocalTrackController.next({ on, track })
        }
        finalOptions.onremotetrack = (track, mid, on) => {
            controllers.onRemoteTrackController.next({ on, track, mid })
        }
        finalOptions.ondata = (data: any) => {
            controllers.onDataController.next(data)
        }
        finalOptions.error = (error) => {
            controllers.onErrorController.next(error)
        }
        finalOptions.mediaState = (medium, recieving, mid) => {
            controllers.onMediaStateController.next({ medium, recieving, mid })
        }
        finalOptions.slowLink = (uplink, lost, mid) => {
            controllers.onSlowLinkController.next({ uplink, lost, mid })
        }
        finalOptions.webrtcState = (isConnected) => {
            controllers.onWebRTCStateController.next(isConnected)
        }
        finalOptions.iceState = (state) => {
            controllers.onIceStateController.next(state)
        }
        finalOptions.ondataopen = () => {
            controllers.onDataOpenController.next()
        }
        finalOptions.ondetached = () => {
            controllers.onDetachedController.next()
        }
        finalOptions.oncleanup = () => {
            controllers.onCleanupController.next()
        }
        return { finalOptions, controllers }
    }

    cast<T>(t: T): T {
        return t as T
    }
    attach<T extends JanusPlugin>(
        classToCreate: new (...args: any) => T,
        options: Pick<JanusJS.PluginOptions, 'opaqueId'>
    ): Promise<T> {
        const opts: Pick<JanusJS.PluginOptions, 'plugin' | 'opaqueId'> = {
            ...options,
            plugin: (classToCreate as any).identifier,
        }
        const { controllers, finalOptions } =
            this.getObservableControllers(opts)
        return new Promise<T>((resolve, reject) => {
            finalOptions.success = (plugin: JanusJS.PluginHandle) => {
                const pluginHandle = new (classToCreate as any)(
                    this.instance,
                    this,
                    plugin,
                    controllers
                )
                _.assign(
                    pluginHandle,
                    _.omit(plugin, [
                        'data',
                        'send',
                        'createAnswer',
                        'createOffer',
                    ])
                )
                resolve(pluginHandle)
            }
            finalOptions.error = (error: any) => {
                reject(error)
            }
            this.instance.attach(finalOptions)
        })
    }

    async reconnect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.instance.reconnect({
                success() {
                    resolve(true)
                },
                error(err: any) {
                    reject(err)
                },
            })
        })
    }
    async getInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.instance.getInfo({
                success(info: any) {
                    resolve(info)
                },
                error(err: any) {
                    reject(err)
                },
            })
        })
    }
    async destroy(
        callbacks: Omit<JanusJS.DestroyOptions, 'success' | 'error'>
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.instance.destroy({
                ...callbacks,
                success: () => {
                    resolve()
                },
                error: (err: any) => {
                    reject(err)
                },
            })
        })
    }
}
