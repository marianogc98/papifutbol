export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>PapiFutbol - Sistema de Gestión de Torneo de Fútbol 5</p>
          <p className="mt-2">© {new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}

