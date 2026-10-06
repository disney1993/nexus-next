'use client';

// Client Component con renderizado en cliente (CSR) de datos.
// Recibe la lista inicial de reservas ya renderizada en el servidor (SSR) y,
// después, la vuelve a pedir a la API simulada DESDE EL NAVEGADOR cada 30 s
// para reflejar cambios sin recargar. Necesita el cliente por useState,
// useEffect y el temporizador. Estas peticiones se ven en DevTools → Network.

import { useEffect, useState } from 'react';
import { getReservas } from '@/lib/api';
import { formatearFechaHora, formatearHora } from '@/lib/formato';
import { useIdioma } from '@/i18n/ProveedorIdioma';

const INTERVALO_MS = 30_000;

export default function ReservasEspacio({ idEspacio, reservasIniciales }) {
  const { idioma, dic } = useIdioma();
  const textos = dic.espacio;
  const [reservas, setReservas] = useState(reservasIniciales);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const datos = await getReservas({ space_id: idEspacio });
        if (Array.isArray(datos)) setReservas(datos);
      } catch {
        // Si falla, se mantiene la última lista conocida
      }
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [idEspacio]);

  const vigentes = reservas.filter((r) => r.status !== 'cancelled');

  return (
    <section className="tarjeta p-5">
      <h2 className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-tinta">
        {textos.reservas}
        <span className="flex items-center gap-1.5 text-[11px] font-normal text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-libre" />
          {textos.refresco}
        </span>
      </h2>
      {vigentes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{textos.sinReservas}</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {vigentes.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nexus-50 text-xs font-bold text-nexus-700">
                {r.user_name?.[0]}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-tinta">{r.user_name}</span>
              <span className="text-xs text-slate-500">
                {formatearFechaHora(r.start_time, idioma)} → {formatearHora(r.end_time, idioma)}
              </span>
              <span className={`insignia ${r.status === 'active' ? 'bg-ocupado-suave text-ocupado' : 'bg-nexus-50 text-nexus-700'}`}>
                {textos.estados[r.status] ?? r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
