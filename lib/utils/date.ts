/**
 * Utilidades para manejo de fechas y conversión UTC/hora local
 */

/**
 * Combina una fecha (de la fecha) y hora para almacenar en UTC 00:00
 * La hora seleccionada se guarda directamente como UTC (sin conversión de zona horaria)
 * @param fechaDate - Date de la fecha (ya en UTC 00:00:00)
 * @param timeString - String en formato "HH:mm" (hora a guardar en UTC)
 * @returns Date en UTC
 */
export function combineFechaAndHoraToUTC(fechaDate: Date | string, timeString: string): Date {
  const fecha = typeof fechaDate === 'string' ? new Date(fechaDate) : fechaDate
  
  // Obtener los componentes de la fecha en UTC (ya está en UTC 00:00:00)
  const year = fecha.getUTCFullYear()
  const month = fecha.getUTCMonth()
  const day = fecha.getUTCDate()
  
  // Parsear la hora (se guarda directamente como UTC, sin conversión)
  const [hours, minutes] = timeString.split(':').map(Number)
  
  // Crear fecha/hora directamente en UTC
  const utcDateTime = new Date(Date.UTC(year, month, day, hours, minutes, 0))
  
  return utcDateTime
}

/**
 * Convierte una fecha/hora local a UTC para almacenar en la BD
 * @deprecated Usar combineFechaAndHoraToUTC en su lugar
 */
export function localToUTC(localDateString: string, localTimeString: string): Date {
  const dateTimeString = `${localDateString}T${localTimeString}`
  const localDate = new Date(dateTimeString)
  return localDate
}

/**
 * Convierte una fecha UTC de la BD a hora local para mostrar al usuario
 * @param utcDate - Date en UTC (viene de la BD)
 * @returns String formateado en hora local
 */
export function utcToLocalString(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Obtener componentes en hora local
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convierte una fecha UTC a string de fecha local (solo fecha, sin hora)
 * @param utcDate - Date en UTC
 * @returns String en formato "YYYY-MM-DD"
 */
export function utcToLocalDateString(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Convierte una fecha UTC a string de hora (solo hora, sin fecha) en UTC
 * @param utcDate - Date en UTC
 * @returns String en formato "HH:mm" (en UTC)
 */
export function utcToTimeString(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Usar getUTCHours() y getUTCMinutes() para obtener la hora en UTC
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  
  return `${hours}:${minutes}`
}

/**
 * @deprecated Usar utcToTimeString en su lugar
 */
export function utcToLocalTimeString(utcDate: Date | string): string {
  return utcToTimeString(utcDate)
}

/**
 * Formatea una fecha UTC para mostrar al usuario (fecha y hora en UTC)
 * @param utcDate - Date en UTC
 * @returns String formateado "DD/MM/YYYY HH:mm" (en UTC)
 */
export function formatDateTimeUTC(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Usar componentes UTC directamente
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * @deprecated Usar formatDateTimeUTC en su lugar
 */
export function formatDateTimeLocal(utcDate: Date | string): string {
  return formatDateTimeUTC(utcDate)
}

/**
 * Formatea una fecha UTC para mostrar solo la fecha (sin conversión de zona horaria)
 * Usa los componentes UTC directamente para mostrar solo el día
 * @param utcDate - Date en UTC
 * @returns String formateado "DD/MM/YYYY"
 */
export function formatDateUTC(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Usar componentes UTC directamente para evitar conversión de zona horaria
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  
  return `${day}/${month}/${year}`
}

/**
 * Formatea una fecha UTC para mostrar solo la fecha (con conversión a hora local)
 * @deprecated Usar formatDateUTC para fechas que solo representan días
 */
export function formatDateLocal(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  })
}

/**
 * Convierte una fecha (solo día) a UTC 00:00:00
 * Útil para guardar fechas sin hora
 * @param dateString - String en formato "YYYY-MM-DD"
 * @returns Date en UTC a las 00:00:00
 */
export function dateToUTC(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  // Crear fecha en UTC a medianoche
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
}

/**
 * Normaliza una fechaHora para ordenamiento considerando que partidos después de medianoche
 * pertenecen a la "noche" del día anterior. Si la hora es antes de las 6 AM, se trata como
 * si fuera del día anterior (sumando 24 horas) para efectos de ordenamiento.
 * 
 * Ejemplo: Un partido a las 00:30 del 16/01 se ordena como si fuera 24:30 del 15/01
 * 
 * @param fechaHora - Date o string de la fecha/hora del partido
 * @param fechaTorneo - Date o string de la fecha del torneo (día base)
 * @returns Timestamp normalizado para comparación
 */
export function normalizarFechaHoraParaOrdenamiento(
  fechaHora: Date | string | null | undefined,
  fechaTorneo?: Date | string
): number {
  if (!fechaHora) return 0
  
  const date = typeof fechaHora === 'string' ? new Date(fechaHora) : fechaHora
  const horaUTC = date.getUTCHours()
  
  // Si la hora es antes de las 6 AM (00:00 - 05:59), tratarla como parte del día anterior
  // Sumamos 24 horas al timestamp para que se ordene después de los partidos del día anterior
  if (horaUTC < 6) {
    // Sumar 24 horas (86400000 ms) al timestamp
    return date.getTime() + 86400000
  }
  
  return date.getTime()
}

