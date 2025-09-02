<template>
    <div>
      <qrcode-vue :value="qrData" :size="200" level="H" />
      <p>QR generado para material:</p>
      <pre>{{ qrData }}</pre>
    </div>
  </template>
  
  <script setup>
  import QrcodeVue from 'qrcode.vue'
  import { computed } from 'vue'
  import { useMaterialStore } from '@/stores/materialStore'
  
  const store = useMaterialStore()
  
  // Generamos un JSON con datos de materiales
  const qrData = computed(() => JSON.stringify(store.materiales))
  </script>