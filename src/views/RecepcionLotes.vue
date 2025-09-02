<template>
    <div>
      <h2>Tarjas Bodega</h2>
  
      <form @submit.prevent="generarQR">
        <input v-model="form.descripcion" placeholder="Descripción tarja bodega" />
        <input v-model="form.proveedor" placeholder="Proveedor" />
        <input v-model="form.guia" placeholder="Guía" />
        <input v-model="form.lote" placeholder="Lote" />
        <input v-model="form.cantidad" type="number" placeholder="Cantidad" />
        <input v-model="form.numero" type="number" placeholder="N°" />
        <input v-model="form.fecha" type="date" />
  
        <button type="submit">Generar QR</button>
      </form>
  
      <div v-if="qrValue" class="qr-section">
        <h3>QR Generado</h3>
        <qrcode-vue :value="qrValue" :size="200" />
        <pre>{{ qrValue }}</pre>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import QrcodeVue from 'qrcode.vue'
  
  const form = ref({
    descripcion: '',
    proveedor: '',
    guia: '',
    lote: '',
    cantidad: 0,
    numero: 0,
    fecha: ''
  })
  
  const qrValue = ref('')
  
  function generarQR() {
    qrValue.value = JSON.stringify(form.value)
  }
  </script>
  
  <style scoped>
  form {
    display: grid;
    gap: 10px;
    max-width: 400px;
    margin-bottom: 20px;
  }
  
  .qr-section {
    margin-top: 20px;
  }
  </style>