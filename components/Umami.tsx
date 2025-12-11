'use client'

import Script from 'next/script'

export default function Umami() {
  const handleLoad = () => {
    if (typeof window === 'undefined') return

    // Esperar un poco para que Umami inicialice completamente
    setTimeout(() => {
      // Verificar que el objeto esté disponible y disparar evento
      if (
        window.umami &&
        (typeof window.umami.track === 'function' ||
          typeof window.umami.trackEvent === 'function')
      ) {
        window.dispatchEvent(new Event('umami-ready'))
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Umami cargado y listo')
        }
      } else {
        // Disparar evento de todas formas para que el polling funcione
        window.dispatchEvent(new Event('umami-ready'))
      }
    }, 200)
  }

  return (
    <Script
      src="https://umami.kudev.cloud/script.js"
      data-website-id="b09759e0-f198-4e1f-9051-af59754e44e6"
      strategy="afterInteractive"
      onLoad={handleLoad}
    />
  )
}

