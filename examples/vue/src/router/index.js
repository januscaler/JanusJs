import Vue from 'vue'
import Router from 'vue-router'
import AudioBridge from '../views/AudioBridge.vue'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    routes: [
        
        {
            path: '/',
            name: 'audiobridge',
            component: AudioBridge,
        },
        {
            path: '/portable',
            name: 'portable',
            component: () => import('../views/portableDemo.vue'),
        },
    ],
})
