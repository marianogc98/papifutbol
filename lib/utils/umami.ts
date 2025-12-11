/**
 * Utilidades para trackear eventos con Umami
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void
      trackEvent?: (eventName: string, eventData?: Record<string, any>) => void
    }
  }
}

// Verificar si Umami está disponible de diferentes formas
function isUmamiAvailable(): boolean {
  if (typeof window === 'undefined') return false
  
  // Verificar window.umami
  if (window.umami) {
    // Verificar si tiene el método track
    if (typeof window.umami.track === 'function') {
      return true
    }
    // Verificar si tiene el método trackEvent (algunas versiones)
    if (typeof window.umami.trackEvent === 'function') {
      return true
    }
  }
  
  return false
}

/**
 * Espera a que Umami esté cargado
 * @param maxAttempts Número máximo de intentos
 * @param delay Delay entre intentos en ms
 * @returns Promise que se resuelve cuando Umami está listo
 */
function waitForUmami(maxAttempts = 15, delay = 100): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    // Verificar si ya está disponible (caso más común)
    if (isUmamiAvailable()) {
      resolve(true)
      return
    }

    // Escuchar el evento de carga del script
    const handleReady = () => {
      if (isUmamiAvailable()) {
        window.removeEventListener('umami-ready', handleReady)
        clearInterval(interval)
        resolve(true)
      }
    }

    window.addEventListener('umami-ready', handleReady)

    // Polling como respaldo (por si el evento no se dispara)
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (isUmamiAvailable()) {
        window.removeEventListener('umami-ready', handleReady)
        clearInterval(interval)
        resolve(true)
      } else if (attempts >= maxAttempts) {
        window.removeEventListener('umami-ready', handleReady)
        clearInterval(interval)
        resolve(false)
      }
    }, delay)
  })
}

/**
 * Trackea un evento en Umami
 * @param eventName Nombre del evento
 * @param eventData Datos adicionales del evento
 */
export async function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === 'undefined') return

  // Esperar a que Umami esté cargado (timeout más corto para ser más rápido)
  const umamiReady = await waitForUmami(15, 100)
  
  if (umamiReady && window.umami) {
    try {
      // Usar track (método estándar de Umami)
      if (typeof window.umami.track === 'function') {
        window.umami.track(eventName, eventData)
      } else if (typeof window.umami.trackEvent === 'function') {
        // Fallback para versiones antiguas
        window.umami.trackEvent(eventName, eventData)
      }
    } catch (error) {
      // Solo loguear errores reales, no cuando está bloqueado
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error tracking event:', error)
      }
    }
  }
}

/**
 * Trackea una vista de publicidad
 * @param publicidadId ID de la publicidad
 * @param titulo Título de la publicidad
 * @param posicion Posición de la publicidad (banner, footer, sponsor)
 */
export function trackPublicidadView(
  publicidadId: string,
  titulo: string,
  posicion?: string | null
) {
  // No esperamos el resultado para no bloquear la UI
  trackEvent('publicidad_view', {
    publicidad_id: publicidadId,
    publicidad_titulo: titulo,
    publicidad_posicion: posicion || 'unknown',
  }).catch(() => {
    // Silenciar errores de tracking
  })
}

/**
 * Trackea un click en una publicidad
 * @param publicidadId ID de la publicidad
 * @param titulo Título de la publicidad
 * @param url URL de destino
 * @param posicion Posición de la publicidad (banner, footer, sponsor)
 */
export function trackPublicidadClick(
  publicidadId: string,
  titulo: string,
  url: string,
  posicion?: string | null
) {
  // No esperamos el resultado para no bloquear la navegación
  trackEvent('publicidad_click', {
    publicidad_id: publicidadId,
    publicidad_titulo: titulo,
    publicidad_url: url,
    publicidad_posicion: posicion || 'unknown',
  }).catch(() => {
    // Silenciar errores de tracking
  })
}

/**
 * Función de prueba para verificar que Umami esté funcionando
 * Puedes llamarla desde la consola del navegador: window.testUmami()
 */
export function testUmami() {
  if (typeof window !== 'undefined') {
    console.log('🔍 Verificando Umami...')
    console.log('window.umami:', window.umami)
    console.log('isUmamiAvailable():', isUmamiAvailable())
    
    trackEvent('test_event', { test: true }).then(() => {
      console.log('✅ Test event enviado')
    }).catch((error) => {
      console.error('❌ Error en test:', error)
    })
  }
}

// Exponer función de prueba globalmente en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).testUmami = testUmami
  ;(window as any).umamiUtils = {
    trackEvent,
    trackPublicidadView,
    trackPublicidadClick,
    testUmami,
  }
}

