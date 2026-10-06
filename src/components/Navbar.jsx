import Link from 'next/link';
import Logo from './Logo';
import NavegacionCliente from './NavegacionCliente';
import { ruta } from '@/i18n/config';
import { obtenerIdioma } from '@/i18n/servidor';

// Server Component: la estructura de la barra (marca, contenedor, efecto
// translúcido) es estática. Solo la parte interactiva (enlace activo, menú
// móvil, idioma y usuario) se delega en un Client Component.
export default async function Navbar() {
  const idioma = await obtenerIdioma();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="contenedor flex flex-wrap items-center justify-between gap-x-4 py-3">
        <Link href={ruta(idioma)} className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-nexus-500/20">
          <Logo />
        </Link>
        <NavegacionCliente />
      </div>
    </header>
  );
}
