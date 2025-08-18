<template>
  <form @submit.prevent="resetPassword" class="reset-form">
    <h2>Restablecer Contraseña</h2>

    <div class="input-group">
      <label for="email">Correo Electrónico</label>
      <input
        type="email"
        id="email"
        v-model="email"
        required
        placeholder="Ingresa tu correo electrónico"
      />
    </div>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Enviando...' : 'Enviar Instrucciones' }}
    </button>

    <p v-if="message" class="message">{{ message }}</p>
  </form>
</template>

<script setup lang="ts">
// ... (tu código JavaScript existente, no necesita cambios para esto)
import { ref } from 'vue'

const email = ref('')
const message = ref('')
const loading = ref(false)

const resetPassword = async () => {
  // Validación básica de formato de email
  if (!email.value.includes('@')) {
    message.value = 'Por favor, ingresa un correo válido.'
    return
  }

  loading.value = true
  message.value = ''

  try {
    // Asegúrate de que la URL coincida con tu backend (puede ser localhost:3333 o tu proxy)
    const response = await fetch('http://localhost:3333/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Nota: el backend espera request.input('correo')
      body: JSON.stringify({ correo: email.value }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Si el backend devolvió 400, 500, etc., se muestra el mensaje que venga en data.message
      message.value = data.message || 'Ocurrió un error al enviar el correo.'
    } else {
      // El backend devolvió 200 y { message: 'Correo enviado…' }
      message.value = data.message || 'Hemos enviado las instrucciones a tu correo.'
    }
  } catch (err) {
    // Si la petición ni siquiera llegó (p.ej. CORS o servidor caído)
    message.value = 'Error de conexión con el servidor.'
    console.error('Error en resetPassword fetch:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-form {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 50px; /* <--- Aumentado el padding para hacerlo más "grueso" visualmente */
  border-radius: 12px;
  max-width: 700px; /* <--- Aumentado el ancho máximo para hacerlo más ancho */
  /* Puedes probar también con 'width: 90%;' si quieres que sea responsivo y ocupe más porcentaje */
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px; /* <--- Opcional: Aumentar margen para más espacio */
  font-size: 2em; /* <--- Opcional: Aumentar tamaño del título */
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px; /* <--- Opcional: Aumentar margen entre grupos de entrada */
}

.input-group label {
  font-size: 16px; /* <--- Opcional: Aumentar tamaño de la etiqueta */
  margin-bottom: 8px; /* <--- Opcional: Aumentar margen entre etiqueta y input */
}

.input-group input {
  padding: 12px; /* <--- Aumentado el padding del input para que sea más alto */
  border: none;
  border-radius: 8px;
  font-size: 18px; /* <--- Aumentado el tamaño de fuente del input */
  outline: none;
  background-color: white;
  color: #333; /* Color de la letra escrita en el input (gris oscuro) */
  text-align: center; /* <--- ¡Aquí está el cambio para centrar el texto! */
}

/* Estilos para el texto del placeholder (también gris oscuro y centrado) */
.input-group input::placeholder {
  color: #666; /* Un gris oscuro para que se vea bien sobre blanco */
  text-align: center; /* <--- ¡También para el placeholder! */
}

.input-group input::-webkit-input-placeholder { /* Chrome, Opera, Safari */
  color: #666;
  text-align: center;
}

.input-group input::-moz-placeholder { /* Firefox 19+ */
  color: #666;
  opacity: 1;
  text-align: center;
}

.input-group input:-ms-input-placeholder { /* IE 10+ y Edge */
  color: #666;
  text-align: center;
}

.input-group input:-moz-placeholder { /* Firefox 4-18 */
  color: #666;
  opacity: 1;
  text-align: center;
}


button {
  width: 100%;
  padding: 15px; /* <--- Aumentado el padding del botón para que sea más alto */
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px; /* <--- Aumentado el tamaño de fuente del botón */
  font-weight: bold;
  color: white;
  transition: 0.3s ease-in-out;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:not([disabled]) {
  background: rgba(255, 255, 255, 0.5);
}

.message {
  margin-top: 15px; /* <--- Opcional: Aumentar margen del mensaje */
  font-size: 16px; /* <--- Opcional: Aumentar tamaño de fuente del mensaje */
  color: #ffeb3b;
}
</style>