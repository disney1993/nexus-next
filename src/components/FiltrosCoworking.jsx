'use client';

// Client Component: filtros del coworking (estado, tipo, capacidad mínima).
// Necesita el cliente por los eventos onChange y por useRouter/useSearchParams
// para escribir los filtros en la URL. La página (Server Component) lee esos
// searchParams y vuelve a pedir los espacios a la API en el servidor.

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { t } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

export default function FiltrosCoworking() {
  const { dic } = useIdioma();
  const textos = dic.coworking;
  const router = useRouter();
  const camino = usePathname();
  const params = useSearchParams();
  const [pendiente, startTransition] = useTransition();

  function aplicar(clave, valor) {
    const nuevos = new URLSearchParams(params.toString());
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    const qs = nuevos.toString();
    startTransition(() => router.replace(qs ? `${camino}?${qs}` : camino, { scroll: false }));
  }

  const estado = params.get('occupied') ?? '';

  return (
    <div className={`tarjeta flex flex-col gap-4 p-4 transition sm:flex-row sm:flex-wrap sm:items-end ${pendiente ? 'opacity-70' : ''}`}>
      {/* Estado como control segmentado */}
      <div>
        <span className="etiqueta">{textos.estado}</span>
        <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 sm:w-auto" role="radiogroup" aria-label={textos.estado}>
          {[
            ['', textos.todos],
            ['false', textos.soloLibres],
            ['true', textos.soloOcupados],
          ].map(([valor, texto]) => (
            <button
              key={valor || 'todos'}
              type="button"
              role="radio"
              aria-checked={estado === valor}
              onClick={() => aplicar('occupied', valor)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition sm:flex-none ${
                estado === valor ? 'bg-white text-tinta shadow-sm' : 'text-slate-500 hover:text-tinta'
              }`}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
        <div className="min-w-0">
          <label htmlFor="filtro-tipo-espacio" className="etiqueta">{textos.tipo}</label>
          <select
            id="filtro-tipo-espacio"
            className="campo"
            value={params.get('type') ?? ''}
            onChange={(e) => aplicar('type', e.target.value)}
          >
            <option value="">{textos.todos}</option>
            {Object.entries(textos.tipos).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="filtro-capacidad" className="etiqueta">{textos.capacidadMin}</label>
          <select
            id="filtro-capacidad"
            className="campo"
            value={params.get('min_capacity') ?? ''}
            onChange={(e) => aplicar('min_capacity', e.target.value)}
          >
            <option value="">{textos.cualquiera}</option>
            {[2, 4, 6, 10].map((n) => (
              <option key={n} value={n}>{t(textos.personasMas, { n })}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
