<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

import { computed, type Component } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

type LayoutKey = 'AuthLayout' | 'MainLayout'
const layouts: Record<LayoutKey, Component> = {
  AuthLayout,
  MainLayout,
}

const layout = computed(() => {
  const layoutKey = route.meta.layout as LayoutKey | undefined
  return layoutKey && layoutKey in layouts ? layouts[layoutKey] : 'div'
})
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<style scoped>
html,
body {
  margin: 0;
  height: 100%;
  align-items: center;
  width: 100%;
}

router-view {
  width: 100%;
  height: 100%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html {
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}

main {
  width: 100%;
  height: 100%;
}
</style>
