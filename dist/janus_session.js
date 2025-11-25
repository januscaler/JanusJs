var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i]
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p]
                }
                return t
            }
        return __assign.apply(this, arguments)
    }
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected)
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            )
        })
    }
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1]
                    return t[1]
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g = Object.create(
                (typeof Iterator === 'function' ? Iterator : Object).prototype
            )
        return (
            (g.next = verb(0)),
            (g['throw'] = verb(1)),
            (g['return'] = verb(2)),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function () {
                    return this
                }),
            g
        )
        function verb(n) {
            return function (v) {
                return step([n, v])
            }
        }
        function step(op) {
            if (f) throw new TypeError('Generator is already executing.')
            while ((g && ((g = 0), op[0] && (_ = 0)), _))
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y['return']
                                    : op[0]
                                      ? y['throw'] ||
                                        ((t = y['return']) && t.call(y), 0)
                                      : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t
                    if (((y = 0), t)) op = [op[0] & 2, t.value]
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op
                            break
                        case 4:
                            _.label++
                            return { value: op[1], done: false }
                        case 5:
                            _.label++
                            y = op[1]
                            op = [0]
                            continue
                        case 7:
                            op = _.ops.pop()
                            _.trys.pop()
                            continue
                        default:
                            if (
                                !((t = _.trys),
                                (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0
                                continue
                            }
                            if (
                                op[0] === 3 &&
                                (!t || (op[1] > t[0] && op[1] < t[3]))
                            ) {
                                _.label = op[1]
                                break
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1]
                                t = op
                                break
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2]
                                _.ops.push(op)
                                break
                            }
                            if (t[2]) _.ops.pop()
                            _.trys.pop()
                            continue
                    }
                    op = body.call(thisArg, _)
                } catch (e) {
                    op = [6, e]
                    y = 0
                } finally {
                    f = t = 0
                }
            if (op[0] & 5) throw op[1]
            return { value: op[0] ? op[1] : void 0, done: true }
        }
    }
import { Subject } from 'rxjs'
import _ from 'lodash'
import { BehaviorSubject } from 'rxjs'
var JanusSession = /** @class */ (function () {
    function JanusSession(instance) {
        this.instance = instance
    }
    JanusSession.prototype.getServer = function () {
        return this.instance.getServer()
    }
    JanusSession.prototype.isConnected = function () {
        return this.instance.isConnected()
    }
    JanusSession.prototype.getSessionId = function () {
        return this.instance.getSessionId()
    }
    JanusSession.prototype.getObservableControllers = function (options) {
        var finalOptions = __assign({}, options)
        var controllers = {
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
        finalOptions.onmessage = function (message, jsep) {
            controllers.onMessageController.next({
                message: message,
                jsep: jsep,
            })
        }
        finalOptions.onlocaltrack = function (track, on) {
            controllers.onLocalTrackController.next({ on: on, track: track })
        }
        finalOptions.onremotetrack = function (track, mid, on) {
            controllers.onRemoteTrackController.next({
                on: on,
                track: track,
                mid: mid,
            })
        }
        finalOptions.ondata = function (data) {
            controllers.onDataController.next(data)
        }
        finalOptions.error = function (error) {
            controllers.onErrorController.next(error)
        }
        finalOptions.mediaState = function (medium, recieving, mid) {
            controllers.onMediaStateController.next({
                medium: medium,
                recieving: recieving,
                mid: mid,
            })
        }
        finalOptions.slowLink = function (uplink, lost, mid) {
            controllers.onSlowLinkController.next({
                uplink: uplink,
                lost: lost,
                mid: mid,
            })
        }
        finalOptions.webrtcState = function (isConnected) {
            controllers.onWebRTCStateController.next(isConnected)
        }
        finalOptions.iceState = function (state) {
            controllers.onIceStateController.next(state)
        }
        finalOptions.ondataopen = function () {
            controllers.onDataOpenController.next()
        }
        finalOptions.ondetached = function () {
            controllers.onDetachedController.next()
        }
        finalOptions.oncleanup = function () {
            controllers.onCleanupController.next()
        }
        return { finalOptions: finalOptions, controllers: controllers }
    }
    JanusSession.prototype.cast = function (t) {
        return t
    }
    JanusSession.prototype.attach = function (classToCreate, options) {
        var _this = this
        var opts = __assign(__assign({}, options), {
            plugin: classToCreate.identifier,
        })
        var _a = this.getObservableControllers(opts),
            controllers = _a.controllers,
            finalOptions = _a.finalOptions
        return new Promise(function (resolve, reject) {
            finalOptions.success = function (plugin) {
                var pluginHandle = new classToCreate(
                    _this.instance,
                    _this,
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
            finalOptions.error = function (error) {
                reject(error)
            }
            _this.instance.attach(finalOptions)
        })
    }
    JanusSession.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this
            return __generator(this, function (_a) {
                return [
                    2 /*return*/,
                    new Promise(function (resolve, reject) {
                        _this.instance.reconnect({
                            success: function () {
                                resolve(true)
                            },
                            error: function (err) {
                                reject(err)
                            },
                        })
                    }),
                ]
            })
        })
    }
    JanusSession.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this
            return __generator(this, function (_a) {
                return [
                    2 /*return*/,
                    new Promise(function (resolve, reject) {
                        _this.instance.getInfo({
                            success: function (info) {
                                resolve(info)
                            },
                            error: function (err) {
                                reject(err)
                            },
                        })
                    }),
                ]
            })
        })
    }
    JanusSession.prototype.destroy = function (callbacks) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this
            return __generator(this, function (_a) {
                return [
                    2 /*return*/,
                    new Promise(function (resolve, reject) {
                        _this.instance.destroy(
                            __assign(__assign({}, callbacks), {
                                success: function () {
                                    resolve()
                                },
                                error: function (err) {
                                    reject(err)
                                },
                            })
                        )
                    }),
                ]
            })
        })
    }
    return JanusSession
})()
export { JanusSession }
