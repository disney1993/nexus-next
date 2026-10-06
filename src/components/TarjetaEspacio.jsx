import Image from 'next/image';
import Link from 'next/link';
import { ICONOS_EQUIPAMIENTO, formatearHora, nombreEquipamiento } from '@/lib/formato';
import { ruta, t } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Server Component (asíncrono): tarjeta de un espacio en el plano.
// La información al pasar el ratón se resuelve SOLO con CSS (clases group-hover
// y group-focus-within de Tailwind), sin JavaScript en el cliente: por eso
// puede seguir siendo un Server Component (en la app React original usaba
// useState + onMouseEnter).
export default async function TarjetaEspacio({ espacio, indice = 0 }) {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);
  const textos = dic.coworking;
  const ocupado = espacio.occupied;
  const personas = espacio.capacity === 1 ? dic.comun.persona : dic.comun.personas;

  return (
    <div className="group relative animate-entrada hover:z-20 focus-within:z-20" style={{ animationDelay: `${indice * 60}ms` }}>
      <Link
        href={ruta(idioma, `/coworking/${espacio.id}`)}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-nexus-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-nexus-500/20"
      >
        <div className="relative h-36 overflow-hidden bg-slate-200">
          <Image
            src={espacio.image_url}
            alt={espacio.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
          <span
            className={`insignia absolute left-3 top-3 text-white shadow-sm ${ocupado ? 'bg-ocupado' : 'bg-libre'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {ocupado ? textos.ocupado : textos.libre}
          </span>
          <p className="absolute bottom-3 left-3 right-3 truncate text-base font-semibold text-white drop-shadow">{espacio.name}</p>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs text-slate-500">
            {textos.tipos[espacio.type] ?? espacio.type} · 👥 {espacio.capacity} {personas}
          </p>

          <div className="mt-auto pt-3">
            {ocupado && espacio.occupied_by ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-ocupado-suave p-2.5">
                <Image src={espacio.occupied_by.user_avatar} alt="" width={32} height={32} className="rounded-full ring-2 ring-white" />
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold text-tinta">{espacio.occupied_by.user_name}</p>
                  {espacio.start_time && espacio.end_time && (
                    <p className="text-slate-500">
                      {t(textos.desdeHasta, {
                        desde: formatearHora(espacio.start_time, idioma),
                        hasta: formatearHora(espacio.end_time, idioma),
                      })}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-xl bg-libre-suave p-2.5 text-xs font-semibold text-libre">
                <span className="text-base">✓</span> {textos.disponibleAhora}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Ficha emergente al pasar el ratón (solo CSS, solo en pantallas con ratón) */}
      <div
        role="tooltip"
        className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-3 hidden w-72 -translate-x-1/2 translate-y-1 rounded-2xl border border-slate-200 bg-white/95 p-4 opacity-0 shadow-2xl shadow-nexus-900/10 backdrop-blur transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 lg:block"
      >
        <span aria-hidden className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
        <p className="font-semibold text-tinta">{espacio.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{espacio.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {espacio.amenities?.map((a) => (
            <span key={a} className="insignia bg-slate-100 font-medium text-slate-600">
              {ICONOS_EQUIPAMIENTO[a] ?? '✓'} {nombreEquipamiento(a, dic)}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">{textos.clicDetalle}</p>
      </div>
    </div>
  );
}
