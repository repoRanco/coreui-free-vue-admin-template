<template>
  <div class="trazabilidad c-container">
    <!-- Header con logo y título como el prototipo -->
    <div class="header d-flex align-items-center mb-4">
      <img :src="logoImage" alt="Ranco Logo" class="logo" />
      <h2 class="title flex-grow-1 text-center">TRAZABILIDAD</h2>
      <span class="r9">R9</span>
    </div>

    <!-- ========== ENCABEZADO ========== -->
    <CCard class="mb-4 border-danger">
      <CCardHeader class="bg-danger text-white">
        <strong>Indicar turno</strong>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol sm="6">
            <div class="form-group">
              <label class="form-label">Turno</label>
              <div class="d-flex gap-3">
                <div class="form-check">
                  <input class="form-check-input" type="radio" v-model="form.turno" value="1" id="turno1">
                  <label class="form-check-label" for="turno1">Turno 1</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" v-model="form.turno" value="2" id="turno2">
                  <label class="form-check-label" for="turno2">Turno 2</label>
                </div>
              </div>
            </div>
          </CCol>
          <CCol sm="6">
            <CFormLabel>Tipo de Movimiento</CFormLabel>
            <CFormSelect v-model="form.tipoMovimiento" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="Despacho Interno">Despacho Interno</option>
              <option value="Recepción">Recepción</option>
              <option value="Transferencia">Transferencia</option>
            </CFormSelect>
          </CCol>
        </CRow>
        <CRow class="mt-3">
          <CCol sm="6">
            <CFormLabel>Temporada Material</CFormLabel>
            <CFormSelect v-model="form.temporadaMaterial" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="R7 2022-2023">R7 2022-2023</option>
              <option value="R8 2023-2024">R8 2023-2024</option>
              <option value="R9 2024-2025">R9 2024-2025</option>
            </CFormSelect>
          </CCol>
        </CRow>
        <CRow class="mt-3">
          <CCol sm="6">
            <CFormLabel>Bodega Origen</CFormLabel>
            <CFormSelect v-model="form.bodegaOrigen" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="RANCO">RANCO</option>
              <option value="CENTRO ARMADO">CENTRO ARMADO</option>
              <option value="BODEGA PLANTA">BODEGA PLANTA</option>
            </CFormSelect>
          </CCol>
          <CCol sm="6">
            <CFormLabel>Bodega Destino</CFormLabel>
            <CFormSelect v-model="form.bodegaDestino" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="RANCO">RANCO</option>
              <option value="CENTRO ARMADO">CENTRO ARMADO</option>
              <option value="BODEGA PLANTA">BODEGA PLANTA</option>
            </CFormSelect>
          </CCol>
        </CRow>
        <CRow class="mt-3">
          <CCol sm="6">
            <CFormLabel>Ubicación Origen</CFormLabel>
            <CFormSelect v-model="form.ubicacionOrigen" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="BODEGA PLANTA">BODEGA PLANTA</option>
              <option value="ALTILLO PACKING">ALTILLO PACKING</option>
              <option value="SECTOR A">SECTOR A</option>
            </CFormSelect>
          </CCol>
          <CCol sm="6">
            <CFormLabel>Ubicación Destino</CFormLabel>
            <CFormSelect v-model="form.ubicacionDestino" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="BODEGA PLANTA">BODEGA PLANTA</option>
              <option value="ALTILLO PACKING">ALTILLO PACKING</option>
              <option value="SECTOR A">SECTOR A</option>
            </CFormSelect>
          </CCol>
        </CRow>
        <CRow class="mt-3">
          <CCol sm="6">
            <CFormLabel>Guía SII</CFormLabel>
            <CFormInput v-model="form.guiaSii" />
          </CCol>
          <CCol sm="6">
            <CFormLabel>Fecha</CFormLabel>
            <CFormInput type="date" v-model="form.fecha" />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- ========== DATOS LOTE ========== -->
    <CCard class="mb-4 border-danger">
      <CCardHeader class="bg-danger text-white">
        <strong>Datos Lote</strong>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol sm="4">
            <CFormLabel>Lote</CFormLabel>
            <CFormInput v-model="form.lote" />
          </CCol>
          <CCol sm="4">
            <CFormLabel>Nombre Proveedor</CFormLabel>
            <CFormSelect v-model="form.proveedor" class="form-select-red">
              <option value="">Buscar Proveedor...</option>
              <option value="PROVEEDOR A">PROVEEDOR A</option>
              <option value="PROVEEDOR B">PROVEEDOR B</option>
              <option value="PROVEEDOR C">PROVEEDOR C</option>
            </CFormSelect>
          </CCol>
          <CCol sm="4">
            <CFormLabel>Clasificación</CFormLabel>
            <CFormSelect v-model="form.clasificacion" class="form-select-red">
              <option value="">Seleccionar...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- ========== ACCIONES ========== -->
    <div class="d-flex gap-3 mb-4">
      <CButton color="danger" size="lg" @click="abrirEscaner" class="btn-scan">
        <i class="fas fa-qrcode"></i> Escanear materiales
      </CButton>
      <CButton color="secondary" @click="mostrarIngresoManual = true" class="btn-manual">
        <i class="fas fa-plus"></i> Agregar manualmente
      </CButton>
    </div>

    <!-- ========== MATERIALES ESCANEADOS (ACTUALIZACIÓN AUTOMÁTICA) ========== -->
    <CCard v-if="store.materiales.length > 0" class="mb-4 border-success">
      <CCardHeader class="bg-success text-white d-flex justify-content-between align-items-center">
        <strong>Materiales Agregados ({{ store.materiales.length }})</strong>
        <CBadge color="light" class="text-dark">
          {{ formatoUltimoQR }}
        </CBadge>
      </CCardHeader>
      <CCardBody>
        <!-- Información del QR escaneado -->
        <div v-if="ultimoQrInfo" class="alert alert-info mb-3">
          <div class="row">
            <div class="col-md-6">
              <small><strong>Proveedor:</strong> {{ ultimoQrInfo.proveedor || 'N/A' }}</small><br>
              <small><strong>Lote:</strong> {{ ultimoQrInfo.lote || 'N/A' }}</small><br>
              <small><strong>Guía:</strong> {{ ultimoQrInfo.guia || 'N/A' }}</small>
            </div>
            <div class="col-md-6">
              <small><strong>Cantidad:</strong> {{ ultimoQrInfo.cantidad || 'N/A' }}</small><br>
              <small><strong>Número:</strong> {{ ultimoQrInfo.numero || 'N/A' }}</small><br>
              <small><strong>Fecha:</strong> {{ ultimoQrInfo.fecha || 'N/A' }}</small>
            </div>
          </div>
        </div>

        <!-- Tabla de materiales como en el prototipo -->
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow class="table-header-red">
              <CTableHeaderCell>Cod material</CTableHeaderCell>
              <CTableHeaderCell>Lote</CTableHeaderCell>
              <CTableHeaderCell>Nombre Material</CTableHeaderCell>
              <CTableHeaderCell>Clasificación</CTableHeaderCell>
              <CTableHeaderCell>Total</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(material, index) in store.materiales" :key="index">
              <CTableDataCell>{{ material.codigo }}</CTableDataCell>
              <CTableDataCell>{{ material.lote || form.lote || 'ASD' }}</CTableDataCell>
              <CTableDataCell>{{ material.nombreCompleto || material.nombreCorto }}</CTableDataCell>
              <CTableDataCell>{{ material.clasificacion || form.clasificacion || 'ASD' }}</CTableDataCell>
              <CTableDataCell>{{ material.cantidad }} {{ material.medida }}</CTableDataCell>
              <CTableDataCell>
                <CButton color="danger" size="sm" @click="eliminarMaterial(index)">
                  <i class="fas fa-trash"></i>
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>

    <!-- ========== BOTONES FINALES ========== -->
    <div class="text-center">
      <CButton color="secondary" size="lg" class="me-3" @click="resumenVisible = true">
        Ver resumen
      </CButton>
      <CButton color="danger" size="lg" @click="guardar" :disabled="store.materiales.length === 0">
        Guardar
      </CButton>
    </div>

    <!-- ========== ESCANER QR ========== -->
    <CModal fullscreen :visible="mostrarEscaner" @close="cerrarEscaner">
      <CModalHeader>
        <CModalTitle>📱 Escanear Tarja</CModalTitle>
      </CModalHeader>
      <CModalBody class="p-0">
        <div class="scanner-fullscreen">
          <QrScannerNew 
            @decode="onQrDecoded"
            @error="onQrError"
            @close="cerrarEscaner"
          />
        </div>
      </CModalBody>
    </CModal>

    <!-- ========== INGRESO MANUAL ========== -->
    <CModal size="lg" :visible="mostrarIngresoManual" @close="mostrarIngresoManual = false">
      <CModalHeader>
        <CModalTitle>Completa los campos para agregar los materiales</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-for="i in 4" :key="i" class="material-manual-card mb-3">
          <h6 class="text-danger mb-2">{{ i === 1 ? 'Primer' : i === 2 ? 'Segundo' : i === 3 ? 'Tercer' : 'Cuarto' }} material</h6>
          <CFormSelect v-model="materialesManuales[i-1].tipo" class="mb-2">
            <option disabled value="">Buscar material</option>
            <option v-for="m in materialesUnicos" :key="m.codigo" :value="m">
              {{ m.codigo }} {{ m.nombreCorto }}
            </option>
          </CFormSelect>
          <CRow>
            <CCol sm="3">
              <CFormLabel>Cantidad * UL</CFormLabel>
              <CFormInput type="number" v-model="materialesManuales[i-1].cantidadUL" />
            </CCol>
            <CCol sm="3">
              <CFormLabel>Total Unidades</CFormLabel>
              <CFormInput type="number" v-model="materialesManuales[i-1].totalUnidades" />
            </CCol>
            <CCol sm="3">
              <CFormLabel>Cantidad total</CFormLabel>
              <CFormInput type="number" v-model="materialesManuales[i-1].cantidadTotal" />
            </CCol>
            <CCol sm="3">
              <CFormLabel>Medida</CFormLabel>
              <CFormInput v-model="materialesManuales[i-1].medida" placeholder="UNIDAD" />
            </CCol>
          </CRow>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="mostrarIngresoManual = false">Salir</CButton>
        <CButton color="danger" @click="confirmarManual">Agregar</CButton>
      </CModalFooter>
    </CModal>

    <!-- ========== RESUMEN TRAZABILIDAD ========== -->
    <CModal size="xl" :visible="resumenVisible" @close="resumenVisible = false">
      <CModalHeader class="bg-danger text-white">
        <CModalTitle>RESUMEN TRAZABILIDAD</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow>
          <CCol md="6">
            <h6 class="text-danger">Turno</h6>
            <p>{{ form.turno === '1' ? 'Turno 1' : 'Turno 2' }}</p>
            
            <h6 class="text-danger">Temporada Material</h6>
            <p>{{ form.temporadaMaterial || 'No especificado' }}</p>
            
            <h6 class="text-danger">Bodega Origen</h6>
            <p>{{ form.bodegaOrigen || 'No especificado' }}</p>
            
            <h6 class="text-danger">Ubicación Origen</h6>
            <p>{{ form.ubicacionOrigen || 'No especificado' }}</p>
            
            <h6 class="text-danger">Guía SII</h6>
            <p>{{ form.guiaSii || 'No especificado' }}</p>
          </CCol>
          <CCol md="6">
            <h6 class="text-danger">Tipo de Movimiento</h6>
            <p>{{ form.tipoMovimiento || 'No especificado' }}</p>
            
            <h6 class="text-danger">Bodega Destino</h6>
            <p>{{ form.bodegaDestino || 'No especificado' }}</p>
            
            <h6 class="text-danger">Ubicación Destino</h6>
            <p>{{ form.ubicacionDestino || 'No especificado' }}</p>
            
            <h6 class="text-danger">Fecha</h6>
            <p>{{ form.fecha }}</p>
          </CCol>
        </CRow>

        <hr>

        <!-- Tabla de materiales en resumen -->
        <CTable striped hover v-if="store.materiales.length > 0">
          <CTableHead>
            <CTableRow class="table-header-red">
              <CTableHeaderCell>Cod material</CTableHeaderCell>
              <CTableHeaderCell>Lote</CTableHeaderCell>
              <CTableHeaderCell>Nombre Material</CTableHeaderCell>
              <CTableHeaderCell>Clasificación</CTableHeaderCell>
              <CTableHeaderCell>Total</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(material, index) in store.materiales" :key="index">
              <CTableDataCell>{{ material.codigo }}</CTableDataCell>
              <CTableDataCell>{{ material.lote || form.lote || 'ASD' }}</CTableDataCell>
              <CTableDataCell>{{ material.nombreCompleto || material.nombreCorto }}</CTableDataCell>
              <CTableDataCell>{{ material.clasificacion || form.clasificacion || 'ASD' }}</CTableDataCell>
              <CTableDataCell>{{ material.cantidad }} {{ material.medida }}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
        <div v-else class="text-center py-4">
          <p class="text-muted">No hay materiales agregados</p>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="resumenVisible = false">Cerrar</CButton>
        <CButton color="danger" @click="guardar">Guardar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import { useMaterialStore } from '@/stores/materialStore'
