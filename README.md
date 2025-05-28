# JanusJs

Fully functional reactive and promisified wrapper around native janusjs

## Install

```sh
npm install typed_janus_js
```

## Build for distribution

```sh
npm run update # update janusjs from meetecho
npm run build
```

## [Api and documentation](https://flutterjanus.github.io/JanusJs/)

## Usage Examples

```javascript
// video call screensharing example code
// you can see complete code in action under vanila-js example
import { JanusJs, JanusVideoCallPlugin } from 'typed_janus_js'
import { config } from './conf'

const janus = new JanusJs(config.meetecho)
await janus.init({ debug: false })
const session = await janus.createSession()
const publisher = await session.attach(JanusVideoCallPlugin)
publisher.onMessage.subscribe((msg) => {
    if (msg.jsep) {
        publisher.handleRemoteJsep({ jsep: msg.jsep })
    }
})
const remoteVideo = document.getElementById('remotevideo')
let remoteStream = new MediaStream()
console.log(remoteVideo)
publisher.onRemoteTrack.subscribe(({ mid, on, track }) => {
    if (on) {
        remoteStream.addTrack(track)
    } else {
        remoteStream.removeTrack(track)
    }
})
remoteVideo.srcObject = remoteStream

const username = prompt('Enter your name: ')
await publisher.register(username)
const user = prompt('Enter user you want to call: ')
await publisher.call(
    user,
    await publisher.createOffer({
        tracks: [
            { type: 'audio', capture: true, recv: true },
            { type: 'screen', capture: true, recv: true },
        ],
    })
)
```

```javascript
// video room example code
// you can see complete code in action under vanila-js example
import { JanusJs, JanusVideoRoomPlugin } from 'typed_janus_js'
import { config } from './conf'
const janus = new JanusJs(config.meetecho)
await janus.init({ debug: false })
const session = await janus.createSession()
const publisher = await session.attach(JanusVideoRoomPlugin)
const subscriber = await session.attach(JanusVideoRoomPlugin)

const username = prompt('Enter your name: ')
await publisher.joinRoomAsPublisher(1234, { display: username })
await publisher.publishAsPublisher(
    await publisher.createOffer({ media: { audio: true, video: true } }),
    { bitrate: 2000000 }
)

publisher.onMessage.subscribe(async ({ jsep, message }) => {
    const result = message?.result
    const event = result?.event
    console.log(message, jsep)
    if (jsep) {
        publisher.handleRemoteJsep({ jsep })
    }
})
// console.log(await publisher.listParticipants(1234));
subscriber.onMessage.subscribe(async ({ jsep, message }) => {
    if (jsep) {
        publisher.handleRemoteJsep({ jsep })
    }
})

subscriber.onRemoteTrack.subscribe((track, on, mid) => {
    console.log({ track, on, mid })
})
```
