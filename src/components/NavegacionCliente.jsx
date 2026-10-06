'use client';

// Client Component. Necesario porque:
//  - usePathname() para resaltar el enlace de la página actual
//  - useState para abrir/cerrar el menú hamburguesa en móvil y tablet (onClick)
//  - lee la cookie pública del usuario con document.cookie (API del navegador)
// Hacerlo en el cliente evita que el layout raíz lea cookies en el servidor,
// lo que convertiría TODAS las rutas en dinámicas y anularía SSG/ISR.

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SelectorIdioma from './SelectorIdioma';
import { cerrarSesion } from '@/lib/acciones';
import { useIdioma } from '@/i18n/ProveedorIdioma';

function leerCookieUsuario() {
  const fila = document.cookie.split('; ').find((c) => c.startsWith('nexus_usuario='));
  return fila ? fila.slice('nexus_usuario='.length) : null;
}

function parsearUsuario(valor) {
  if (!valor) return null;
  try {
    return JSON.parse(decodeURIComponent(valor));
  } catch {
    return null;
  }
}

const sinSuscripcion = () => () => {};

export default function NavegacionCliente() {
  const { idioma, dic, ruta } = useIdioma();
  const camino = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cerrar el menú móvil al cambiar de página
  const [caminoPrevio, setCaminoPrevio] = useState(camino);
  if (camino !== caminoPrevio) {
    setCaminoPrevio(camino);
    setMenuAbierto(false);
  }

  // Se vuelve a leer la cookie en cada render (p. ej. al navegar tras login/logout)
  const usuario = parsearUsuario(useSyncExternalStore(sinSuscripcion, leerCookieUsuario, () => null));

  const enlaces = [
    { href: ruta('/libreria'), texto: dic.nav.libreria },
    { href: ruta('/mis-compras'), texto: dic.nav.misCompras },
    { href: ruta('/coworking'), texto: dic.nav.coworking },
  ];
  const activo = (href) => camino === href || camino.startsWith(`${href}/`);
  const accionSalir = cerrarSesion.bind(null, idioma);

  const avatar = usuario && (
    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {usuario.avatar && (
        <Image src={usuario.avatar} alt="" width={32} height={32} className="rounded-full ring-2 ring-white shadow" />
      )}
      <span className="max-w-[10rem] truncate">{usuario.name}</span>
    </span>
  );

  return (
    <>
      {/* Escritorio (≥ 1024 px) */}
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
        {usuario &&
          enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo(e.href) ? 'page' : undefined}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition ${
                activo(e.href) ? 'text-nexus-700' : 'text-slate-600 hover:bg-slate-100 hover:text-tinta'
              }`}
            >
              {e.texto}
              {activo(e.href) && (
                <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-nexus-600 animate-aparecer" />
              )}
            </Link>
          ))}
        <span className="mx-2 h-6 w-px bg-slate-200" />
        <SelectorIdioma />
        {usuario ? (
          <div className="ml-2 flex items-center gap-3">
            {avatar}
            <form action={accionSalir}>
              <button type="submit" className="btn-secundario px-3 py-1.5 text-xs">
                {dic.nav.cerrarSesion}
              </button>
            </form>
          </div>
        ) : (
          <Link href={ruta('/login')} className="btn-primario ml-2 py-2">
            {dic.nav.iniciarSesion}
          </Link>
        )}
      </nav>

      {/* Móvil y tablet: botón hamburguesa */}
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
        aria-label={menuAbierto ? dic.nav.cerrarMenu : dic.nav.abrirMenu}
        aria-expanded={menuAbierto}
        aria-controls="menu-movil"
        onClick={() => setMenuAbierto((abierto) => !abierto)}
      >
        <span className="relative block h-3.5 w-5" aria-hidden>
          <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition ${menuAbierto ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition ${menuAbierto ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-current transition ${menuAbierto ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </span>
      </button>

      {/* Panel desplegable con animación de altura (grid-rows 0fr → 1fr) */}
      <div
        id="menu-movil"
        className={`grid basis-full transition-all duration-300 ease-out lg:hidden ${
          menuAbierto ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 border-t border-slate-200 pb-3 pt-3" aria-label="Principal">
            {usuario && (
              <>
                <div className="mb-2 px-1">{avatar}</div>
                {enlaces.map((e) => (
                  <Link
                    key={e.href}
                    href={e.href}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                      activo(e.href) ? 'bg-nexus-50 text-nexus-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {e.texto}
                  </Link>
                ))}
              </>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 pt-3">
              <SelectorIdioma variante="lista" />
              {usuario ? (
                <form action={accionSalir}>
                  <button type="submit" className="btn-secundario px-3 py-2 text-xs">
                    {dic.nav.cerrarSesion}
                  </button>
                </form>
              ) : (
                <Link href={ruta('/login')} className="btn-primario py-2">
                  {dic.nav.iniciarSesion}
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