import QrScannerNew from '@/components/QrScannerNew.vue'
import logoImage from '@/assets/icons/LogoColor.ddc5d2c8.png'

const store = useMaterialStore()

// Form principal siguiendo el prototipo
const form = ref({
  turno: '1',
  tipoMovimiento: '',
  temporadaMaterial: '',
  bodegaOrigen: '',
  bodegaDestino: '',
  ubicacionOrigen: '',
  ubicacionDestino: '',
  guiaSii: '',
  fecha: new Date().toISOString().split("T")[0],
  lote: '',
  proveedor: '',
  clasificacion: ''
})

// Variables de estado
const mostrarEscaner = ref(false)
const mostrarIngresoManual = ref(false)
const resumenVisible = ref(false)
const formatoUltimoQR = ref('')
const ultimoQrInfo = ref(null)

// Materiales únicos del CSV
const materialesUnicos = ref([])

// Materiales para ingreso manual
const materialesManuales = ref([
  { tipo: '', cantidadUL: 0, totalUnidades: 0, cantidadTotal: 0, medida: 'UNIDAD' },
  { tipo: '', cantidadUL: 0, totalUnidades: 0, cantidadTotal: 0, medida: 'UNIDAD' },
  { tipo: '', cantidadUL: 0, totalUnidades: 0, cantidadTotal: 0, medida: 'UNIDAD' },
  { tipo: '', cantidadUL: 0, totalUnidades: 0, cantidadTotal: 0, medida: 'UNIDAD' }
])

