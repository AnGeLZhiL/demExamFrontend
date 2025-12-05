import { createRouter, createWebHistory } from 'vue-router'
import { AuthService } from '@/services/authService'

const LoginView = () => import('@/views/auth/LoginView.vue')
const EventsView = () => import('@/views/EventsView.vue')
const MainLayout = () => import('@/layouts/MainLayout.vue')
const EventDetail = () => import('@/views/EventDetail.vue')


const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/events',
    name: 'Events',
    component: MainLayout, // Сначала покажем Layout
    children: [
      {
        path: '',
        component: EventsView // Это будет отображаться внутри Layout
      },
      {
        path: ':id', // динамический параметр :id
        name: 'EventDetail',
        component: EventDetail
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router