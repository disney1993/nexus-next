'use client';

// Client Component: mantiene el plano de ocupación al día.
// Necesita el cliente porque usa un temporizador (setInterval en useEffect),
// un botón con onClick y router.refresh(), que pide al servidor que vuelva a
// renderizar los Server Components de la ruta SIN recargar la página ni perder
// el estado del cliente (filtros, scroll).

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_INTL, t } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

const INTERVALO_MS = 60_000;

export default function ActualizarEspacios() {
  const { idioma, dic } = useIdioma();
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [ultima, setUltima] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => {
        router.refresh();
        setUltima(new Date());
      });
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [router]);

  function actualizar() {
    startTransition(() => {
      router.refresh();
      setUltima(new Date());
    });
  }

  const hora = ultima?.toLocaleTimeString(LOCALE_INTL[idioma], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 lg:justify-end">
      <span>{hora ? t(dic.coworking.actualizadoA, { hora }) : dic.coworking.autoActualiza}</span>
      <button type="button" onClick={actualizar} disabled={pendiente} className="btn-secundario px-3 py-2 text-xs">
        <svg aria-hidden viewBox="0 0 20 20" className={`h-4 w-4 ${pendiente ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 10a6 6 0 1 1-1.76-4.24M16 4v3.5h-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {pendiente ? dic.coworking.actualizando : dic.coworking.actualizar}
      </button>
    </div>
  );
}
