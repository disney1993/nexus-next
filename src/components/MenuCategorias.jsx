import Link from 'next/link';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Server Component: menú lateral DESPLEGABLE de categorías.
// No necesita JavaScript en el cliente:
//  - el despliegue usa el elemento nativo <details>/<summary>
//  - cada categoría es un <Link> que cambia ?category= en la URL, conservando
//    el resto de filtros; la página (SSR) vuelve a pedir los libros al servidor
export default async function MenuCategorias({ categorias, filtros }) {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  function hrefCategoria(slug) {
    const params = new URLSearchParams();
    Object.entries({ ...filtros, category: slug }).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return ruta(idioma, qs ? `/libreria?${qs}` : '/libreria');
  }

  const clase = (activa) =>
    `group/item flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
      activa ? 'bg-nexus-600 font-semibold text-white shadow-sm shadow-nexus-600/30' : 'text-slate-600 hover:bg-nexus-50 hover:text-nexus-700'
    }`;

  return (
    <details open className="tarjeta group p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-tinta">
        {dic.libreria.categorias}
        <span className="text-slate-400 transition duration-300 group-open:rotate-180">⌄</span>
      </summary>
      <ul className="mt-3 space-y-0.5">
        <li>
          <Link href={hrefCategoria('')} className={clase(!filtros.category)} aria-current={!filtros.category ? 'true' : undefined}>
            <span>📚 {dic.libreria.todas}</span>
          </Link>
        </li>
        {categorias.map((c) => {
          const activa = filtros.category === c.slug;
          return (
            <li key={c.id}>
              <Link href={hrefCategoria(c.slug)} className={clase(activa)} aria-current={activa ? 'true' : undefined}>
                <span className="transition group-hover/item:translate-x-0.5">
                  {c.icon} {c.name}
                </span>
                <span className={`rounded-full px-2 text-[11px] ${activa ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {c.book_count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
