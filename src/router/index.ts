import { createRouter, createWebHistory } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore'

// Importaciones de tus vistas/componentes
import LoginView from '@/views/LoginView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import RegisterView from '@/views/RegisterView.vue'
import NewPasswordView from '@/views/NewPasswordView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import SettingsView from '@/views/dashboard/SettingsView.vue'
import ProfileView from '@/views/dashboard/ProfileView.vue'
import HomeView from '@/views/HomeView.vue'
import FormularioUsuarios from '@/views/FormularioUsuarios.vue'
import TicketsView from '../views/TicketsView.vue'
import FormularioEmpresasView from '../views/FormularioEmpresasView.vue'
import FormulariosProyectos from '@/views/FormulariosProyectos.vue'
import FormularioPermisosView from '@/views/FormularioPermisosView.vue'
import CreacionRoles from '@/views/CreacionRoles.vue'
import HistorialTicketsView from '@/views/HistorialTicketsView.vue'
import TicketDetalleView from '@/views/TicketDetalleView.vue'
import NotificacionesView from '@/views/NotificacionesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      component: LoginView,
      meta: { layout: 'AuthLayout' },
    },
    {
      path: '/reset-password',
      component: ResetPasswordView,
      meta: { layout: 'AuthLayout' },
    },
    {
      path: '/register',
      component: RegisterView,
      meta: { layout: 'AuthLayout' },
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { layout: 'MainLayout', requiresAuth: true },
    },
    {
      path: '/settings',
      component: SettingsView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/profile',
      component: ProfileView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/Usuarios',
      component: FormularioUsuarios,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/formulario-empresas',
      name: 'FormularioEmpresas',
      component: FormularioEmpresasView,
      meta: { layout: 'MainLayout', requiresAuth: true, userType: 'interno' },
    },
    {
      path: '/proyectos',
      name: 'FormulariosProyectos',
      component: FormulariosProyectos,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/permisos',
      name: 'FormularioPermisos',
      component: FormularioPermisosView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/roles-crud',
      name: 'RolesCrudList',
      component: CreacionRoles,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/roles-crud/editar/:id',
      name: 'RolesCrudEdit',
      component: CreacionRoles,
      props: true,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/historial-tickets',
      name: 'HistorialTickets',
      component: HistorialTicketsView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/tickets/:id',
      name: 'detalle-ticket',
      component: TicketDetalleView,
      meta: { layout: 'MainLayout' },
    },
    {
      // RUTA CORREGIDA: Agregado el '/' antes de ':token' y se añadió 'name' y 'props: true'
      path: '/new-password/:token',
      name: 'NewPassword', // Se recomienda dar un nombre a la ruta
      component: NewPasswordView,
      props: true, // Esto permite que el token sea accesible como una prop en NewPasswordView
      meta: { layout: 'AuthLayout' },
    },
    {
      path: '/Notificaciones',
      name: 'Notificaciones',
      component: NotificacionesView,
      meta: { layout: 'MainLayout' },
    },
  ]
})

router.beforeEach((to, from, next) => {
  const store = authSetStore()
  const isAuthenticated = !!store.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router