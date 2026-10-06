import Link from 'next/link';
import { redirect } from 'next/navigation';
import Portada from '@/components/Portada';
import { getComprasUsuario, getLibroPorId } from '@/lib/api';
import { obtenerComprasSesion, obtenerSesion } from '@/lib/sesion';
import { formatearFecha, formatearPrecio } from '@/lib/formato';
import { ruta, t } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Ruta "/[lang]/mis-compras" — Libros adquiridos por el usuario (Server Component).
// Renderizado: SSR. Lee las cookies de sesión en el servidor (cookies()) para
// saber quién es el usuario y pedir SUS compras a la API simulada con su token.
// El token nunca llega al navegador; el HTML ya viene con la lista pintada.

export async function generateMetadata() {
  const dic = await obtenerDiccionario();
  return { title: dic.compras.metaTitulo };
}

export default async function PaginaMisCompras() {
  const [idioma, dic, sesion] = await Promise.all([obtenerIdioma(), obtenerDiccionario(), obtenerSesion()]);
  if (!sesion) redirect(ruta(idioma, `/login?destino=${ruta(idioma, '/mis-compras')}`));
  const textos = dic.compras;

  const [respuesta, comprasSesion] = await Promise.all([
    getComprasUsuario(sesion.usuario.id, sesion.token),
    obtenerComprasSesion(),
  ]);
  const historial = Array.isArray(respuesta) ? respuesta : respuesta ? [respuesta] : [];

  // Las compras de esta sesión solo guardan el id del libro: se completan con
  // la ficha del libro (petición cacheada por ISR, no vuelve a llamar a la API)
  const nuevas = await Promise.all(
    comprasSesion.map(async (c) => {
      const libro = await getLibroPorId(c.book_id);
      return { ...c, book_title: libro.title, book_author: libro.author, book_cover: libro.cover_url, nueva: true };
    }),
  );
  const compras = [...nuevas.reverse(), ...historial];
  const total = compras.reduce((suma, c) => suma + (c.price_paid || 0), 0);

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="titulo-pagina">{textos.titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">{t(textos.subtitulo, { nombre: sesion.usuario.name })}</p>
        </div>
        {compras.length > 0 && (
          <div className="tarjeta flex w-full divide-x divide-slate-100 text-sm sm:w-auto">
            <p className="flex-1 px-5 py-3 font-semibold text-tinta sm:flex-none">
              {t(compras.length === 1 ? textos.titulosUno : textos.titulosVarios, { n: compras.length })}
            </p>
            <p className="flex-1 px-5 py-3 font-bold text-nexus-700 sm:flex-none">
              {t(textos.total, { total: formatearPrecio(total, idioma) })}
            </p>
          </div>
        )}
      </header>

      {compras.length === 0 ? (
        <div className="tarjeta animate-emerger p-12 text-center">
          <span className="text-4xl">🛍️</span>
          <p className="mt-3 text-slate-500">{textos.vacio}</p>
          <Link href={ruta(idioma, '/libreria')} className="btn-primario mt-6">
            {textos.irLibreria}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {compras.map((compra, i) => (
            <li key={compra.id} className="animate-entrada" style={{ animationDelay: `${i * 50}ms` }}>
              <Link
                href={ruta(idioma, `/libreria/${compra.book_id}`)}
                className="tarjeta group flex items-center gap-4 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-nexus-200 hover:shadow-lg sm:p-4"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                  <Portada src={compra.book_cover} alt={compra.book_title} semilla={`book${compra.book_id}`} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="line-clamp-2 font-semibold text-tinta transition group-hover:text-nexus-700">{compra.book_title}</p>
                    {compra.nueva && <span className="insignia shrink-0 bg-libre-suave text-libre">{textos.nueva}</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{compra.book_author}</p>
                  <p className="mt-1 text-xs text-slate-400">{t(textos.compradoEl, { fecha: formatearFecha(compra.purchased_at, idioma) })}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-tinta sm:text-base">{formatearPrecio(compra.price_paid, idioma)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
