import Vue from 'vue'
import Router from 'vue-router'
import AudioBridge from '../views/AudioBridge.vue'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: { name: 'audiobridge' },
        },
        {
            path: '/audiobridge',
            name: 'audiobridge',
            component: AudioBridge,
        },
    ],
})
