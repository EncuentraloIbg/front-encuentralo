<template>
  <div class="header-buttons">
    <router-link to="/login" class="btn" active-class="active"> Iniciar Sesión </router-link>
    <router-link to="/reset-password" class="btn" active-class="active">
      ¿Olvidó su contraseña?
    </router-link>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .header-buttons {
    top: 5px;
    right: 5px;
    gap: 5px; /* Menos separación entre botones */
  }
}
.header-buttons {
  position: absolute;
  top: 10px;
  right: 50px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.2); /* Fondo semi-transparente */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px; /* Bordes redondeados */
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition:
    background 0.3s,
    border 0.3s;
  text-decoration: none; /* Eliminar subrayado */
  display: inline-block;
  text-align: center;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

/* Estilos para el botón activo */
.active {
  background: #fcfcfc0a; /* Color de fondo verde */
  border: 1px solid #ffffff;
  color: white;
}
</style>
