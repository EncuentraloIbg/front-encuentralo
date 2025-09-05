// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore'

import LoginView from '@/views/LoginView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import NewPasswordView from '@/views/NewPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'
import HomeView from '@/views/HomeView.vue'
import FormularioUsuarios from '@/views/FormularioUsuarios.vue'
import TicketsView from '@/views/TicketsView.vue'               // usado como "Órdenes"
import FormulariosProyectos from '@/views/FormulariosProyectos.vue'
import HistorialTicketsView from '@/views/HistorialTicketsView.vue' // usado como "Historial Órdenes"
import TicketDetalleView from '@/views/TicketDetalleView.vue'       // usado como "Detalle Orden"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    { path: '/login', component: LoginView, meta: { layout: 'AuthLayout' } },

    // Recuperación (form: ingresar correo)
    { path: '/reset-password', component: ResetPasswordView, meta: { layout: 'AuthLayout' } },

    // Compatibilidad: enlaces antiguos
    { path: '/forgot-password', redirect: '/reset-password' },

    // Establecer nueva contraseña con token
    {
      path: '/new-password/:token',
      name: 'NewPassword',
      component: NewPasswordView,
      props: true,
      meta: { layout: 'AuthLayout' },
    },

    { path: '/dashboard', component: DashboardView, meta: { layout: 'MainLayout', requiresAuth: true } },

    { path: '/Usuarios', component: FormularioUsuarios, meta: { layout: 'MainLayout' } },

    // === Renombrados ===
    { path: '/ordenes', name: 'ordenes', component: TicketsView, meta: { layout: 'MainLayout' } },
    {
      path: '/historial-ordenes',
      name: 'HistorialOrdenes',
      component: HistorialTicketsView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/ordenes/:id',
      name: 'detalle-orden',
      component: TicketDetalleView,
      meta: { layout: 'MainLayout' },
    },

    // (Opcional) otros activos
    { path: '/proyectos', name: 'FormulariosProyectos', component: FormulariosProyectos, meta: { layout: 'MainLayout' } },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const store = authSetStore()
  const isAuthenticated = !!store.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
