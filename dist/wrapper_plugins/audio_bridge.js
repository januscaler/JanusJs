var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { JanusPlugin, JanusPlugins } from '../janus_plugin';
var JanusAudioBridgePlugin = /** @class */ (function (_super) {
    __extends(JanusAudioBridgePlugin, _super);
    function JanusAudioBridgePlugin(instance, session, handle, controllers) {
        return _super.call(this, instance, session, handle, controllers) || this;
    }
    JanusAudioBridgePlugin.prototype.createRoom = function (room, options) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = __assign({ request: 'create', room: room }, options);
                return [2 /*return*/, this.send({ message: payload })];
            });
        });
    };
    JanusAudioBridgePlugin.prototype.editRoom = function (room, options) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = __assign({ request: 'edit', room: room }, options);
                return [2 /*return*/, this.send({ message: payload })];
            });
        });
    };
    JanusAudioBridgePlugin.prototype.joinRoom = function (room_1) {
        return __awaiter(this, arguments, void 0, function (room, _a) {
            var payload;
            var _b = _a === void 0 ? {} : _a, id = _b.id, group = _b.group, pin = _b.pin, display = _b.display, token = _b.token, muted = _b.muted, codec = _b.codec, preBuffer = _b.preBuffer, bitrate = _b.bitrate, quality = _b.quality, expectedLoss = _b.expectedLoss, volume = _b.volume, spatialPosition = _b.spatialPosition, secret = _b.secret, audioLevelAverage = _b.audioLevelAverage, audioActivePackets = _b.audioActivePackets, record = _b.record, filename = _b.filename;
            return __generator(this, function (_c) {
                payload = {
                    request: 'join',
                    room: room,
                    id: id,
                    group: group,
                    pin: pin,
                    display: display,
                    token: token,
                    muted: muted,
                    codec: codec,
                    prebuffer: preBuffer,
                    bitrate: bitrate,
                    quality: quality,
                    expected_loss: expectedLoss,
                    volume: volume,
                    spatial_position: spatialPosition,
                    secret: secret,
                    audio_level_average: audioLevelAverage,
                    audio_active_packets: audioActivePackets,
                    record: record,
                    filename: filename,
                };
                return [2 /*return*/, this.send({ message: payload })];
            });
        });
    };
    JanusAudioBridgePlugin.prototype.configure = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var payload;
            var muted = _b.muted, offer = _b.offer, display = _b.display, preBuffer = _b.preBuffer, bitrate = _b.bitrate, quality = _b.quality, expectedLoss = _b.expectedLoss, volume = _b.volume, spatialPosition = _b.spatialPosition, record = _b.record, filename = _b.filename, group = _b.group;
            return __generator(this, function (_c) {
                payload = {
                    request: 'configure',
                    muted: muted,
                    display: display,
                    prebuffer: preBuffer,
                    bitrate: bitrate,
                    quality: quality,
                    expected_loss: expectedLoss,
                    volume: volume,
                    spatial_position: spatialPosition,
                    record: record,
                    filename: filename,
                    group: group,
                };
                return [2 /*return*/, this.send({ message: payload, jsep: offer })];
            });
        });
    };
    JanusAudioBridgePlugin.identifier = JanusPlugins.AUDIO_BRIDGE;
    return JanusAudioBridgePlugin;
}(JanusPlugin));
export { JanusAudioBridgePlugin };
