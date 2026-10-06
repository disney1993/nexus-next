'use client';

// error.js debe ser obligatoriamente un Client Component: Next.js lo usa como
// Error Boundary de React y necesita la función reset() para reintentar en el
// navegador. Captura los fallos de la API simulada en cualquier ruta de servicios.

import { useIdioma } from '@/i18n/ProveedorIdioma';

export default function ErrorServicios({ reset }) {
  const { dic } = useIdioma();

  return (
    <div className="tarjeta mx-auto max-w-lg animate-emerger p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocupado-suave text-2xl">⚠️</span>
      <h2 className="mt-4 text-lg font-semibold text-tinta">{dic.errores.titulo}</h2>
      <p className="mt-1 text-sm text-slate-500">{dic.errores.texto}</p>
      <button type="button" onClick={() => reset()} className="btn-primario mt-6">
        {dic.comun.reintentar}
      </button>
    </div>
  );
}
