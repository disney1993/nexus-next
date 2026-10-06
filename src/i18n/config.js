// Configuración de idiomas de la aplicación.
// Se puede importar desde servidor, cliente y proxy (no depende de nada).

export const IDIOMAS = ['es', 'en', 'fr', 'it', 'de'];
export const IDIOMA_POR_DEFECTO = 'es';
export const COOKIE_IDIOMA = 'NEXT_LOCALE';

// Nombre de cada idioma en su propia lengua (para el selector)
export const NOMBRES_IDIOMA = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
};

// Locale completo para Intl (fechas, horas, monedas)
export const LOCALE_INTL = {
  es: 'es-ES',
  en: 'en-GB',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
};

export const esIdiomaValido = (valor) => IDIOMAS.includes(valor);

// Antepone el idioma a una ruta interna: ruta('en', '/libreria') → '/en/libreria'
export function ruta(idioma, camino = '/') {
  return camino === '/' ? `/${idioma}` : `/${idioma}${camino}`;
}

// Sustituye {variables} en una cadena del diccionario:
// t('Hola {nombre}', { nombre: 'Ana' }) → 'Hola Ana'
export function t(plantilla, variables = {}) {
  return String(plantilla).replace(/\{(\w+)\}/g, (_, clave) => variables[clave] ?? '');
}
