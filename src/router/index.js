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
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/events',
    component: MainLayout, // Сначала покажем Layout
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // пустой путь = родительский /events
        name: 'Events', // 🔴 ПЕРЕНОСИМ ИМЯ СЮДА
        component: EventsView
      },
      {
        path: ':id', // динамический параметр :id
        name: 'EventDetail',
        component: EventDetail,
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router