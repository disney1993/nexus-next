import TarjetaEspacio from '@/components/TarjetaEspacio';
import FiltrosCoworking from '@/components/FiltrosCoworking';
import ActualizarEspacios from '@/components/ActualizarEspacios';
import { getEspacios } from '@/lib/api';
import { t } from '@/i18n/config';
import { obtenerDiccionario } from '@/i18n/servidor';

// Ruta "/[lang]/coworking" — Plano de la planta con todos los espacios (Server Component).
// Renderizado: SSR sin caché (cache: 'no-store'). La ocupación cambia en tiempo
// real, así que cada petición pide el estado actual a la API simulada.
// Filtros en la URL: ?occupied=true|false&min_capacity=N&type=...

export async function generateMetadata() {
  const dic = await obtenerDiccionario();
  return { title: dic.coworking.metaTitulo };
}

export default async function PaginaCoworking({ searchParams }) {
  const { occupied = '', min_capacity = '', type = '' } = await searchParams;

  // "occupied" y "min_capacity" los filtra la API; "type" se filtra aquí (servidor)
  const [dic, espacios] = await Promise.all([obtenerDiccionario(), getEspacios({ occupied, min_capacity })]);
  const textos = dic.coworking;
  const visibles = type ? espacios.filter((e) => e.type === type) : espacios;
  const libres = visibles.filter((e) => !e.occupied).length;
  const ocupados = visibles.length - libres;
  const plazas = visibles.reduce((suma, e) => suma + e.capacity, 0);
  const porcentaje = visibles.length ? Math.round((ocupados / visibles.length) * 100) : 0;

  return (
    <>
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="titulo-pagina">{textos.titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">{t(textos.subtitulo, { espacios: visibles.length, plazas })}</p>
        </div>

        {/* Resumen de ocupación */}
        <div className="tarjeta grid grid-cols-2 gap-px overflow-hidden bg-slate-100 sm:min-w-80">
          <div className="bg-white px-5 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-libre opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-libre" />
              </span>
              {textos.libres}
            </p>
            <p className="mt-1 text-2xl font-bold text-libre">{libres}</p>
          </div>
          <div className="bg-white px-5 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-ocupado" />
              {textos.ocupados}
            </p>
            <p className="mt-1 text-2xl font-bold text-ocupado">{ocupados}</p>
          </div>
          <div className="col-span-2 bg-white px-5 pb-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-libre-suave">
              <div className="h-full rounded-full bg-ocupado transition-all duration-700" style={{ width: `${porcentaje}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FiltrosCoworking />
        <ActualizarEspacios />
      </div>

      {visibles.length === 0 ? (
        <div className="tarjeta animate-emerger p-12 text-center text-slate-500">
          <span className="text-4xl">🪑</span>
          <p className="mt-3">{textos.sinEspacios}</p>
        </div>
      ) : (
        <section
          aria-label={textos.plano}
          className="grid grid-cols-1 gap-4 rounded-3xl border border-dashed border-slate-300 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:20px_20px] p-3 sm:grid-cols-2 sm:gap-5 sm:p-5 lg:grid-cols-3 xl:grid-cols-4"
        >
          {visibles.map((espacio, i) => (
            <TarjetaEspacio key={espacio.id} espacio={espacio} indice={i} />
          ))}
        </section>
      )}

      <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-libre" /> {textos.libre}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ocupado" /> {textos.ocupado}
        </span>
        <span>{textos.ayuda}</span>
      </p>
    </>
  );
}
