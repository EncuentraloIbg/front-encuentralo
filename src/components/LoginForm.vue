<template>
  <div class="login-form">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handlerLogin">
      <div class="input-group">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
      </div>

      <div class="input-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Ingresa tu contraseña"
          required
        />
      </div>

      <div class="forgot-password-container">
        <router-link to="/reset-password" class="forgot-password-link">¿Olvidó su contraseña?</router-link>
      </div>

      <button @click="handlerLogin">Ingresar</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authSetStore } from '../stores/AuthStore.ts'

const authStore = authSetStore()
const email = ref('')
const password = ref('')

const handlerLogin = () => {
  if (!email.value || !password.value) {
    // ¡IMPORTANTE! No uses alert(). Usa un snackbar o un modal personalizado.
    // Por ahora, solo para que funcione, lo dejo, pero es una mala práctica en Vue/Vuetify.
    alert('Por favor, completa todos los campos')
    return
  }else {
    authStore.login({
      email: email.value,
      password: password.value,
    })
  }
}
</script>

<style scoped>
.login-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 340px;
  padding: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h2 {
  color: white;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  font-size: 14px;
  color: white;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  outline: none;
  background-color: white; /* Asegura que el fondo sea blanco */
  color: black; /* Asegura que el texto dentro del input sea negro */
  text-align: center; /* CORRECCIÓN AQUÍ: Centra el texto y el placeholder */
}

.forgot-password-container {
  text-align: center; /* Centra el contenido de este div */
  margin-bottom: 15px;
}

.forgot-password-link {
  color: #a0a0a0; /* Un color más suave para el enlace */
  text-decoration: none; /* Quita el subrayado por defecto */
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: #ffffff; /* Color blanco al pasar el ratón */
}

button {
  width: 50%;
  padding: 10px;
  border: none;
  background: #f5f6f8;
  color: rgb(2, 34, 102);
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #0056b3;
}
</style>
