<template>
    <form @submit.prevent="guardar">
      <input v-model="form.codigo" placeholder="Código Material" />
      <input v-model="form.nombre" placeholder="Nombre" />
      <input v-model="form.lote" placeholder="Lote" />
      <input v-model="form.cantidad" type="number" placeholder="Cantidad" />
      <input v-model="form.fecha" type="date" />
  
      <button type="submit">Agregar</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const emit = defineEmits(['agregar'])
  
  const form = ref({
    codigo: '',
    nombre: '',
    lote: '',
    cantidad: 0,
    fecha: ''
  })
  
  function guardar() {
    emit('agregar', { ...form.value })
    form.value = { codigo: '', nombre: '', lote: '', cantidad: 0, fecha: '' }
  }
  </script>