// Carga de diccionarios en el SERVIDOR.
// Usa next/root-params: como todas las rutas cuelgan de app/[lang], "lang" es un
// parámetro raíz y cualquier Server Component puede leerlo sin recibirlo por props.
// (Importar next/root-params ya impide usar este fichero en un Client Component.)

import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { esIdiomaValido } from './config';

const diccionarios = {
  es: () => import('./diccionarios/es.json').then((m) => m.default),
  en: () => import('./diccionarios/en.json').then((m) => m.default),
  fr: () => import('./diccionarios/fr.json').then((m) => m.default),
  it: () => import('./diccionarios/it.json').then((m) => m.default),
  de: () => import('./diccionarios/de.json').then((m) => m.default),
};

// Idioma de la petición actual ('es', 'en'…). 404 si no es uno soportado.
export async function obtenerIdioma() {
  const idioma = await lang();
  if (!esIdiomaValido(idioma)) notFound();
  return idioma;
}

// Diccionario del idioma actual
export async function obtenerDiccionario() {
  const idioma = await obtenerIdioma();
  return diccionarios[idioma]();
}

// Para cuando el idioma no viene de la ruta (p. ej. Server Actions)
export const diccionarioDe = (idioma) => diccionarios[esIdiomaValido(idioma) ? idioma : 'es']();
