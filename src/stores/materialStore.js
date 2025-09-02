import { defineStore } from 'pinia'

export const useMaterialStore = defineStore('materialStore', {
  state: () => ({
    materiales: [],
    ultimaActualizacion: null,
    errores: []
  }),
  
  getters: {
    // Obtener materiales únicos por código
    materialesUnicos: (state) => {
      const uniqueMap = new Map()
      state.materiales.forEach(material => {
        const codigo = material.codigo || material['Cod Nombre']
        if (codigo && !uniqueMap.has(codigo)) {
          uniqueMap.set(codigo, material)
        }
      })
      return Array.from(uniqueMap.values())
    },
    
    // Contar total de materiales
    totalMateriales: (state) => state.materiales.length,
    
    // Obtener materiales por código específico
    obtenerPorCodigo: (state) => (codigo) => {
      return state.materiales.filter(m => 
        (m.codigo === codigo) || (m['Cod Nombre'] === codigo)
      )
    },
    
    // Validar si hay materiales
    tieneMateriales: (state) => state.materiales.length > 0,
    
    // Obtener resumen de cantidades
    resumenCantidades: (state) => {
      return state.materiales.reduce((acc, material) => {
        const codigo = material.codigo || material['Cod Nombre']
        const cantidad = Number(material.cantidad) || 1
        
        if (acc[codigo]) {
          acc[codigo].cantidad += cantidad
        } else {
          acc[codigo] = {
            codigo,
            nombre: material.nombre || material['Nombre'] || material.nombreCorto,
            cantidad,
            medida: material.medida || material['Unidad de medida'] || 'UN'
          }
        }
        return acc
      }, {})
    }
  },
  
  actions: {
    // Agregar material con validación
    agregar(material) {
      try {
        if (!material) {
          throw new Error('Material no puede estar vacío')
        }
        
        // Normalizar el material
        const materialNormalizado = this.normalizarMaterial(material)
        
        // Validar campos requeridos
        if (!materialNormalizado.codigo) {
          throw new Error('Material debe tener un código')
        }
        
        this.materiales.push(materialNormalizado)
        this.ultimaActualizacion = new Date().toISOString()
        
        console.log('✅ Material agregado:', materialNormalizado)
        return true
        
      } catch (error) {
        console.error('❌ Error agregando material:', error)
        this.errores.push({
          tipo: 'agregar',
          mensaje: error.message,
          material,
          timestamp: new Date().toISOString()
        })
        return false
      }
    },
    
    // Agregar múltiples materiales
    agregarMultiples(materiales) {
      if (!Array.isArray(materiales)) {
        console.error('❌ agregarMultiples requiere un array')
        return false
      }
      
      let exitosos = 0
      let fallidos = 0
      
      materiales.forEach(material => {
        if (this.agregar(material)) {
          exitosos++
        } else {
          fallidos++
        }
      })
      
      console.log(`📊 Materiales procesados: ${exitosos} exitosos, ${fallidos} fallidos`)
      return { exitosos, fallidos }
    },
    
    // Normalizar material para consistencia
    normalizarMaterial(material) {
      return {
        // Campos principales
        codigo: material.codigo || material['Cod Nombre'] || '',
        nombre: material.nombre || material['Nombre'] || material.nombreCorto || '',
        nombreCorto: material.nombreCorto || (material.nombre || material['Nombre'] || '').substring(0, 25),
        nombreOriginal: material.nombreOriginal || material['Nombre'] || material.nombre || '',
        cantidad: Number(material.cantidad) || 1,
        medida: material.medida || material['Unidad de medida'] || 'UN',
        
        // Campos adicionales
        caracteristica: material.caracteristica || '',
        clasificacion: material.clasificacion || '',
        proveedor: material.proveedor || '',
        lote: material.lote || '',
        
        // Mantener compatibilidad con formato CSV
        'Cod Nombre': material.codigo || material['Cod Nombre'] || '',
        'Nombre': material.nombreCorto || material['Nombre'] || material.nombre || '',
        'Unidad de medida': material.medida || material['Unidad de medida'] || 'UN',
        
        // Metadatos
        fechaAgregado: new Date().toISOString(),
        origen: material.origen || 'manual'
      }
    },
    
    // Eliminar material por índice
    eliminar(indice) {
      if (indice >= 0 && indice < this.materiales.length) {
        const materialEliminado = this.materiales.splice(indice, 1)[0]
        this.ultimaActualizacion = new Date().toISOString()
        console.log('🗑️ Material eliminado:', materialEliminado)
        return materialEliminado
      }
      return null
    },
    
    // Eliminar por código
    eliminarPorCodigo(codigo) {
      const indicesAEliminar = []
      this.materiales.forEach((material, index) => {
        if ((material.codigo === codigo) || (material['Cod Nombre'] === codigo)) {
          indicesAEliminar.push(index)
        }
      })
      
      // Eliminar en orden inverso para no afectar índices
      indicesAEliminar.reverse().forEach(indice => {
        this.eliminar(indice)
      })
      
      return indicesAEliminar.length
    },
    
    // Actualizar material
    actualizar(indice, nuevosDatos) {
      if (indice >= 0 && indice < this.materiales.length) {
        const materialActualizado = {
          ...this.materiales[indice],
          ...nuevosDatos,
          fechaActualizado: new Date().toISOString()
        }
        
        this.materiales[indice] = this.normalizarMaterial(materialActualizado)
        this.ultimaActualizacion = new Date().toISOString()
        
        console.log('📝 Material actualizado:', this.materiales[indice])
        return true
      }
      return false
    },
    
    // Limpiar todos los materiales
    limpiar() {
      const cantidadAnterior = this.materiales.length
      this.materiales = []
      this.errores = []
      this.ultimaActualizacion = new Date().toISOString()
      
      console.log(`🧹 Store limpiado: ${cantidadAnterior} materiales eliminados`)
    },
    
    // Buscar materiales
    buscar(termino) {
      if (!termino) return this.materiales
      
      const terminoLower = termino.toLowerCase()
      return this.materiales.filter(material => {
        const codigo = (material.codigo || '').toLowerCase()
        const nombre = (material.nombre || material['Nombre'] || '').toLowerCase()
        const nombreCorto = (material.nombreCorto || '').toLowerCase()
        
        return codigo.includes(terminoLower) || 
               nombre.includes(terminoLower) || 
               nombreCorto.includes(terminoLower)
      })
    },
    
    // Exportar datos
    exportar() {
      return {
        materiales: this.materiales,
        resumen: {
          total: this.totalMateriales,
          unicos: this.materialesUnicos.length,
          ultimaActualizacion: this.ultimaActualizacion
        },
        errores: this.errores
      }
    },
    
    // Importar datos
    importar(datos) {
      try {
        if (datos.materiales && Array.isArray(datos.materiales)) {
          this.limpiar()
          return this.agregarMultiples(datos.materiales)
        }
        throw new Error('Formato de datos inválido')
      } catch (error) {
        console.error('❌ Error importando datos:', error)
        return false
      }
    },
    
    // Limpiar errores
    limpiarErrores() {
      this.errores = []
    },
    
    // Obtener estadísticas
    obtenerEstadisticas() {
      const stats = {
        totalMateriales: this.totalMateriales,
        materialesUnicos: this.materialesUnicos.length,
        ultimaActualizacion: this.ultimaActualizacion,
        errores: this.errores.length,
        medidas: {},
        proveedores: {},
        clasificaciones: {}
      }
      
      // Contar por medidas
      this.materiales.forEach(material => {
        const medida = material.medida || 'Sin especificar'
        stats.medidas[medida] = (stats.medidas[medida] || 0) + 1
        
        const proveedor = material.proveedor || 'Sin especificar'
        stats.proveedores[proveedor] = (stats.proveedores[proveedor] || 0) + 1
        
        const clasificacion = material.clasificacion || 'Sin especificar'
        stats.clasificaciones[clasificacion] = (stats.clasificaciones[clasificacion] || 0) + 1
      })
      
      return stats
    }
  }
})
