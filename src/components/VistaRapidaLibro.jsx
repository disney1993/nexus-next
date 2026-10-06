'use client';

// Client Component con renderizado en cliente (CSR) de datos.
// Requisito: "vista individual del libro cuando el usuario pase el ratón por
// encima". Necesita el navegador porque:
//  - escucha eventos onMouseEnter / onMouseLeave / onFocus
//  - guarda estado (visible, datos, cargando) con useState
//  - pide el detalle a la API simulada DESDE EL NAVEGADOR solo cuando el usuario
//    muestra interés (se ve en la pestaña Network de DevTools)
// Recibe la tarjeta (renderizada en el servidor) como children.
// Solo se muestra en pantallas con ratón (lg): en móvil/tablet el toque navega.

import { useRef, useState } from 'react';
import { getLibroPorId } from '@/lib/api';
import { formatearPrecio } from '@/lib/formato';
import { t } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

// Caché en memoria compartida por todas las tarjetas: cada libro se pide una vez
const cache = new Map();

export default function VistaRapidaLibro({ idLibro, children }) {
  const { idioma, dic } = useIdioma();
  const textos = dic.libreria.vistaRapida;
  const [visible, setVisible] = useState(false);
  const [libro, setLibro] = useState(() => cache.get(idLibro) ?? null);
  const [error, setError] = useState(false);
  const temporizador = useRef(null);

  function mostrar() {
    // Pequeño retardo para no lanzar peticiones al pasar el ratón de largo
    temporizador.current = setTimeout(async () => {
      setVisible(true);
      if (cache.has(idLibro)) {
        setLibro(cache.get(idLibro));
        return;
      }
      try {
        const datos = await getLibroPorId(idLibro, { cache: 'no-store' });
        cache.set(idLibro, datos);
        setLibro(datos);
      } catch {
        setError(true);
      }
    }, 450);
  }

  function ocultar() {
    clearTimeout(temporizador.current);
    setVisible(false);
  }

  return (
    <div className="relative h-full" onMouseEnter={mostrar} onMouseLeave={ocultar} onFocus={mostrar} onBlur={ocultar}>
      {children}

      {visible && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 hidden w-72 -translate-x-1/2 animate-emerger rounded-2xl border border-slate-200 bg-white/95 p-4 text-left shadow-2xl shadow-nexus-900/10 backdrop-blur lg:block"
        >
          <span aria-hidden className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
          {!libro && !error && (
            <div className="space-y-2">
              <div className="esqueleto h-3 w-1/3" />
              <div className="esqueleto h-4 w-4/5" />
              <div className="esqueleto h-12 w-full" />
            </div>
          )}
          {error && <p className="text-sm text-ocupado">{textos.error}</p>}
          {libro && (
            <div className="animate-aparecer">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-nexus-600">
                {libro.category_name} · {libro.year}
              </p>
              <p className="mt-1 font-semibold leading-snug text-tinta">{libro.title}</p>
              <p className="text-xs text-slate-500">{libro.author}</p>
              <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-slate-600">{libro.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className={`insignia ${libro.stock > 0 ? 'bg-libre-suave text-libre' : 'bg-ocupado-suave text-ocupado'}`}>
                  {libro.stock > 0 ? t(textos.enStock, { n: libro.stock }) : textos.sinStock}
                </span>
                <span className="font-bold text-tinta">{formatearPrecio(libro.price, idioma)}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">{textos.clic}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
