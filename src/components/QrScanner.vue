<template>
  <div class="qr-scanner-simple">
    <!-- Scanner directo -->
    <qrcode-stream
      @decode="onDecode"
      @init="onInit"
      @detect="onDetect"
      :track="paintBoundingBox"
      :constraints="cameraConstraints"
      class="scanner-camera"
    />
    
    <!-- Overlay con información -->
    <div class="scanner-overlay">
      <div class="scanner-info">
        <div v-if="status" class="status-message" :class="statusClass">
          {{ status }}
        </div>
        
        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>
        
        <div v-if="detectCount > 0" class="detect-counter">
          🎯 QRs detectados: {{ detectCount }}
        </div>
        
        <div v-if="lastQrPreview" class="qr-preview">
          <small>Último: {{ lastQrPreview }}...</small>
        </div>
      </div>
      
      <!-- Botones de control -->
      <div class="scanner-controls">
        <button @click="switchCamera" class="btn btn-secondary">
          🔄 Cambiar Cámara
        </button>
        <button @click="resetScanner" class="btn btn-warning">
          🔄 Reset
        </button>
        <button @click="$emit('close')" class="btn btn-danger">
          ❌ Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

// Emits
const emit = defineEmits(['decode', 'error', 'close'])

// Estado del scanner
const status = ref('')
const error = ref('')
const detectCount = ref(0)
const lastQrPreview = ref('')
const currentCamera = ref('environment')

// Configuración de cámara
const cameraConstraints = computed(() => ({
  audio: false,
  video: {
    facingMode: currentCamera.value,
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 }
  }
}))

// Clases CSS dinámicas
const statusClass = computed(() => ({
  'status-success': status.value.includes('✅'),
  'status-info': status.value.includes('📷') || status.value.includes('🎯'),
  'status-warning': status.value.includes('🔄')
}))

// Inicialización de la cámara
function onInit(promise) {
  console.log("📷 Inicializando cámara...")
  status.value = 'Iniciando cámara...'
  error.value = ''
  
  promise
    .then(() => {
      console.log("✅ Cámara inicializada")
      status.value = `📷 Cámara ${currentCamera.value === 'environment' ? 'trasera' : 'frontal'} activa`
      error.value = ''
    })
    .catch(err => {
      console.error("❌ Error cámara:", err)
      status.value = ''
      
      if (err.name === "NotAllowedError") {
        error.value = "Permiso de cámara denegado"
      } else if (err.name === "NotFoundError") {
        error.value = "No se encontró cámara"
      } else if (err.name === "NotSupportedError") {
        error.value = "Navegador no soporta cámara"
      } else if (err.name === "InsecureContextError") {
        error.value = "Se requiere HTTPS"
      } else {
        error.value = `Error: ${err.message}`
      }
      
      emit('error', error.value)
    })
}

// Detección visual
function onDetect(detectedCodes) {
  if (detectedCodes.length > 0) {
    detectCount.value++
    status.value = `🎯 QR encontrado (${detectCount.value}) - Decodificando...`
    
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  }
}

// Pintar bounding box
function paintBoundingBox(detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const { boundingBox } = detectedCode

    ctx.lineWidth = 4
    ctx.strokeStyle = '#00ff00'
    ctx.strokeRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    )

    ctx.fillStyle = '#00ff00'
    ctx.font = 'bold 16px Arial'
    ctx.fillText('✅ QR DETECTADO', boundingBox.x, boundingBox.y - 10)
  }
}

// Decodificación SIMPLE Y DIRECTA
function onDecode(result) {
  console.log("📸 ========== QR DECODIFICADO SIMPLE ==========")
  console.log("📸 Contenido:", result)
  
  lastQrPreview.value = result.substring(0, 50)
  status.value = '🔄 Procesando...'
  
  // Vibración de éxito
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200])
  }
  
  // Emitir directamente el contenido raw
  emit('decode', { raw: result })
}

// Cambiar cámara
function switchCamera() {
  currentCamera.value = currentCamera.value === 'environment' ? 'user' : 'environment'
  status.value = `Cambiando a cámara ${currentCamera.value === 'environment' ? 'trasera' : 'frontal'}...`
  console.log("🔄 Cambiando cámara:", currentCamera.value)
}

// Reset
function resetScanner() {
  detectCount.value = 0
  error.value = ''
  status.value = 'Scanner reseteado'
  lastQrPreview.value = ''
  console.log("🔄 Scanner reseteado")
}
</script>

<style scoped>
.qr-scanner-simple {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.scanner-camera {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
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

.status-message, .error-message, .detect-counter, .qr-preview {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  margin: 5px 0;
  font-size: 14px;
  text-align: center;
}

.status-success {
  background: rgba(25, 135, 84, 0.9) !important;
  border: 1px solid #198754;
}

.status-info {
  background: rgba(13, 202, 240, 0.9) !important;
  border: 1px solid #0dcaf0;
}

.status-warning {
  background: rgba(255, 193, 7, 0.9) !important;
  color: #000 !important;
  border: 1px solid #ffc107;
}

.error-message {
  background: rgba(220, 53, 69, 0.9) !important;
  border: 1px solid #dc3545;
}

.detect-counter {
  background: rgba(25, 135, 84, 0.9) !important;
  border: 1px solid #198754;
}

.qr-preview {
  background: rgba(255, 193, 7, 0.9) !important;
  color: #000 !important;
  border: 1px solid #ffc107;
  font-family: monospace;
  font-size: 12px;
}

.btn {
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #6c757d;
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

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
    width: 150px;
    margin: 3px 0;
  }
}
</style>
