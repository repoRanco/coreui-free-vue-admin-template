<template>
  <div class="qr-scanner-new">
    <!-- Video element para el scanner -->
    <video 
      ref="videoElement" 
      class="scanner-video"
      :class="{ 'scanner-active': isScanning }"
    ></video>
    
    <!-- Overlay con información -->
    <div class="scanner-overlay">
      <div class="scanner-info">
        <div v-if="status" class="status-message" :class="statusType">
          {{ status }}
        </div>
        
        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>
        
        <div v-if="lastResult" class="result-preview">
          <small>Último QR: {{ lastResult.substring(0, 50) }}...</small>
        </div>
      </div>
      
      <!-- Controles -->
      <div class="scanner-controls">
        <button @click="toggleCamera" class="btn btn-secondary" :disabled="!isScanning">
          🔄 Cambiar Cámara
        </button>
        <button @click="startScanning" class="btn btn-success" v-if="!isScanning">
          ▶️ Iniciar
        </button>
        <button @click="stopScanning" class="btn btn-warning" v-if="isScanning">
          ⏸️ Pausar
        </button>
        <button @click="closeScanner" class="btn btn-danger">
          ❌ Cerrar
        </button>
      </div>
    </div>
    
    <!-- Marco de enfoque -->
    <div class="focus-frame" v-if="isScanning">
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import QrScanner from 'qr-scanner'

// Emits
const emit = defineEmits(['decode', 'error', 'close'])

// Referencias
const videoElement = ref(null)
let qrScanner = null

// Estado
const isScanning = ref(false)
const status = ref('')
const error = ref('')
const lastResult = ref('')
const statusType = ref('')
const currentCamera = ref('environment')

// Inicializar scanner
onMounted(async () => {
  try {
    console.log("🔧 Inicializando QR Scanner con qr-scanner library...")
    
    // Verificar si hay cámaras disponibles
    const hasCamera = await QrScanner.hasCamera()
    if (!hasCamera) {
      throw new Error('No se encontraron cámaras en el dispositivo')
    }
    
    // Crear scanner
    qrScanner = new QrScanner(
      videoElement.value,
      (result) => onScanSuccess(result),
      {
        onDecodeError: (err) => onScanError(err),
        preferredCamera: currentCamera.value,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      }
    )
    
    console.log("✅ QR Scanner creado exitosamente")
    status.value = 'Scanner listo - Presiona Iniciar'
    statusType.value = 'info'
    
  } catch (err) {
    console.error("❌ Error inicializando scanner:", err)
    error.value = `Error de inicialización: ${err.message}`
    emit('error', error.value)
  }
})

// Limpiar al desmontar
onUnmounted(() => {
  if (qrScanner) {
    qrScanner.destroy()
    console.log("🧹 QR Scanner destruido")
  }
})

// Iniciar escaneo
async function startScanning() {
  if (!qrScanner) return
  
  try {
    console.log("▶️ Iniciando escaneo...")
    status.value = 'Iniciando cámara...'
    statusType.value = 'info'
    error.value = ''
    
    await qrScanner.start()
    
    isScanning.value = true
    status.value = '📷 Escaneando - Apunta al QR'
    statusType.value = 'success'
    
    console.log("✅ Escaneo iniciado")
    
  } catch (err) {
    console.error("❌ Error iniciando escaneo:", err)
    error.value = getErrorMessage(err)
    emit('error', error.value)
  }
}

// Detener escaneo
function stopScanning() {
  if (!qrScanner) return
  
  try {
    qrScanner.stop()
    isScanning.value = false
    status.value = 'Escaneo pausado'
    statusType.value = 'warning'
    console.log("⏸️ Escaneo detenido")
  } catch (err) {
    console.error("❌ Error deteniendo escaneo:", err)
  }
}

