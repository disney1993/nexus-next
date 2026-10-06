'use client';

// Client Component: panel lateral de filtros (tipo, año, precio máximo, búsqueda).
// Necesita el cliente porque:
//  - los controles son interactivos (onChange) y guardan estado local (useState)
//  - la búsqueda y el precio usan "debounce" (setTimeout) para no recargar a cada tecla
//  - actualiza la URL con useRouter/useSearchParams; el Server Component de la
//    página detecta los nuevos searchParams y vuelve a pedir los datos (SSR)
//  - useTransition muestra un indicador mientras llega el nuevo resultado

import { useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { formatearPrecio } from '@/lib/formato';
import { t } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

const PRECIO_MAX = 100;

export default function FiltrosLibreria({ anios }) {
  const { idioma, dic } = useIdioma();
  const textos = dic.libreria;
  const router = useRouter();
  const camino = usePathname();
  const params = useSearchParams();
  const [pendiente, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(params.get('search') ?? '');
  const [precio, setPrecio] = useState(params.get('max_price') ?? '');
  const espera = useRef(null);

  // Si la URL cambia desde fuera (p. ej. enlace "Librería" del menú, que quita
  // los filtros), se sincroniza el estado local de los campos con debounce
  const urlBusqueda = params.get('search') ?? '';
  const urlPrecio = params.get('max_price') ?? '';
  const [urlPrevia, setUrlPrevia] = useState({ busqueda: urlBusqueda, precio: urlPrecio });
  if (urlPrevia.busqueda !== urlBusqueda || urlPrevia.precio !== urlPrecio) {
    setUrlPrevia({ busqueda: urlBusqueda, precio: urlPrecio });
    setBusqueda(urlBusqueda);
    setPrecio(urlPrecio);
  }

  function aplicar(cambios) {
    const nuevos = new URLSearchParams(params.toString());
    Object.entries(cambios).forEach(([k, v]) => (v ? nuevos.set(k, v) : nuevos.delete(k)));
    nuevos.delete('page'); // al filtrar se vuelve a la primera página
    const qs = nuevos.toString();
    startTransition(() => router.replace(qs ? `${camino}?${qs}` : camino, { scroll: false }));
  }

  function aplicarConRetardo(cambios) {
    clearTimeout(espera.current);
    espera.current = setTimeout(() => aplicar(cambios), 400);
  }

  function limpiar() {
    clearTimeout(espera.current);
    setBusqueda('');
    setPrecio('');
    startTransition(() => router.replace(camino, { scroll: false }));
  }

  const valorPrecio = Number(precio || PRECIO_MAX);

  return (
    <details open className="tarjeta group p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-tinta">
        <span className="flex items-center gap-2">
          {textos.filtros}
          {pendiente && (
            <span className="flex items-center gap-1 text-xs font-normal text-nexus-600 animate-aparecer">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-nexus-200 border-t-nexus-600" />
              {textos.actualizando}
            </span>
          )}
        </span>
        <span className="text-slate-400 transition duration-300 group-open:rotate-180">⌄</span>
      </summary>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="filtro-busqueda" className="etiqueta">{textos.buscar}</label>
          <div className="relative">
            <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.5 13.5 3 3" strokeLinecap="round" />
            </svg>
            <input
              id="filtro-busqueda"
              type="search"
              placeholder={textos.buscarPlaceholder}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                aplicarConRetardo({ search: e.target.value });
              }}
              className="campo pl-9"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filtro-tipo" className="etiqueta">{textos.tipo}</label>
          <select id="filtro-tipo" value={params.get('type') ?? ''} onChange={(e) => aplicar({ type: e.target.value })} className="campo">
            <option value="">{textos.tipoTodos}</option>
            <option value="book">{textos.soloLibros}</option>
            <option value="magazine">{textos.soloRevistas}</option>
          </select>
        </div>

        <div>
          <label htmlFor="filtro-anio" className="etiqueta">{textos.anio}</label>
          <select id="filtro-anio" value={params.get('year') ?? ''} onChange={(e) => aplicar({ year: e.target.value })} className="campo">
            <option value="">{textos.todos}</option>
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-precio" className="etiqueta">
            {t(textos.precioMax, { precio: formatearPrecio(valorPrecio, idioma) })}
          </label>
          <input
            id="filtro-precio"
            type="range"
            min={5}
            max={PRECIO_MAX}
            step={5}
            value={valorPrecio}
            onChange={(e) => {
              const valor = e.target.value === String(PRECIO_MAX) ? '' : e.target.value;
              setPrecio(valor);
              aplicarConRetardo({ max_price: valor });
            }}
            className="w-full cursor-pointer accent-nexus-600"
          />
        </div>

        <button type="button" onClick={limpiar} className="btn-secundario w-full text-xs">
          {textos.limpiar}
        </button>
      </div>
    </details>
  );
}
