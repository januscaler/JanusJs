import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home.vue'
import AudioBridge from '../views/AudioBridge.vue'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/audiobridge',
            name: 'audiobridge',
            component: AudioBridge,
        },
        {
            path: '/videoroom',
            name: 'videoroom',
            component: () => import('../views/videoroom.vue'),
        },
        {
            path: '/portable',
            name: 'portable',
            component: () => import('../views/portableDemo.vue'),
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
})
