import Link from 'next/link';
import Portada from './Portada';
import VistaRapidaLibro from './VistaRapidaLibro';
import { formatearPrecio } from '@/lib/formato';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Server Component (asíncrono): solo pinta datos que recibe por props; no tiene
// estado ni eventos. Lee el idioma con next/root-params, sin recibirlo por props.
// Las dos piezas interactivas son hijas Client Components:
//   - <Portada>: fallback de imagen con onError
//   - <VistaRapidaLibro>: ficha emergente al pasar el ratón
// La animación de entrada escalonada y el zoom de la portada son solo CSS.
export default async function TarjetaLibro({ libro, posicion, indice = 0 }) {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);
  const esRevista = libro.type === 'magazine';

  return (
    // hover:z-20 → la ficha emergente queda por encima de las tarjetas vecinas
    <div
      className="relative animate-entrada hover:z-20 focus-within:z-20"
      style={{ animationDelay: `${Math.min(indice, 11) * 45}ms` }}
    >
      <VistaRapidaLibro idLibro={libro.id}>
        <Link
          href={ruta(idioma, `/libreria/${libro.id}`)}
          className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-nexus-200 hover:shadow-xl hover:shadow-nexus-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-nexus-500/20"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
            <Portada
              src={libro.cover_url}
              alt={libro.title}
              semilla={`book${libro.id}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
              className="transition duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            {posicion && (
              <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-xs font-bold text-nexus-700 shadow-md backdrop-blur">
                #{posicion}
              </span>
            )}
            <span
              className={`insignia absolute right-2.5 top-2.5 shadow-sm backdrop-blur ${esRevista ? 'bg-tinta/80 text-white' : 'bg-white/90 text-nexus-700'}`}
            >
              {esRevista ? dic.libreria.revista : dic.libreria.libro}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-3.5">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-tinta transition group-hover:text-nexus-700">
              {libro.title}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{libro.author}</p>
            <div className="mt-auto flex items-center justify-between pt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                <span className="text-acento">★</span>
                {libro.rating?.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-tinta">{formatearPrecio(libro.price, idioma)}</span>
            </div>
          </div>
        </Link>
      </VistaRapidaLibro>
    </div>
  );
}
