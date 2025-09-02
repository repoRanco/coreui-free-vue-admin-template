<template>
    <div class="tarjas-bodega c-container">
      <!-- Header con logo y título -->
      <div class="header d-flex align-items-center mb-3">
        <img :src="logoImage" alt="Ranco Logo" class="logo" />
        <h2 class="title flex-grow-1 text-center">Tarjas Bodega</h2>
        <span class="r9">R9</span>
      </div>
  
      <!-- ================= Formulario ================= -->
      <CCard class="mb-3 border-danger">
        <CCardBody>
          <CFormInput v-model="descripcion" placeholder="Descripción tarja bodega" class="mb-2"/>
        </CCardBody>
      </CCard>
  
      <!-- Selección de Materiales -->
      <CCard class="mb-3 border-danger">
        <CCardHeader class="bg-danger text-white">Seleccionar Materiales</CCardHeader>
        <CCardBody>
          <CRow>
            <CCol sm="3" v-for="i in 4" :key="i">
              <CFormLabel>Material {{ i }}</CFormLabel>
              <CFormSelect v-model="materialesSeleccionados[i-1]">
                <option disabled value="">Seleccione...</option>
                <option v-for="m in materialesUnicos" :key="m['Cod Nombre']" :value="m">
                  {{ m['Cod Nombre'] }} - {{ m['Nombre'] }}
                </option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
  
      <!-- Datos de la Tarja -->
      <CCard class="mb-3 border-danger">
        <CCardHeader class="bg-danger text-white">Datos de Tarja</CCardHeader>
        <CCardBody>
          <CRow class="mb-2">
            <CCol sm="6">
              <CFormLabel>Proveedor</CFormLabel>
              <CFormInput v-model="proveedor" />
            </CCol>
            <CCol sm="6">
              <CFormLabel>Guía</CFormLabel>
              <CFormInput v-model="guia" />
            </CCol>
          </CRow>
          <CRow class="mb-2">
            <CCol sm="6">
              <CFormLabel>Lote</CFormLabel>
              <CFormInput v-model="lote" />
            </CCol>
            <CCol sm="6">
              <CFormLabel>Cantidad</CFormLabel>
              <CFormInput type="number" v-model="cantidad" />
            </CCol>
          </CRow>
          <CRow class="mb-2">
            <CCol sm="6">
              <CFormLabel>Nº</CFormLabel>
              <CFormInput type="number" v-model="numero" />
            </CCol>
            <CCol sm="6">
              <CFormLabel>Fecha</CFormLabel>
              <CFormInput type="date" v-model="fecha" />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
  
      <!-- QR + Imprimir -->
      <div class="text-center">
        <qrcode-vue :value="qrData" :size="200" level="H" />
        <br />
        <CButton color="danger" class="mt-3" @click="imprimirPDF">🖨️ Imprimir</CButton>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import Papa from 'papaparse'
  import QrcodeVue from 'qrcode.vue'
  import jsPDF from 'jspdf'
  import logoImage from '@/assets/icons/LogoColor.ddc5d2c8.png'
  
  // Datos
  const descripcion = ref('')
  const proveedor = ref('')
  const guia = ref('')
  const lote = ref('')
  const cantidad = ref(0)
  const numero = ref(1)
  const fecha = ref(new Date().toISOString().split("T")[0])
  
  // Materiales
  const materialesUnicos = ref([])
  const materialesSeleccionados = ref(['', '', '', ''])
  
  onMounted(async () => {
    const response = await fetch('/materiales.csv')
    const text = await response.text()
    const result = Papa.parse(text, { header: true, skipEmptyLines: true })
    const uniqueMap = new Map()
    result.data.forEach((row) => {
      if (row['Cod Nombre'] && !uniqueMap.has(row['Cod Nombre'])) {
        uniqueMap.set(row['Cod Nombre'], row)
      }
    })
    materialesUnicos.value = Array.from(uniqueMap.values())
  })
  
  // QR en JSON
  const qrData = computed(() =>
    JSON.stringify({
      descripcion: descripcion.value,
      materiales: materialesSeleccionados.value.filter(m => m),
      proveedor: proveedor.value,
      guia: guia.value,
      lote: lote.value,
      cantidad: cantidad.value,
      numero: numero.value,
      fecha: fecha.value
    })
  )
  
  // Generar PDF detallado y enviar a imprimir
  async function imprimirPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4')
  
    // Logo
    pdf.addImage(logoImage, 'PNG', 10, 10, 40, 20)
    pdf.setFontSize(18)
    pdf.setTextColor(180, 0, 0)
    pdf.text("Tarja Bodega R9", 105, 20, { align: "center" })
  
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
  
    // Info principal
    let y = 40
    pdf.text(`Descripción: ${descripcion.value}`, 10, y)
    y += 10
    pdf.text(`Proveedor: ${proveedor.value}`, 10, y)
    y += 10
    pdf.text(`Guía: ${guia.value}`, 10, y)
    y += 10
    pdf.text(`Lote: ${lote.value}`, 10, y)
    y += 10
    pdf.text(`Cantidad: ${cantidad.value}`, 10, y)
    y += 10
    pdf.text(`Nº: ${numero.value}`, 10, y)
    y += 10
    pdf.text(`Fecha: ${fecha.value}`, 10, y)
  
    // Título de materiales
    y += 15
    pdf.setFontSize(14)
    pdf.setTextColor(180, 0, 0)
    pdf.text("Materiales seleccionados:", 10, y)
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
  
    y += 10
    materialesSeleccionados.value.filter(m => m).forEach((mat, index) => {
      pdf.text(`${index + 1}. ${mat['Cod Nombre']} - ${mat['Nombre']}`, 15, y)
      y += 8
    })
  
    // QR a la derecha
    const qrCanvas = document.querySelector('canvas') // capturamos el QR renderizado
    if (qrCanvas) {
      const qrImg = qrCanvas.toDataURL("image/png")
      pdf.addImage(qrImg, 'PNG', 140, 40, 60, 60)
    }
  
    // Enviar a impresión rápida
    window.open(pdf.output('bloburl'), '_blank').print()
  }
  </script>
  
  <style scoped>
  .tarjas-bodega {
    padding: 20px;
  }
  .header {
    background: #fff;
    border-bottom: 3px solid #b50000;
    padding: 10px;
  }
  .logo {
    width: 80px;
    height: auto;
  }
  .title {
    color: #b50000;
    font-weight: 700;
  }
  .r9 {
    border: 1px solid #b50000;
    color: #b50000;
    padding: 4px 8px;
    font-weight: bold;
  }
  </style>