'use client';

// Client Component: botón de compra.
// Necesita el cliente porque reacciona al evento onClick y guarda en estado el
// resultado (mensaje de éxito/error) y si la compra está en curso (useTransition).
// La compra en sí la ejecuta la Server Action "comprarLibro" en el servidor,
// que lee el token de la cookie httpOnly y hace el POST /purchases a la API simulada.

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { comprarLibro } from '@/lib/acciones';
import { t } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

export default function BotonComprar({ idLibro, sinStock }) {
  const { dic, ruta } = useIdioma();
  const [pendiente, startTransition] = useTransition();
  const [resultado, setResultado] = useState(null);

  function comprar() {
    setResultado(null);
    startTransition(async () => {
      setResultado(await comprarLibro(idLibro));
    });
  }

  const mensaje =
    resultado &&
    (resultado.ok
      ? t(dic.libro.compraOk, { pedido: resultado.pedido, titulo: resultado.titulo })
      : resultado.codigo === 'sesion'
        ? dic.errores.sesionCaducada
        : dic.libro.compraError);

  return (
    <div className="space-y-4">
      {resultado && (
        <p
          role="status"
          className={`flex animate-emerger items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            resultado.ok ? 'border-libre/20 bg-libre-suave text-libre' : 'border-ocupado/20 bg-ocupado-suave text-ocupado'
          }`}
        >
          <span aria-hidden>{resultado.ok ? '✓' : '!'}</span>
          {mensaje}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={comprar} disabled={pendiente || sinStock} className="btn-primario px-8">
          {pendiente ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3h2l1.6 9.2a1.5 1.5 0 0 0 1.5 1.3h6.6a1.5 1.5 0 0 0 1.5-1.2L17 7H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="17" r="1" />
              <circle cx="14.5" cy="17" r="1" />
            </svg>
          )}
          {sinStock ? dic.libro.sinStock : pendiente ? dic.libro.procesando : dic.libro.comprar}
        </button>
        <Link href={ruta('/mis-compras')} className="btn-secundario">
          {dic.libro.verCompras}
        </Link>
      </div>
    </div>
  );
}