// Función para reducir nombres largos
function reducirNombre(nombre) {
  if (!nombre) return ''
  
  const palabrasComunes = ['DE', 'PARA', 'CON', 'SIN', 'EN', 'LA', 'EL', 'Y', 'O', 'A', 'UN', 'UNA']
  
  let nombreLimpio = nombre
    .toUpperCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(palabra => palabra.length > 2 && !palabrasComunes.includes(palabra))
    .slice(0, 4)
    .join(' ')
  
  if (nombreLimpio.length > 25) {
    nombreLimpio = nombreLimpio.substring(0, 22) + '...'
  }
  
  return nombreLimpio || nombre.substring(0, 20)
}

onMounted(async () => {
  try {
    const response = await fetch('/materiales.csv')
    const text = await response.text()
    const result = Papa.parse(text, { header: true, skipEmptyLines: true })
    
    const uniqueMap = new Map()
    result.data.forEach((row) => {
      if (row['Cod Nombre'] && !uniqueMap.has(row['Cod Nombre'])) {
        const materialOptimizado = {
          codigo: row['Cod Nombre'],
          nombreOriginal: row['Nombre'],
          nombreCorto: reducirNombre(row['Nombre']),
          unidad: (row['Unidad de medida'] || 'UN').substring(0, 5),
          clasificacion: (row['Clasificacion'] || '').substring(0, 15),
          'Cod Nombre': row['Cod Nombre'],
          'Nombre': reducirNombre(row['Nombre']),
          'Unidad de medida': (row['Unidad de medida'] || 'UN').substring(0, 5)
        }
        uniqueMap.set(row['Cod Nombre'], materialOptimizado)
      }
    })
    
    materialesUnicos.value = Array.from(uniqueMap.values())
    console.log("📋 Materiales únicos cargados:", materialesUnicos.value.length)
  } catch (err) {
    console.error("❌ Error cargando CSV:", err)
  }
})

