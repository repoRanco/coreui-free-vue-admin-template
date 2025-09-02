<template>
  <div class="tarjas-caa c-container">
    <!-- Header con logo y título -->
    <div class="header d-flex align-items-center mb-3">
      <img :src="logoImage" alt="Logo" class="logo" />
      <h2 class="title flex-grow-1 text-center">Tarjas CAA</h2>
      <span class="r9">R9</span>
    </div>

    <!-- Descripción -->
    <CCard class="mb-3 border-danger">
      <CCardBody>
        <CFormInput v-model="descripcion" placeholder="Ingresar Descripción" class="mb-2"/>
      </CCardBody>
    </CCard>

    <!-- Selección de Materiales -->
    <CCard class="mb-3 border-danger">
      <CCardHeader class="bg-danger text-white">Seleccionar Materiales</CCardHeader>
      <CCardBody>
        <CRow>
          <CCol sm="6" v-for="i in 4" :key="i" class="mb-3">
            <h6 class="text-danger">Material {{ i }}</h6>
            <CFormSelect v-model="materialesSeleccionados[i-1].material" class="mb-2">
              <option disabled value="">Seleccione...</option>
              <option v-for="m in materialesUnicos" :key="m['Cod Nombre']" :value="m">
                {{ m['Cod Nombre'] }} - {{ m['Nombre'] }}
              </option>
            </CFormSelect>
            <CRow v-if="materialesSeleccionados[i-1].material">
              <CCol sm="6">
                <CFormLabel>Cantidad</CFormLabel>
                <CFormInput type="number" v-model="materialesSeleccionados[i-1].cantidad" min="1" />
              </CCol>
              <CCol sm="6">
                <CFormLabel>Unidad</CFormLabel>
                <CFormInput v-model="materialesSeleccionados[i-1].unidad" :placeholder="materialesSeleccionados[i-1].material['Unidad de medida'] || 'UN'" />
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Datos adicionales -->
    <CCard class="mb-3 border-danger">
      <CCardHeader class="bg-danger text-white">Datos de Tarja</CCardHeader>
      <CCardBody>
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

    <!-- Debug del QR -->
    <CCard class="mb-3 border-info">
      <CCardHeader class="bg-info text-white">Debug QR</CCardHeader>
      <CCardBody>
        <p><strong>Tamaño JSON:</strong> {{ qrData.length }} caracteres</p>
        <p><strong>Válido:</strong> {{ esJsonValido ? '✅ Sí' : '❌ No' }}</p>
        <details>
          <summary>Ver JSON completo</summary>
          <pre class="bg-light p-2 mt-2">{{ qrData }}</pre>
        </details>
      </CCardBody>
    </CCard>

    <!-- QR + Botón Imprimir -->
    <div class="text-center">
      <qrcode-vue :value="qrData" :size="320" level="H" />
      <br />
      <CButton color="danger" class="mt-3" @click="imprimirPDF">🖨️ Imprimir</CButton>
      <CButton color="info" class="mt-3 ms-2" @click="copiarQR">📋 Copiar JSON</CButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Papa from 'papaparse'
import QrcodeVue from 'qrcode.vue'
import logoImage from '@/assets/icons/LogoColor.ddc5d2c8.png'
import jsPDF from 'jspdf'

// Datos formulario
const descripcion = ref('Tarja CAA Test')
const materialesUnicos = ref([])
const materialesSeleccionados = ref([
  { material: '', cantidad: 1, unidad: '' },
  { material: '', cantidad: 1, unidad: '' },
  { material: '', cantidad: 1, unidad: '' },
  { material: '', cantidad: 1, unidad: '' }
])
const lote = ref('L001')
const cantidad = ref(100)
const numero = ref(1)
const fecha = ref(new Date().toISOString().split("T")[0])

// Leer CSV
onMounted(async () => {
  try {
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
    console.log("📋 Materiales únicos cargados:", materialesUnicos.value.length)
  } catch (err) {
    console.error("❌ Error cargando CSV:", err)
  }
})

// QR Data FORMATO BODEGA (que funciona correctamente)
const qrData = computed(() => {
  const materialesFiltrados = materialesSeleccionados.value.filter(m => m.material && m.material !== '')
  
  const data = {
    descripcion: descripcion.value,
    materiales: materialesFiltrados.map(m => m.material), // Usar formato completo como TarjasBodega
    proveedor: 'CAA', // Identificador de que viene de CAA
    guia: 'CAA-' + numero.value, // Usar número como guía
    lote: lote.value,
    cantidad: cantidad.value,
    numero: numero.value,
    fecha: fecha.value
  }
  
  const jsonString = JSON.stringify(data)
  console.log("🔧 QR CAA generado (formato Bodega):", jsonString)
  console.log("📏 Tamaño:", jsonString.length, "caracteres")
  
  return jsonString
})

// Validar JSON
const esJsonValido = computed(() => {
  try {
    JSON.parse(qrData.value)
    return true
  } catch {
    return false
  }
})

// Copiar QR al clipboard para debug
function copiarQR() {
  navigator.clipboard.writeText(qrData.value)
  alert('JSON copiado al portapapeles ✅')
}

// Función para impresión rápida en PDF
async function imprimirPDF() {
  const pdf = new jsPDF('p', 'mm', 'a4')

  // Logo
  pdf.addImage(logoImage, 'PNG', 10, 10, 40, 20)
  pdf.setFontSize(18)
  pdf.setTextColor(180, 0, 0)
  pdf.text("Tarja CAA R9", 105, 20, { align: "center" })

  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)

  // Info principal
  let y = 40
  pdf.text(`Descripción: ${descripcion.value}`, 10, y)
  y += 10
  pdf.text(`Lote: ${lote.value}`, 10, y)
  y += 10
  pdf.text(`Cantidad: ${cantidad.value}`, 10, y)
  y += 10
  pdf.text(`Nº: ${numero.value}`, 10, y)
  y += 10
  pdf.text(`Fecha: ${fecha.value}`, 10, y)

  // Materiales
  y += 15
  pdf.setFontSize(14)
  pdf.setTextColor(180, 0, 0)
  pdf.text("Materiales seleccionados:", 10, y)
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)

  y += 10
  materialesSeleccionados.value.filter(m => m.material && m.material !== '').forEach((mat, index) => {
    pdf.text(`${index + 1}. ${mat.material['Cod Nombre']} - ${mat.material['Nombre']} (${mat.cantidad} ${mat.unidad || mat.material['Unidad de medida']})`, 15, y)
    y += 8
  })

  // Capturamos QR ya renderizado en DOM
  const qrCanvas = document.querySelector('canvas')
  if (qrCanvas) {
    const qrImg = qrCanvas.toDataURL("image/png")
    pdf.addImage(qrImg, 'PNG', 140, 40, 60, 60)
  }

  // Imprimir rápido
  window.open(pdf.output('bloburl'), '_blank').print()
}
</script>

<style scoped>
.tarjas-caa {
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
pre {
  font-size: 10px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
