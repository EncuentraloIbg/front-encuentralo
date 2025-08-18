<template>
  <form @submit.prevent="register" class="register-form">
    <div class="input-group">
      <h2>Crear cuenta</h2>
      <label for="name">Nombre</label>
      <input type="text" id="name" v-model="name" required />
    </div>

    <div class="input-group">
      <label for="email">Correo Electrónico</label>
      <input type="email" id="email" v-model="email" required />
    </div>

    <div class="input-group">
      <label for="password">Contraseña</label>
      <input type="password" id="password" v-model="password" required />
    </div>

    <button type="submit">Registrarse</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')

const register = () => {
  console.log('Registro:', { name: name.value, email: email.value, password: password.value })
}
</script>

<style scoped>
.register-form {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 10px;
}

label {
  font-size: 14px;
  color: white;
  margin-bottom: 5px;
}

input {
  padding: 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
}

button {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
  width: 100%;
}

button:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