// Funciones del escáner
function abrirEscaner() {
  console.log("🎬 Abriendo escáner QR...")
  mostrarEscaner.value = true
}

function cerrarEscaner() {
  mostrarEscaner.value = false
  console.log("📷 Escáner cerrado")
}

// Procesamiento MEJORADO de QR con actualización automática
function onQrDecoded(data) {
  console.log("📸 ========== QR DECODIFICADO ==========")
  console.log("📸 Data recibida:", data)
  
  try {
    const qrContent = data.raw || data
    console.log("📸 Contenido QR:", qrContent)
    
    // Limpiar materiales anteriores
    store.limpiar()
    
    // Parsear JSON
    const parsed = JSON.parse(qrContent)
    console.log("✅ JSON parseado exitosamente:", parsed)
    
    let materialesAgregados = 0
    
    // FORMATO 1: TarjasCAA compacto {d, m: [{c, n, q, u}], l, qt, no, f}
    if (parsed.m && Array.isArray(parsed.m) && parsed.m.length > 0) {
      formatoUltimoQR.value = "TarjasCAA"
      console.log("🎯 Formato detectado: TarjasCAA")
      
      // Guardar información del QR
      ultimoQrInfo.value = {
        descripcion: parsed.d,
        lote: parsed.l,
        cantidad: parsed.qt,
        numero: parsed.no,
        fecha: parsed.f,
        proveedor: parsed.p || 'N/A',
        guia: parsed.g || 'N/A'
      }
      
      // Actualizar formulario automáticamente
      if (parsed.l) form.value.lote = parsed.l
      if (parsed.f) form.value.fecha = parsed.f
      if (parsed.p) form.value.proveedor = parsed.p
      if (parsed.g) form.value.guiaSii = parsed.g
      
      // Procesar materiales
      parsed.m.forEach((mat, index) => {
        console.log(`📦 Material ${index + 1}:`, mat)
        
        const material = {
          codigo: mat.c || `MAT${index + 1}`,
          nombreCorto: (mat.n || 'Material sin nombre').substring(0, 30),
          nombreCompleto: mat.n || 'Material sin nombre',
          cantidad: Number(mat.q) || 1,
          medida: mat.u || 'UN',
          lote: parsed.l,
          clasificacion: form.value.clasificacion,
          'Cod Nombre': mat.c || `MAT${index + 1}`,
          'Nombre': (mat.n || 'Material sin nombre').substring(0, 30),
          'Unidad de medida': mat.u || 'UN',
          origen: 'qr-caa'
        }
        
        if (store.agregar(material)) {
          materialesAgregados++
        }
      })
    }
    
    // FORMATO 2: TarjasBodega completo {descripcion, materiales: [...], proveedor, guia, lote, cantidad, numero, fecha}
    else if (parsed.materiales && Array.isArray(parsed.materiales) && parsed.materiales.length > 0) {
      formatoUltimoQR.value = "TarjasBodega"
      console.log("🎯 Formato detectado: TarjasBodega")
      
      // Guardar información del QR
      ultimoQrInfo.value = {
        descripcion: parsed.descripcion,
        proveedor: parsed.proveedor,
        lote: parsed.lote,
        guia: parsed.guia,
        cantidad: parsed.cantidad,
        numero: parsed.numero,
        fecha: parsed.fecha
      }
      
      // Actualizar formulario automáticamente
      if (parsed.proveedor) form.value.proveedor = parsed.proveedor
      if (parsed.lote) form.value.lote = parsed.lote
      if (parsed.fecha) form.value.fecha = parsed.fecha
      if (parsed.guia) form.value.guiaSii = parsed.guia
      
      // Procesar materiales
      parsed.materiales.forEach((mat, index) => {
        console.log(`📦 Material ${index + 1}:`, mat)
        
        const material = {
          codigo: mat['Cod Nombre'] || `MAT${index + 1}`,
          nombreCorto: (mat['Nombre'] || 'Material sin nombre').substring(0, 30),
          nombreCompleto: mat['Nombre'] || 'Material sin nombre',
          cantidad: 1, // TarjasBodega no especifica cantidad individual
          medida: mat['Unidad de medida'] || 'UN',
          lote: parsed.lote,
          clasificacion: form.value.clasificacion,
          'Cod Nombre': mat['Cod Nombre'] || `MAT${index + 1}`,
          'Nombre': (mat['Nombre'] || 'Material sin nombre').substring(0, 30),
          'Unidad de medida': mat['Unidad de medida'] || 'UN',
          origen: 'qr-bodega'
        }
        
        if (store.agregar(material)) {
          materialesAgregados++
        }
      })
    }
    
    // FORMATO NO RECONOCIDO
    else {
      console.warn("⚠️ Formato QR no reconocido:", parsed)
      setTimeout(() => {
        mostrarEscaner.value = false
        alert(`⚠️ Formato QR no reconocido\n\nPropiedades encontradas: ${Object.keys(parsed).join(', ')}`)
      }, 1000)
      return
    }
    
    console.log(`✅ ${materialesAgregados} materiales agregados`)
    console.log("📊 Total materiales en store:", store.materiales.length)
    
    // Cerrar escáner y mostrar actualización automática
    setTimeout(() => {
      mostrarEscaner.value = false
      if (store.materiales.length > 0) {
        // La interfaz se actualiza automáticamente gracias a la reactividad
        console.log("✅ Materiales agregados automáticamente a la interfaz")
      } else {
        alert("⚠️ No se pudieron cargar los materiales")
      }
    }, 1000)
    
  } catch (err) {
    console.error("❌ Error procesando QR:", err)
    setTimeout(() => {
      mostrarEscaner.value = false
      alert(`❌ Error al leer QR: ${err.message}`)
    }, 1000)
  }
}

