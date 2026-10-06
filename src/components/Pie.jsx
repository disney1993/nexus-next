import Link from 'next/link';
import Logo from './Logo';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Server Component: pie de página. Solo texto y enlaces, sin interacción.
export default async function Pie() {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  const columnas = [
    {
      titulo: dic.pie.servicios,
      enlaces: [
        { href: ruta(idioma, '/libreria'), texto: dic.nav.libreria },
        { href: ruta(idioma, '/coworking'), texto: dic.nav.coworking },
      ],
    },
    {
      titulo: dic.pie.cuenta,
      enlaces: [
        { href: ruta(idioma, '/mis-compras'), texto: dic.nav.misCompras },
        { href: ruta(idioma, '/login'), texto: dic.nav.iniciarSesion },
      ],
    },
  ];

  return (
    <footer className="mt-16 bg-tinta text-slate-400">
      <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Logo claro />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{dic.pie.descripcion}</p>
        </div>
        {columnas.map((c) => (
          <div key={c.titulo}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">{c.titulo}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {c.enlaces.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="transition hover:text-white">
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="contenedor py-5 text-xs text-slate-500">
          © {new Date().getFullYear()} Nexus · {dic.pie.derechos}
        </p>
      </div>
    </footer>
  );
}
