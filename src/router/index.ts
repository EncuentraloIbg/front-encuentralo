import { createRouter, createWebHistory } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Home
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },

    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'AuthLayout' },
    },

    // Dashboard
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { layout: 'MainLayout' },
    },

    // ====== ÓRDENES ======
    // Listado / zona de creación
    {
      path: '/ordenes',
      name: 'ordenes',
      component: () => import('@/views/OrdenesView.vue'),
      meta: { layout: 'MainLayout' },
    },

    // Pantalla dedicada para crear (opcional)
    {
      path: '/ordenes/crear',
      name: 'ordenes-crear',
      component: () => import('@/views/OrdenesView.vue'),
      meta: { layout: 'MainLayout' },
    },

    // Historial
    {
      path: '/historial-ordenes',
      name: 'historial-ordenes',
      component: () => import('@/views/HistorialOrdenesView.vue'),
      meta: { layout: 'MainLayout' },
    },

    // === Edición de orden en pantalla completa ===
    {
      path: '/ordenes/:id/editar',
      name: 'orden-editar',
      component: () => import('@/views/OrdenEditar.vue'),
      meta: { layout: 'MainLayout' },
      props: true,
    },

    // ====== CONFIGURACIÓN EMPRESA ======
    {
      path: '/configuracion/empresa',
      name: 'configuracion-empresa',
      component: () => import('@/views/ConfiguracionEmpresa.vue'),
      meta: { layout: 'MainLayout' },
    },

    // ====== Redirecciones desde rutas antiguas eliminadas ======
    { path: '/usuarios', redirect: { name: 'ordenes' } },
    { path: '/proyectos', redirect: { name: 'ordenes' } },
    { path: '/tickets', redirect: { name: 'ordenes' } },
    { path: '/historial-tickets', redirect: { name: 'historial-ordenes' } },

    // Catch-all a Home
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
})

// Guard simple
router.beforeEach((to, _from, next) => {
  const auth = authSetStore()
  const isLogged = !!auth.token

  // Si ya está logueado, no tiene sentido ir a /login
  if (to.name === 'login' && isLogged) return next({ name: 'dashboard' })

  // Si no estás logueado, bloquea rutas de MainLayout (excepto login/home)
  const isProtected =
    to.name !== 'login' &&
    to.name !== 'home' &&
    // todas las vistas de la app que requieren sesión
    [
      'dashboard',
      'ordenes',
      'ordenes-crear',
      'historial-ordenes',
      'orden-editar',
      'configuracion-empresa',
    ].includes(String(to.name))

  if (isProtected && !isLogged) return next({ name: 'login' })

  next()
})

export default router
