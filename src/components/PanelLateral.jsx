'use client';

// Client Component: contenedor del menú lateral.
//  - En escritorio (≥ 1024 px) es una barra lateral fija (sticky).
//  - En móvil y tablet se convierte en un panel que se desliza desde la
//    izquierda al pulsar "Categorías y filtros", con fondo oscurecido.
// Necesita el cliente por el estado abierto/cerrado (useState), los eventos
// onClick/Escape y usePathname/useSearchParams para cerrarse al elegir categoría.
// Su contenido (children) son Server Components (MenuCategorias) y otros Client
// Components: un Client Component puede recibir Server Components como children.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useIdioma } from '@/i18n/ProveedorIdioma';

export default function PanelLateral({ children }) {
  const { dic } = useIdioma();
  const [abierto, setAbierto] = useState(false);
  const categoria = useSearchParams().get('category') ?? '';

  // Al elegir otra categoría se cierra el panel para ver los resultados
  const [categoriaPrevia, setCategoriaPrevia] = useState(categoria);
  if (categoria !== categoriaPrevia) {
    setCategoriaPrevia(categoria);
    setAbierto(false);
  }

  // Cerrar con la tecla Escape y bloquear el scroll de fondo mientras está abierto
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', alPulsar);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = '';
    };
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="btn-secundario w-full justify-between lg:hidden"
        aria-expanded={abierto}
        aria-controls="panel-filtros"
      >
        <span className="flex items-center gap-2">
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
          </svg>
          {dic.libreria.categoriasYFiltros}
        </span>
        <span aria-hidden>→</span>
      </button>

      {/* Fondo oscurecido (solo móvil/tablet) */}
      <div
        aria-hidden
        onClick={() => setAbierto(false)}
        className={`fixed inset-0 z-40 bg-tinta/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="panel-filtros"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[85vw] max-w-sm flex-col gap-4 overflow-y-auto overscroll-contain bg-slate-50 p-4 lg:h-auto [&>*]:shrink-0 shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-24 lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <p className="font-semibold text-tinta">{dic.libreria.categoriasYFiltros}</p>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200"
            aria-label={dic.comun.cerrar}
          >
            ✕
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
