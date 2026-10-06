'use client';

// Client Component: pone el idioma y su diccionario en un Context de React para
// que los Client Components (formularios, filtros…) puedan traducir sus textos
// con useIdioma(). Los Server Components no lo necesitan: usan obtenerDiccionario().

import { createContext, useContext } from 'react';
import { ruta as rutaConIdioma } from './config';

const ContextoIdioma = createContext(null);

export function ProveedorIdioma({ idioma, diccionario, children }) {
  return <ContextoIdioma.Provider value={{ idioma, dic: diccionario }}>{children}</ContextoIdioma.Provider>;
}

// Devuelve { idioma, dic, ruta } — ruta('/libreria') → '/en/libreria'
export function useIdioma() {
  const valor = useContext(ContextoIdioma);
  return { ...valor, ruta: (camino) => rutaConIdioma(valor.idioma, camino) };
}
