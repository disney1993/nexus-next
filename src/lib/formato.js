import { LOCALE_INTL } from '@/i18n/config';

// Utilidades de formato compartidas por Server y Client Components.
// Reciben el idioma para formatear al estilo de cada país (1.234,50 € / €1,234.50).
// Se fija la zona horaria para que el HTML generado en el servidor (UTC en
// Vercel) y el del navegador muestren la misma hora.
const ZONA = 'Europe/Madrid';
const locale = (idioma) => LOCALE_INTL[idioma] ?? 'es-ES';

export const formatearPrecio = (valor, idioma) =>
  new Intl.NumberFormat(locale(idioma), { style: 'currency', currency: 'EUR' }).format(valor ?? 0);

export const formatearHora = (fecha, idioma) =>
  new Date(fecha).toLocaleTimeString(locale(idioma), { hour: '2-digit', minute: '2-digit', timeZone: ZONA });

export const formatearFecha = (fecha, idioma) =>
  new Date(fecha).toLocaleDateString(locale(idioma), { day: '2-digit', month: 'long', year: 'numeric', timeZone: ZONA });

export const formatearFechaHora = (fecha, idioma) =>
  new Date(fecha).toLocaleString(locale(idioma), {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: ZONA,
  });

export const ICONOS_EQUIPAMIENTO = {
  proyector: '📽️', pizarra: '🖊️', wifi: '📶', aire_acondicionado: '❄️',
  enchufes: '🔌', luz_natural: '☀️', insonorizada: '🔇', monitor_externo: '🖥️',
  sofas: '🛋️', cafeteria_cercana: '☕', catering_disponible: '🍱',
};

// Nombre traducido de un equipamiento (si no está en el diccionario, se "humaniza" la clave)
export const nombreEquipamiento = (clave, dic) => dic.coworking.equipamiento[clave] ?? clave.replace(/_/g, ' ');
