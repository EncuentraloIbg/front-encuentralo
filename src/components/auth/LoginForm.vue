<template>
  <v-app>
    <v-main class="auth-hero">
      <div class="auth-container">
        <!-- Logos -->
        <div class="brand">
          <img :src="logoEncuentralo" alt="Encuéntralo" class="logo e1 glow" />
        <span class="amp">&</span>
          <img :src="logoMundoSmartphone" alt="MundoSmartphone" class="logo e2 glow" />
        </div>

        <h2 class="title">Iniciar Sesión</h2>

        <!-- Card / Form -->
        <form class="card" @submit.prevent="handlerLogin" novalidate>
          <div v-if="errorMessage" class="alert">{{ errorMessage }}</div>

          <div class="input-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model.trim="email"
              placeholder="Ingresa tu correo"
              autocomplete="username"
              required
            />
          </div>

          <div class="input-group password-group">
            <label for="password">Contraseña</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              required
            />
            <button
              class="toggle-password"
              type="button"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <div class="meta">
            <!-- link de recuperar si lo necesitas -->
          </div>

          <button class="submit" type="submit" :disabled="loading">
            <span v-if="!loading">Ingresar</span>
            <span v-else>Ingresando…</span>
          </button>
        </form>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authSetStore } from '@/stores/AuthStore'
import { ApiError } from '@/services/http' // ⬅️ para logs de error tipados
import logoEncuentralo from '@/assets/Encuentralo.png'
import logoMundoSmartphone from '@/assets/Mundosmartphone.png'

const authStore = authSetStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handlerLogin = async () => {
  errorMessage.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, completa todos los campos.'
    return
  }
  loading.value = true

  // 🔎 LOGS **ANTES** de llamar al API
  console.log('[LOGIN] BASE', import.meta.env?.VITE_API_BASE_URL) // debe ser tu túnel del backend
  console.log('[LOGIN] FRONT URL', window.location.href)
  console.log('[LOGIN] UA', navigator.userAgent)
  console.log('[LOGIN] Payload preview', {
    correo: email.value.trim().toLowerCase(),
    passwordLen: password.value.trim().length,
  })

  try {
    const ok = await authStore.login({
      email: email.value.trim().toLowerCase(),
      password: password.value.trim(),
    })

    // 🔎 LOGS **DESPUÉS** (OK o false)
    console.log('[LOGIN] Result', ok)

    if (!ok) {
      errorMessage.value = 'No pudimos iniciar sesión. Revisa tus credenciales.'
    }
  } catch (e: unknown) {
    // 🔎 LOGS **DESPUÉS** (ERROR)
    if (e instanceof ApiError) {
      console.error('[LOGIN] FAIL ApiError', {
        status: e.status,
        message: e.message,
        url: e.url,
      })
      errorMessage.value = e.message || 'No pudimos iniciar sesión. Revisa tus credenciales.'
    } else {
      console.error('[LOGIN] FAIL Unknown', e)
      const msg = (e as any)?.message || 'Ocurrió un error inesperado al iniciar sesión.'
      errorMessage.value = msg
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

:root{ --primary:#1565c0; --accent:#c62828; --glass:rgba(255,255,255,.34); --glass-border:rgba(255,255,255,.48); }
.v-application, .v-application__wrap { height: 100%; }

/* Fondo */
.auth-hero{ min-height:100vh; min-height:100svh; display:grid; place-items:center; background:linear-gradient(to bottom,#fff 0%,#111 100%); color:#fff; }

/* Contenedor */
.auth-container{ width:min(92vw,560px); display:flex; flex-direction:column; align-items:center; gap:14px; padding:10px 0; }

/* Logos */
.brand{ display:flex; align-items:center; justify-content:center; gap:16px; margin-bottom:6px; }
.logo{ height:clamp(82px,11vw,135px); width:auto; background:transparent!important; border:none!important; object-fit:contain; mix-blend-mode:normal!important; }
.logo.e1{ height:clamp(88px,11.5vw,145px); }
.logo.e2{ height:clamp(104px,13vw,170px); transform:translateY(2px); }
.logo.glow{ filter:drop-shadow(0 0 12px rgba(255,255,255,.40)) drop-shadow(0 3px 10px rgba(0,0,0,.14)); }
.logo.e2.glow{ filter:drop-shadow(0 0 18px rgba(255,255,255,.52)) drop-shadow(0 4px 12px rgba(0,0,0,.16)); }

.amp{ font-weight:900; font-size:clamp(26px,3.4vw,38px); text-shadow:0 2px 6px rgba(0,0,0,.25); letter-spacing:.6px; }

/* Título */
.title{ margin:0; font-size:clamp(22px,3.2vw,28px); font-weight:800; letter-spacing:.3px; color:#111; }

/* Card */
.card{ width:100%; margin-top:8px; padding:24px 22px 20px; border-radius:16px; background:var(--glass); backdrop-filter:blur(12px); border:1px solid var(--glass-border); box-shadow:0 12px 30px rgba(0,0,0,.28); }

/* Error */
.alert{ background:rgba(255,255,255,.25); color:#fff; border:1px solid rgba(255,255,255,.35); padding:10px 12px; border-radius:10px; margin-bottom:12px; font-size:14px; }

/* Inputs */
.input-group{ margin-bottom:14px; text-align:center; }
label{ display:block; font-size:13px; color:#eaeef6; margin-bottom:6px; }
input{
  width:100%; padding:12px 42px; border:1px solid rgba(255,255,255,.55);
  border-radius:10px; outline:none; background:rgba(255,255,255,.96);
  color:#111; font-size:15px; text-align:center;
  transition: box-shadow .2s ease, border-color .2s ease, background .2s ease;
}
input::placeholder{ color:#6b7280; }
input:focus{ border-color:#fff; box-shadow:0 0 0 3px rgba(21,101,192,.25); background:#fff; }

/* Toggle password */
.password-group{ position:relative; }
.toggle-password{
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  padding:4px 6px; font-size:12px; color:#0d47a1; background:transparent; border:none; border-radius:6px; cursor:pointer;
  transition: color .2s ease, transform .15s ease;
}
.toggle-password:hover{ color:#08326f; transform:translateY(calc(-50% - 1px)); }

/* Link */
.meta{ margin:8px 0 12px; text-align:center; }
.link{ color:#ddd; text-decoration:none; font-size:13px; transition: color .2s ease, text-decoration-color .2s ease, opacity .2s ease; }
.link:hover{ color:var(--primary); text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:2px; }

/* Submit */
.submit{
  width:100%; padding:12px 14px; border:none; border-radius:10px; background:#111; color:#fff; font-weight:700; font-size:15px; cursor:pointer;
  transition: transform .15s ease, box-shadow .25s ease, background .2s ease;
}
.submit:hover{ transform:translateY(-1px); box-shadow:0 10px 22px rgba(0,0,0,.35); background:var(--primary); }
.submit:disabled{ opacity:.7; cursor:default; transform:none; box-shadow:none; }
</style>