function onQrError(error) {
  console.error("❌ Error del scanner:", error)
}

// Ingreso manual
function confirmarManual() {
  materialesManuales.value.filter(m => m.tipo).forEach(m => {
    store.agregar({
      codigo: m.tipo.codigo,
      nombreCorto: m.tipo.nombreCorto,
      nombreCompleto: m.tipo.nombreOriginal,
      cantidad: m.cantidadTotal,
      medida: m.medida,
      lote: form.value.lote,
      clasificacion: form.value.clasificacion,
      'Cod Nombre': m.tipo.codigo,
      'Nombre': m.tipo.nombreCorto,
      origen: 'manual'
    })
  })
  mostrarIngresoManual.value = false
  
  // Limpiar formulario manual
  materialesManuales.value.forEach(m => {
    m.tipo = ''
    m.cantidadUL = 0
    m.totalUnidades = 0
    m.cantidadTotal = 0
    m.medida = 'UNIDAD'
  })
}

// Eliminar material
function eliminarMaterial(index) {
  if (confirm(`¿Eliminar ${store.materiales[index].nombreCorto}?`)) {
    store.materiales.splice(index, 1)
  }
}

// Guardar trazabilidad
function guardar() {
  console.log('Guardando Trazabilidad:', form.value, store.materiales)
  alert('Trazabilidad guardada exitosamente ✅')
  resumenVisible.value = false
  
  // Limpiar después de guardar
  store.limpiar()
  ultimoQrInfo.value = null
  formatoUltimoQR.value = ''
  
  // Reset form
  form.value = {
    turno: '1',
    tipoMovimiento: '',
    temporadaMaterial: '',
    bodegaOrigen: '',
    bodegaDestino: '',
    ubicacionOrigen: '',
    ubicacionDestino: '',
    guiaSii: '',
    fecha: new Date().toISOString().split("T")[0],
    lote: '',
    proveedor: '',
    clasificacion: ''
  }
}
</script>

