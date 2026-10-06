import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Portada from '@/components/Portada';
import BotonComprar from '@/components/BotonComprar';
import { getLibroPorId, getLibros, REVALIDAR } from '@/lib/api';
import { formatearPrecio } from '@/lib/formato';
import { ruta, t } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Ruta dinámica "/[lang]/libreria/[id]" — Ficha de un libro o revista (Server Component).
// Renderizado: SSG + ISR.
//  - generateStaticParams() pide a la API simulada todos los libros en el build
//    y genera una página HTML estática por libro Y por idioma (/es/libreria/1,
//    /en/libreria/1…): Next.js la ejecuta una vez por cada idioma del layout.
//  - revalidate = 3600 → se regeneran en segundo plano como mucho cada hora
//  - Un id nuevo que no existía en el build se genera bajo demanda la primera vez
// La página no lee cookies (por eso puede ser estática): la compra la hace la
// Server Action que dispara el Client Component <BotonComprar>.
export const revalidate = 3600;

export async function generateStaticParams() {
  const { data } = await getLibros({ limit: 100 }, { next: { revalidate: REVALIDAR.catalogo } });
  return data.map((libro) => ({ id: String(libro.id) }));
}

// cache() de React: generateMetadata y la página comparten el mismo resultado
// durante una misma renderización, así que la API solo se llama una vez
const cargarLibro = cache(async (id) => {
  try {
    return await getLibroPorId(id);
  } catch (error) {
    if (error.status === 404) notFound(); // muestra ./not-found.js
    throw error; // otro error → error.js del grupo (servicios)
  }
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const libro = await cargarLibro(id);
  return { title: libro.title, description: libro.description };
}

export default async function PaginaDetalleLibro({ params }) {
  const { id } = await params;
  const [idioma, dic, libro] = await Promise.all([obtenerIdioma(), obtenerDiccionario(), cargarLibro(id)]);
  const textos = dic.libro;
  const esRevista = libro.type === 'magazine';
  const estrellas = Math.round(libro.rating ?? 0);

  const datos = [
    [textos.anio, libro.year],
    [textos.isbn, libro.isbn],
    [textos.categoria, libro.category_name],
    [textos.editorial, libro.publisher],
    [textos.paginas, libro.pages],
    [textos.idioma, libro.language],
    [textos.vendidos, libro.sold_units && t(textos.unidades, { n: libro.sold_units })],
    [textos.stock, libro.stock > 0 ? t(textos.disponibles, { n: libro.stock }) : textos.sinStock],
  ].filter(([, valor]) => valor);

  return (
    <>
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href={ruta(idioma, '/libreria')} className="transition hover:text-nexus-700">{dic.nav.libreria}</Link>
        <span aria-hidden>/</span>
        <Link href={ruta(idioma, `/libreria?category=${libro.category}`)} className="transition hover:text-nexus-700">
          {libro.category_name}
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 font-medium text-slate-700">{libro.title}</span>
      </nav>

      <article className="tarjeta grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,15rem)_1fr] lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-12">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[15rem] overflow-hidden rounded-xl bg-slate-100 shadow-xl shadow-nexus-900/10 ring-1 ring-slate-200 md:max-w-none">
          <Portada src={libro.cover_url} alt={libro.title} semilla={`book${libro.id}`} sizes="(max-width: 768px) 60vw, 288px" priority />
        </div>

        <div className="min-w-0">
          <span className={`insignia ${esRevista ? 'bg-tinta text-white' : 'bg-nexus-50 text-nexus-700'}`}>
            {esRevista ? dic.libreria.revista : dic.libreria.libro}
          </span>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-tinta sm:text-3xl">{libro.title}</h1>
          <p className="mt-1 text-slate-500">{t(textos.por, { autor: libro.author })}</p>

          <div className="mt-3 flex items-center gap-2" aria-label={t(textos.valoracion, { n: libro.rating })}>
            <span className="text-lg tracking-wider text-acento">
              {'★'.repeat(estrellas)}
              <span className="text-slate-200">{'★'.repeat(5 - estrellas)}</span>
            </span>
            <span className="text-sm font-medium text-slate-500">{libro.rating?.toFixed(1)}</span>
          </div>

          <p className="mt-5 text-3xl font-bold tracking-tight text-tinta">{formatearPrecio(libro.price, idioma)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{etiqueta}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">{valor}</dd>
              </div>
            ))}
          </dl>

          {libro.description && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-tinta">{textos.descripcion}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{libro.description}</p>
            </section>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <BotonComprar idLibro={libro.id} sinStock={libro.stock === 0} />
          </div>
        </div>
      </article>
    </>
  );
}
