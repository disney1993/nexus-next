import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormularioReserva from '@/components/FormularioReserva';
import ReservasEspacio from '@/components/ReservasEspacio';
import { getEspacioPorId, getReservas } from '@/lib/api';
import { obtenerSesion } from '@/lib/sesion';
import { ICONOS_EQUIPAMIENTO, formatearHora, nombreEquipamiento } from '@/lib/formato';
import { ruta, t } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Ruta dinámica "/[lang]/coworking/[id]" — Detalle y reserva de un espacio (Server Component).
// Renderizado: SSR. La ocupación cambia constantemente y las reservas se piden
// con el token del usuario (cookie), así que se genera en cada petición.
// Renderizado híbrido dentro de la misma página:
//   - la ficha del espacio y la primera lista de reservas → servidor (SSR)
//   - <ReservasEspacio> → recibe esa lista inicial y la refresca desde el
//     navegador cada 30 s (CSR)
//   - <FormularioReserva> → formulario interactivo que llama a una Server Action

// Título fijo (traducido): un generateMetadata que consultase la API se
// ejecutaría también en cada prefetch de los enlaces del plano.
export async function generateMetadata() {
  const dic = await obtenerDiccionario();
  return { title: dic.espacio.metaTitulo };
}

export default async function PaginaDetalleEspacio({ params }) {
  const { id } = await params;
  const [idioma, dic, sesion] = await Promise.all([obtenerIdioma(), obtenerDiccionario(), obtenerSesion()]);
  const textos = dic.espacio;

  const [espacio, reservas] = await Promise.all([getEspacioPorId(id), getReservas({ space_id: id }, sesion?.token)]);
  if (!espacio) notFound();

  const ocupado = espacio.occupied;
  const personas = espacio.capacity === 1 ? dic.comun.persona : dic.comun.personas;

  return (
    <>
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href={ruta(idioma, '/coworking')} className="transition hover:text-nexus-700">{dic.nav.coworking}</Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-700">{espacio.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-8">
        <div className="space-y-6">
          <div className="tarjeta overflow-hidden">
            <div className="relative aspect-[16/10] bg-slate-200">
              <Image src={espacio.image_url} alt={espacio.name} fill priority sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
              <span className={`insignia absolute left-4 top-4 px-3 py-1 text-xs text-white shadow ${ocupado ? 'bg-ocupado' : 'bg-libre'}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {ocupado ? textos.ocupadoAhora : textos.disponibleAhora}
              </span>
            </div>
            {ocupado && espacio.occupied_by && (
              <div className="flex items-center gap-3 p-4">
                <Image src={espacio.occupied_by.user_avatar} alt="" width={44} height={44} className="rounded-full ring-2 ring-ocupado-suave" />
                <div className="text-sm">
                  <p className="font-semibold text-tinta">{t(textos.ocupadoPor, { nombre: espacio.occupied_by.user_name })}</p>
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
            )}
          </div>

          <ReservasEspacio idEspacio={espacio.id} reservasIniciales={Array.isArray(reservas) ? reservas : []} />
        </div>

        <div className="space-y-6">
          <section className="tarjeta p-6 sm:p-8">
            <span className="insignia bg-nexus-50 text-nexus-700">
              {dic.coworking.tipos[espacio.type] ?? espacio.type} · {t(textos.planta, { n: espacio.floor ?? 1 })}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-tinta sm:text-3xl">{espacio.name}</h1>
            <p className="mt-1 text-sm text-slate-500">👥 {t(textos.capacidad, { n: espacio.capacity, personas })}</p>
            <p className="mt-4 leading-relaxed text-slate-600">{espacio.description}</p>

            <h2 className="mt-6 text-sm font-semibold text-tinta">{textos.equipamiento}</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {espacio.amenities?.map((a) => (
                <li key={a} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">
                  <span className="text-base">{ICONOS_EQUIPAMIENTO[a] ?? '✓'}</span>
                  {nombreEquipamiento(a, dic)}
                </li>
              ))}
            </ul>
          </section>

          <FormularioReserva idEspacio={espacio.id} nombreEspacio={espacio.name} />
        </div>
      </div>
    </>
  );
}
