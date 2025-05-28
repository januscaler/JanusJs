import _ from 'lodash'
import {
    JanusAudioBridgePlugin,
    JanusJs,
    JanusStreamingPlugin,
} from 'typed_janus_js'
import { config } from './conf'

const janus1 = new JanusJs(config.s1)
await janus1.init({ debug: false })
const session1 = await janus1.createSession()
const handle1 = await session1.attach(JanusAudioBridgePlugin)

console.log(await handle1.send({ message: { request: 'join', room: 123456 } }))
handle1.onMessage.subscribe(async ({ jsep, message }) => {
    console.log(message)
    if (message.audiobridge === 'joined') {
        const offer = await handle1.createOffer({
            tracks: [{ capture: true, recv: false, type: 'audio' }],
        })
        console.log(
            await handle1.send({
                message: { request: 'configure' },
                jsep: offer,
            })
        )
    }
    if (jsep) {
        await handle1.handleRemoteJsep({ jsep })
    }
})

const janus2 = new JanusJs(config.s2)
await janus2.init({ debug: false })
const session2 = await janus2.createSession()
const handle2 = await session2.attach(JanusStreamingPlugin)
handle2.onMessage.subscribe(async ({ message, jsep }) => {
    if (jsep) {
        const answer = await handle2.createAnswer({ jsep })
        await handle2.send({
            message: { request: 'start' },
            jsep: answer,
        })
    }
})
const remoteAudio = document.getElementById('remoteAudio')
let remoteStream = new MediaStream()
console.log(remoteAudio)
handle2.onRemoteTrack.subscribe(({ mid, on, track }) => {
    if (on) {
        remoteStream.addTrack(track)
    } else {
        remoteStream.removeTrack(track)
    }
})
remoteAudio.srcObject = remoteStream
const list = await handle2.send({ message: { request: 'list' } })
console.log(list)
console.log(
    await handle2.send({ message: { request: 'watch', id: 5482635511404637 } })
)