<style scoped>
/* ========== HEADER ESTILO PROTOTIPO ========== */
.header {
  background: #fff;
  border-bottom: 3px solid #dc3545;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo {
  width: 80px;
  height: auto;
}

.title {
  color: #dc3545;
  font-weight: 700;
  font-size: 1.8rem;
  margin: 0;
}

.r9 {
  border: 2px solid #dc3545;
  color: #dc3545;
  padding: 8px 12px;
  font-weight: bold;
  border-radius: 4px;
  background: #fff;
}

/* ========== FORMULARIOS ROJOS ========== */
.form-select-red {
  border-color: #dc3545;
}

.form-select-red:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-check-input:checked {
  background-color: #dc3545;
  border-color: #dc3545;
}

.form-check-input:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* ========== BOTONES ========== */
.btn-scan {
  background: linear-gradient(45deg, #dc3545, #c82333);
  border: none;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
  transition: all 0.3s ease;
}

.btn-scan:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 53, 69, 0.4);
}

.btn-manual {
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-manual:hover {
  transform: translateY(-2px);
}

/* ========== TABLA ESTILO PROTOTIPO ========== */
.table-header-red {
  background-color: #dc3545 !important;
  color: white !important;
}

.table-header-red th {
  border-color: #dc3545 !important;
  font-weight: 600;
  text-align: center;
}

.table tbody tr:hover {
  background-color: rgba(220, 53, 69, 0.05);
}

.table td {
  vertical-align: middle;
  text-align: center;
}

/* ========== CARDS ========== */
.border-danger {
  border-color: #dc3545 !important;
  border-width: 2px !important;
}

.border-success {
  border-color: #198754 !important;
  border-width: 2px !important;
}

/* ========== MATERIAL MANUAL CARDS ========== */
.material-manual-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
}

.material-manual-card h6 {
  font-weight: 600;
  margin-bottom: 10px;
}

/* ========== SCANNER FULLSCREEN ========== */
.scanner-fullscreen {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
}

.scanner-fullscreen .qrcode-stream-camera {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

/* ========== ALERTAS ========== */
.alert {
  border-radius: 8px;
  font-size: 0.9rem;
}

.alert-info {
  background-color: rgba(13, 202, 240, 0.1);
  border-color: #0dcaf0;
  color: #055160;
}

/* ========== BADGES ========== */
.badge {
  font-size: 0.8rem;
  padding: 6px 10px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .header {
    padding: 10px;
  }
  
  .logo {
    width: 60px;
  }
  
  .title {
    font-size: 1.4rem;
  }
  
  .r9 {
    padding: 6px 8px;
    font-size: 0.9rem;
  }
  
  .btn-scan, .btn-manual {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 10px !important;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
  
  .material-manual-card {
    padding: 10px;
  }
}

/* ========== ANIMACIONES ========== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ========== MEJORAS VISUALES ========== */
.c-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.form-control:focus, .form-select:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* ========== ICONOS ========== */
.fas {
  margin-right: 8px;
}
</style>
