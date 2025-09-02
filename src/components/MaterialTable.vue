<template>
    <div>
      <h3>Materiales agregados</h3>
  
      <table border="1" cellpadding="6" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Lote</th>
            <th>Cantidad</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ item.codigo }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.lote }}</td>
            <td>{{ item.cantidad }}</td>
            <td>{{ item.fecha }}</td>
          </tr>
          <tr v-if="!items || items.length === 0">
            <td colspan="5" style="text-align:center;">No hay materiales</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  defineProps({
    items: {
      type: Array,
      default: () => []
    }
  })
  </script>
  
  <style scoped>
  table {
    border-collapse: collapse;
    margin-top: 10px;
  }
  th {
    background: #eee;
  }
  </style>