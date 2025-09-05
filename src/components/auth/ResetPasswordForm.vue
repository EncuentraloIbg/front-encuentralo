<template>
  <v-app>
    <v-main class="auth-hero">
      <div class="auth-container">
        <div class="brand">
          <img :src="logoEncuentralo" alt="Encuéntralo" class="logo e1 glow" />
          <span class="amp">&</span>
          <img :src="logoMundoSmartphone" alt="MundoSmartphone" class="logo e2 glow" />
        </div>

        <h2 class="title">Restablecer Contraseña</h2>

        <form class="card" @submit.prevent="onSubmit">
          <div v-if="message" class="alert" :class="messageType">
            {{ message }}
          </div>

          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              v-model.trim="email"
              placeholder="Ingresa tu correo electrónico"
              autocomplete="username"
              required
            />
          </div>

          <button class="submit" type="submit" :disabled="loading || !isValidEmail(email)">
            <span v-if="!loading">Enviar Instrucciones</span>
            <span v-else>Enviando…</span>
          </button>
        </form>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthService, { type ApiMessage } from '@/services/AuthService'
import logoEncuentralo from '@/assets/Encuentralo.png'
import logoMundoSmartphone from '@/assets/Mundosmartphone.png'

const email = ref('')
const message = ref('')
const messageType = ref<'success' | 'error' | ''>('')
const loading = ref(false)

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
const authService = new AuthService()

const onSubmit = async () => {
  message.value = ''
  messageType.value = ''

  const correo = email.value.trim().toLowerCase()
  if (!isValidEmail(correo)) {
    message.value = 'Por favor, ingresa un correo válido.'
    messageType.value = 'error'
    return
  }

  loading.value = true
  try {
    const res: ApiMessage = await authService.forgotPassword(correo)
    message.value = res.message
    messageType.value = 'success'
  } catch (e) {
    const err = e as Error
    message.value = err?.message || 'Ocurrió un error al enviar el correo.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

:root{
  --primary: #1565c0;
  --accent: #c62828;
  --glass: rgba(255,255,255,.34);
  --glass-border: rgba(255,255,255,.48);
}

.v-application, .v-application__wrap { height: 100%; }

.auth-hero{
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  place-items: center;
  background: linear-gradient(to bottom, #ffffff 0%, #111111 100%);
  color: #fff;
}

.auth-container{
  width: min(92vw, 560px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
}

.brand{
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-bottom: 6px;
}
.logo{
  height: clamp(82px, 11vw, 135px);
  width: auto;
  display: inline-block;
  object-fit: contain;
}
.logo.e1{ height: clamp(88px, 11.5vw, 145px); }
.logo.e2{ height: clamp(104px, 13vw, 170px); transform: translateY(2px); }

.logo.glow{
  filter:
    drop-shadow(0 0 12px rgba(255,255,255,.40))
    drop-shadow(0 3px 10px rgba(0,0,0,.14));
}
.logo.e2.glow{
  filter:
    drop-shadow(0 0 18px rgba(255,255,255,.52))
    drop-shadow(0 4px 12px rgba(0,0,0,.16));
}

.amp{
  font-weight: 900;
  font-size: clamp(26px, 3.4vw, 38px);
  text-shadow: 0 2px 6px rgba(0,0,0,.25);
  letter-spacing: .6px;
}

.title{
  margin: 0;
  font-size: clamp(22px, 3.2vw, 28px);
  font-weight: 800;
  letter-spacing: .3px;
  color: #111;
}

.card{
  width: 100%;
  margin-top: 8px;
  padding: 24px 22px 20px;
  border-radius: 16px;
  background: var(--glass);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 12px 30px rgba(0,0,0,.28);
}

.alert{
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba(255,255,255,.35);
  background: rgba(255,255,255,.25);
  color: #fff;
}
.alert.success{
  border-color: rgba(76, 175, 80, .55);
  box-shadow: 0 6px 16px rgba(76, 175, 80, .22);
}
.alert.error{
  border-color: rgba(198, 40, 40, .55);
  box-shadow: 0 6px 16px rgba(198, 40, 40, .22);
}

.input-group{
  margin-bottom: 16px;
  text-align: center;
}
label{
  display: block;
  font-size: 13px;
  color: #eaeef6;
  margin-bottom: 6px;
}
input{
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,.55);
  border-radius: 10px;
  outline: none;
  background: rgba(255,255,255,.96);
  color: #111;
  font-size: 15px;
  text-align: center;
  transition: box-shadow .2s ease, border-color .2s ease, background .2s ease;
}
input::placeholder{ color: #6b7280; }
input:focus{
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(21,101,192,.25);
  background: #fff;
}

.submit{
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  background: #111;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .25s ease, background .2s ease;
}
.submit:hover{
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,0,0,.35);
  background: var(--primary);
}
.submit:disabled{
  opacity: .7;
  cursor: default;
  transform: none;
  box-shadow: none;
}
</style>