// Cambiar cámara
async function toggleCamera() {
  if (!qrScanner || !isScanning.value) return
  
  try {
    console.log("🔄 Cambiando cámara...")
    status.value = 'Cambiando cámara...'
    statusType.value = 'info'
    
    // Obtener lista de cámaras
    const cameras = await QrScanner.listCameras(true)
    console.log("📷 Cámaras disponibles:", cameras)
    
    if (cameras.length > 1) {
      // Cambiar a la siguiente cámara
      const currentIndex = cameras.findIndex(cam => cam.id === qrScanner.getCamera()?.id)
      const nextIndex = (currentIndex + 1) % cameras.length
      const nextCamera = cameras[nextIndex]
      
      await qrScanner.setCamera(nextCamera.id)
      
      status.value = `📷 Cámara: ${nextCamera.label || 'Cámara ' + (nextIndex + 1)}`
      statusType.value = 'success'
      
      console.log("✅ Cámara cambiada a:", nextCamera.label)
    } else {
      status.value = 'Solo hay una cámara disponible'
      statusType.value = 'warning'
    }
    
  } catch (err) {
    console.error("❌ Error cambiando cámara:", err)
    error.value = `Error cambiando cámara: ${err.message}`
  }
}

// Éxito en escaneo
function onScanSuccess(result) {
  console.log("🎯 ========== QR ESCANEADO EXITOSAMENTE ==========")
  console.log("📸 Resultado:", result)
  console.log("📸 Tipo:", typeof result)
  console.log("📸 Contenido:", result.data || result)
  
  const qrContent = result.data || result
  lastResult.value = qrContent
  
  status.value = '✅ QR detectado - Procesando...'
  statusType.value = 'success'
  
  // Vibración en móvil
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200])
  }
  
  // Emitir resultado
  emit('decode', { raw: qrContent })
  
  // Pausar escaneo temporalmente
  setTimeout(() => {
    if (isScanning.value) {
      status.value = '📷 Escaneando - Apunta al QR'
      statusType.value = 'success'
    }
  }, 2000)
}

// Error en escaneo
function onScanError(err) {
  // No mostrar errores de decodificación normales (cuando no hay QR visible)
  if (err.name === 'NotFoundException') {
    return // Es normal cuando no hay QR en vista
  }
  
  console.warn("⚠️ Error de escaneo:", err)
  // Solo mostrar errores críticos
}

// Cerrar scanner
function closeScanner() {
  stopScanning()
  emit('close')
}

// Obtener mensaje de error amigable
function getErrorMessage(err) {
  if (err.name === 'NotAllowedError') {
    return 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.'
  } else if (err.name === 'NotFoundError') {
    return 'No se encontró ninguna cámara en el dispositivo.'
  } else if (err.name === 'NotSupportedError') {
    return 'El navegador no soporta acceso a cámara.'
  } else if (err.name === 'NotReadableError') {
    return 'La cámara está siendo usada por otra aplicación.'
  } else if (err.name === 'OverconstrainedError') {
    return 'No se pudo configurar la cámara con los parámetros solicitados.'
  } else if (err.name === 'SecurityError') {
    return 'Se requiere conexión HTTPS para usar la cámara.'
  } else {
    return `Error de cámara: ${err.message}`
  }
}
</script>

<style scoped>
.qr-scanner-new {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.scanner-video.scanner-active {
  border: 3px solid #00ff00;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.scanner-info {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  pointer-events: auto;
}

.scanner-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.status-message, .error-message, .result-preview {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  margin: 5px 0;
  font-size: 14px;
  text-align: center;
  font-weight: bold;
}

.status-message.success {
  background: rgba(25, 135, 84, 0.9);
  border: 2px solid #198754;
}

.status-message.info {
  background: rgba(13, 202, 240, 0.9);
  border: 2px solid #0dcaf0;
}

.status-message.warning {
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  border: 2px solid #ffc107;
}

.error-message {
  background: rgba(220, 53, 69, 0.9);
  border: 2px solid #dc3545;
}

.result-preview {
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  border: 2px solid #ffc107;
  font-family: monospace;
  font-size: 12px;
}

.btn {
  padding: 12px 18px;
  border-radius: 25px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #198754;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #000;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Marco de enfoque */
.focus-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #00ff00;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

/* Responsive */
@media (max-width: 768px) {
  .scanner-info {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .scanner-controls {
    bottom: 20px;
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 160px;
    margin: 3px 0;
  }
  
  .focus-frame {
    width: 200px;
    height: 200px;
  }
}
</style>
