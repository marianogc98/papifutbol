'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

const contactSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  plan: z.string().optional(),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function PublicidadPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      plan: '',
      mensaje: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/sponsors/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar el mensaje')
      }

      setSubmitStatus({
        type: 'success',
        message: '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.',
      })
      reset()
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Error al enviar el mensaje. Por favor, intenta nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Título de la página */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Publicidad</h1>
          <p className="text-muted-foreground text-lg">
            Oportunidades de publicidad y patrocinio
          </p>
        </div>

        {/* Planes de Publicidad con Cards */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-2">Planes de Publicidad</h2>
          <p className="text-center text-muted-foreground mb-6">
            Precios con descuento válidos por 15 días
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Plan Oro */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-2">🥇</div>
                <CardTitle className="text-2xl font-bold text-yellow-900">Plan Oro</CardTitle>
                <CardDescription className="text-yellow-700 font-medium">
                  Banner Principal (Hero)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">1 mes</p>
                    <p className="text-2xl font-bold text-gray-800">$270.000</p>
                  </div>
                  <div className="pt-2 border-t border-yellow-300">
                    <p className="text-sm text-muted-foreground">Duración del torneo</p>
                    <p className="text-3xl font-bold text-[#852024]">$640.000</p>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-yellow-500 text-yellow-900 hover:bg-yellow-600">
                  Más Popular
                </Badge>
              </CardContent>
            </Card>

            {/* Plan Plata */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-2">🥈</div>
                <CardTitle className="text-2xl font-bold text-gray-900">Plan Plata</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Banner Secundario (Footer)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">1 mes</p>
                    <p className="text-2xl font-bold text-gray-800">$180.000</p>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <p className="text-sm text-muted-foreground">Duración del torneo</p>
                    <p className="text-3xl font-bold text-[#852024]">$400.000</p>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-gray-500 text-white hover:bg-gray-600">
                  Recomendado
                </Badge>
              </CardContent>
            </Card>

            {/* Plan Bronce */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-2">🥉</div>
                <CardTitle className="text-2xl font-bold text-orange-900">Plan Bronce</CardTitle>
                <CardDescription className="text-orange-700 font-medium">
                  Página de Sponsors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">1 mes</p>
                    <p className="text-2xl font-bold text-gray-800">$80.000</p>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <p className="text-sm text-muted-foreground">Duración del torneo</p>
                    <p className="text-3xl font-bold text-[#852024]">$200.000</p>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-orange-500 text-white hover:bg-orange-600">
                  Accesible
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900 text-center">
              <strong>Incluye:</strong> Métricas reales de rendimiento (impresiones / clics / CTR) y presencia en las páginas principales del torneo.
            </p>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>¿Quieres ser sponsor?</CardTitle>
            <CardDescription>
              Apoya nuestro torneo y llega a miles de aficionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Contáctanos para conocer nuestros planes de publicidad y patrocinio.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    {...register('nombre')}
                    placeholder="Tu nombre completo"
                    disabled={isSubmitting}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="tu@email.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    {...register('telefono')}
                    placeholder="+54 9 11 1234-5678"
                    disabled={isSubmitting}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-destructive">{errors.telefono.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plan de interés (opcional)</Label>
                  <select
                    id="plan"
                    {...register('plan')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <option value="">Selecciona un plan</option>
                    <option value="Oro">🥇 Oro - Banner Principal</option>
                    <option value="Plata">🥈 Plata - Banner Secundario</option>
                    <option value="Bronce">🥉 Bronce - Página de Sponsors</option>
                  </select>
                  {errors.plan && (
                    <p className="text-sm text-destructive">{errors.plan.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje *</Label>
                <textarea
                  id="mensaje"
                  {...register('mensaje')}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Cuéntanos sobre tu empresa y cómo te gustaría participar..."
                  disabled={isSubmitting}
                />
                {errors.mensaje && (
                  <p className="text-sm text-destructive">{errors.mensaje.message}</p>
                )}
              </div>

              {submitStatus && (
                <div
                  className={`p-4 rounded-md ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

