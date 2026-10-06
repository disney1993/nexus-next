'use client';

// Client Component: selector de idioma con banderas.
// Necesita el cliente porque:
//  - abre/cierra un desplegable propio (useState); un <select> nativo no admite imágenes
//  - se cierra al hacer clic fuera o con Escape (useEffect + eventos del documento)
//  - guarda la preferencia en la cookie NEXT_LOCALE (la usa el proxy en la
//    próxima visita) y navega con useRouter a la misma página en el nuevo idioma
// Variantes: "desplegable" (escritorio) y "lista" (fila de banderas en el menú móvil,
// donde un desplegable quedaría recortado por el panel).

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Bandera from './Bandera';
import { COOKIE_IDIOMA, IDIOMAS, NOMBRES_IDIOMA } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

// Guarda la preferencia para la próxima visita (la lee el proxy)
function guardarIdioma(idioma) {
  document.cookie = `${COOKIE_IDIOMA}=${idioma}; path=/; max-age=31536000; samesite=lax`;
}

export default function SelectorIdioma({ variante = 'desplegable' }) {
  const { idioma, dic } = useIdioma();
  const camino = usePathname();
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);

  // Cerrar al hacer clic fuera o al pulsar Escape
  useEffect(() => {
    if (!abierto) return;
    const alClicar = (e) => !contenedor.current?.contains(e.target) && setAbierto(false);
    const alPulsar = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', alClicar);
    document.addEventListener('keydown', alPulsar);
    return () => {
      document.removeEventListener('mousedown', alClicar);
      document.removeEventListener('keydown', alPulsar);
    };
  }, [abierto]);

  function cambiar(nuevo) {
    setAbierto(false);
    if (nuevo === idioma) return;
    guardarIdioma(nuevo);
    // Sustituye solo el primer segmento y conserva los filtros (?category=…)
    const nuevoCamino = camino.replace(/^\/[^/]+/, `/${nuevo}`);
    startTransition(() => router.push(nuevoCamino + window.location.search, { scroll: false }));
  }

  if (variante === 'lista') {
    return (
      <div className={`flex items-center gap-1 transition ${pendiente ? 'opacity-60' : ''}`} role="group" aria-label={dic.nav.idioma}>
        {IDIOMAS.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => cambiar(i)}
            aria-pressed={i === idioma}
            title={NOMBRES_IDIOMA[i]}
            className={`rounded-md p-1.5 transition ${i === idioma ? 'bg-nexus-50 ring-2 ring-nexus-500' : 'opacity-70 hover:bg-slate-100 hover:opacity-100'}`}
          >
            <Bandera idioma={i} className="h-4 w-6" />
            <span className="sr-only">{NOMBRES_IDIOMA[i]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`${dic.nav.idioma}: ${NOMBRES_IDIOMA[idioma]}`}
        className={`flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-200 hover:bg-white ${
          abierto ? 'border-slate-200 bg-white' : ''
        } ${pendiente ? 'opacity-60' : ''}`}
      >
        <Bandera idioma={idioma} />
        <span className="uppercase">{idioma}</span>
        <svg aria-hidden viewBox="0 0 20 20" className={`h-3.5 w-3.5 text-slate-400 transition ${abierto ? 'rotate-180' : ''}`} fill="currentColor">
          <path d="M5.2 7.6a.75.75 0 0 1 1.06.02L10 11.56l3.74-3.94a.75.75 0 1 1 1.08 1.04l-4.28 4.5a.75.75 0 0 1-1.08 0l-4.28-4.5a.75.75 0 0 1 .02-1.06Z" />
        </svg>
      </button>

      {abierto && (
        <ul
          role="listbox"
          aria-label={dic.nav.idioma}
          className="absolute right-0 top-full z-50 mt-2 w-44 animate-emerger overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-nexus-900/10"
        >
          {IDIOMAS.map((i) => (
            <li key={i} role="option" aria-selected={i === idioma}>
              <button
                type="button"
                onClick={() => cambiar(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  i === idioma ? 'bg-nexus-50 font-semibold text-nexus-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bandera idioma={i} />
                <span className="flex-1">{NOMBRES_IDIOMA[i]}</span>
                {i === idioma && <span aria-hidden className="text-nexus-600">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
