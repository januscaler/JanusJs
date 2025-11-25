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
import Janus from '../js/janus'
import adapter from 'webrtc-adapter'
import { JanusSession } from './janus_session'
import _ from 'lodash'
import { Subject } from 'rxjs'
var JanusJs = /** @class */ (function () {
    function JanusJs(options) {
        this.statsQueryInterval = 0
        console.log('JanusJs loaded')
        this.options = options
    }
    JanusJs.isWebrtcSupported = function () {
        return Janus.isWebrtcSupported()
    }
    JanusJs.debug = function () {
        var args = []
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i]
        }
        Janus.debug(args)
    }
    JanusJs.log = function () {
        var args = []
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i]
        }
        Janus.log(args)
    }
    JanusJs.warn = function () {
        var args = []
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i]
        }
        Janus.warn(args)
    }
    JanusJs.error = function () {
        var args = []
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i]
        }
        Janus.error(args)
    }
    JanusJs.randomString = function (length) {
        return Janus.randomString(length)
    }
    JanusJs.attachMediaStream = function (element, stream) {
        Janus.attachMediaStream(element, stream)
    }
    JanusJs.reattachMediaStream = function (to, from) {
        Janus.reattachMediaStream(to, from)
    }
    JanusJs.stopAllTracks = function (stream) {
        Janus.stopAllTracks(stream)
    }
    JanusJs.prototype.init = function () {
        return __awaiter(this, arguments, void 0, function (params) {
            if (params === void 0) {
                params = {
                    debug: 'all',
                    dependencies: Janus.useDefaultDependencies({
                        adapter: adapter,
                    }),
                }
            }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!params.dependencies) {
                            params.dependencies = Janus.useDefaultDependencies({
                                adapter: adapter,
                            })
                        }
                        return [
                            4 /*yield*/,
                            new Promise(function (resolve, reject) {
                                Janus.init(
                                    __assign(__assign({}, params), {
                                        callback: function () {
                                            resolve()
                                        },
                                    })
                                )
                            }),
                        ]
                    case 1:
                        _a.sent()
                        return [2 /*return*/]
                }
            })
        })
    }
    JanusJs.mix = function (audioContext, streams) {
        var dest = audioContext.createMediaStreamDestination()
        streams.forEach(function (stream) {
            dest.context.createMediaStreamSource(stream).connect(dest)
        })
        return dest.stream.getTracks()[0]
    }
    JanusJs.playMediaStream = function (mediaStream) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext
        try {
            var audioContext = new window.AudioContext()
            var audio = new Audio()
            audio.srcObject = mediaStream
            var sourceNode = audioContext.createMediaStreamSource(
                audio.srcObject
            )
            sourceNode.connect(audioContext.destination)
            return audioContext
        } catch (err) {
            JanusJs.error('failed to play media stream', err)
            throw err
        }
    }
    JanusJs.createRecording = function (options) {
        var streams = []
        _.each(options.mediaStreams, function (stream) {
            if (
                stream === null || stream === void 0 ? void 0 : stream.getTracks
            ) {
                _.each(stream.getTracks(), function (track) {
                    streams.push(new MediaStream([track]))
                })
            }
        })
        if (streams.length == 0) {
            return
        }
        var audioContext = new AudioContext()
        var mixedTrack = this.mix(audioContext, streams)
        var mixedStream = new MediaStream([mixedTrack])
        var mediaRecorder = new MediaRecorder(mixedStream)
        var controller = new Subject()
        var totalAudioChunks = 0
        mediaRecorder.ondataavailable = function (event) {
            totalAudioChunks++
            controller.next({
                blob: event.data,
                chunkNumber: totalAudioChunks,
            })
        }
        mediaRecorder.onstop = function (event) {
            controller.next({
                blob: null,
                chunkNumber: totalAudioChunks,
            })
        }
        mediaRecorder.start(options.timeSlice)
        return { mediaRecorder: mediaRecorder, controller: controller }
    }
    JanusJs.prototype.createSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.options.destroyed = function () {
                            if (_this.onDestroyed) {
                                _this.onDestroyed()
                            }
                        }
                        this.options.error = function (err) {
                            if (_this.onError) {
                                _this.onError(err)
                            }
                        }
                        return [
                            4 /*yield*/,
                            new Promise(function (resolve, reject) {
                                _this.options.success = function () {
                                    resolve()
                                }
                                _this.options.error = function (error) {
                                    reject(error)
                                }
                                _this.instance = new Janus(
                                    __assign({}, _this.options)
                                )
                            }),
                        ]
                    case 1:
                        _a.sent()
                        return [2 /*return*/, new JanusSession(this.instance)]
                }
            })
        })
    }
    return JanusJs
})()
export { JanusJs }
