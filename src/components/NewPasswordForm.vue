<template>
  <form @submit.prevent="changePassword" class="reset-form">
    <h2>Nueva Contraseña</h2>

    <div class="input-group">
      <label for="newPassword">Contraseña nueva</label>
      <input
        type="password"
        id="newPassword"
        v-model="newPassword"
        required
        placeholder="Ingresa tu nueva contraseña"
      />
    </div>

    <div class="input-group">
      <label for="confirmPassword">Confirmar contraseña</label>
      <input
        type="password"
        id="confirmPassword"
        v-model="confirmPassword"
        required
        placeholder="Confirma tu nueva contraseña"
      />
    </div>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Cambiando...' : 'Cambiar Contraseña' }}
    </button>

    <p v-if="message" :class="messageClass">{{ message }}</p>

    <router-link v-if="success" to="/login" class="login-again">
      Iniciar sesión
    </router-link>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Obtenemos token desde la URL: /new-password/:token
const route = useRoute()
const router = useRouter()
const token = (route.params.token as string) || ''

const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)
const success = ref(false)

const messageClass = computed(() => {
  return success.value ? 'message-success' : 'message-error'
})

const changePassword = async () => {
  // Validaciones básicas
  if (newPassword.value.length < 8) {
    message.value = 'La contraseña debe tener al menos 8 caracteres.'
    success.value = false
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Las contraseñas no coinciden.'
    success.value = false
    return
  }

  loading.value = true
  message.value = ''
  success.value = false

  try {
    const response = await fetch('http://localhost:3333/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password: newPassword.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Si el backend devuelve 400/500, mostramos error
      message.value = data.message || 'Ocurrió un error al cambiar la contraseña.'
      success.value = false
    } else {
      // Éxito: password actualizada
      message.value = data.message || 'Contraseña cambiada con éxito.'
      success.value = true

      // Después de 1.5 segundos redirigimos a /login
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (err) {
    message.value = 'Error de conexión con el servidor.'
    success.value = false
    console.error('Error en changePassword fetch:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-form {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  color: white; /* El texto general del formulario (labels, títulos) seguirá siendo blanco */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-group label {
  font-size: 14px;
  margin-bottom: 5px;
}

.input-group input {
  padding: 10px;
  border: none;
  border-radius: 8px;
  /* Aquí ajustamos el tamaño de la fuente */
  font-size: 12px; /* Lo cambié de 16px a 14px. Puedes probar con 13px si aún es muy grande. */
  outline: none;
  background: white; /* Fondo blanco para el input */
  color: black; /* Color de la letra escrita en el input */
  text-align: center;
}

/* Estilos para el texto del placeholder (también negro) */
.input-group input::placeholder {
  color: #666; /* Un gris oscuro para que se vea bien sobre blanco, o black */
}

.input-group input::-webkit-input-placeholder { /* Chrome, Opera, Safari */
  color: #666;
}

.input-group input::-moz-placeholder { /* Firefox 19+ */
  color: #666;
  opacity: 1;
}

.input-group input:-ms-input-placeholder { /* IE 10+ y Edge */
  color: #666;
}

.input-group input:-moz-placeholder { /* Firefox 4-18 */
  color: #666;
  opacity: 1;
}


button {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: white;
  transition: 0.3s ease-in-out;
  margin-top: 10px;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:not([disabled]) {
  background: rgba(255, 255, 255, 0.5);
}

.message-success {
  margin-top: 10px;
  font-size: 14px;
  color: #a5d6a7; /* verde claro para éxito */
}

.message-error {
  margin-top: 10px;
  font-size: 14px;
  color: #ff8a80; /* rojo claro para error */
}

.login-again {
  display: block;
  margin-top: 15px;
  font-size: 14px;
  color: white;
  text-decoration: underline;
  cursor: pointer;
}
</style>