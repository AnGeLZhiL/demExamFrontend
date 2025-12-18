import { createRouter, createWebHistory } from 'vue-router'
import { AuthService } from '@/services/authService'

const LoginView = () => import('@/views/auth/LoginView.vue')
const EventsView = () => import('@/views/EventsView.vue')
const MainLayout = () => import('@/layouts/MainLayout.vue')
const EventDetail = () => import('@/views/EventDetail.vue')
const ModuleDetailPage = () => import('@/views/ModuleDetailPage.vue')
const UsersView = () => import('@/views/UsersView.vue')
const LogsView = () => import('@/views/LogsView.vue')


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
  },
  {
    path: '/modules',
    component: MainLayout,  // Добавляем MainLayout и для модулей
    meta: { requiresAuth: true },
    children: [
      {
        path: ':id', // /modules/:id
        name: 'module-detail',
        component: ModuleDetailPage,
        props: true
      }
    ]
  },
  {
    path: '/users',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Users',
        component: UsersView
      }
    ]
  },
  {
    path: '/logs',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Logs',
        component: LogsView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router