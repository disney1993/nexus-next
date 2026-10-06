import Link from 'next/link';
import Portada from '@/components/Portada';
import TarjetaLibro from '@/components/TarjetaLibro';
import { getMasVendidos } from '@/lib/api';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Ruta "/[lang]" — Landing general (Server Component).
// Renderizado: ISR (Incremental Static Regeneration). Se genera en el build una
// versión por idioma (/es, /en, /fr, /it, /de) y se regenera en segundo plano
// como mucho una vez por hora, porque el ranking de más vendidos cambia poco.
// Es pública: no requiere sesión.
export const revalidate = 3600;

const ICONOS = { libreria: '📚', coworking: '💻', cafeteria: '☕', eventos: '🎓' };

export default async function Inicio() {
  const [idioma, dic, masVendidos] = await Promise.all([obtenerIdioma(), obtenerDiccionario(), getMasVendidos()]);
  const top = masVendidos.slice(0, 10);

  const servicios = [
    { clave: 'libreria', href: ruta(idioma, '/libreria') },
    { clave: 'coworking', href: ruta(idioma, '/coworking') },
    { clave: 'cafeteria' },
    { clave: 'eventos' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-nexus-900 text-white">
        {/* Fondo decorativo: luces difuminadas y cuadrícula sutil */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-nexus-500/40 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="contenedor grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="insignia animate-entrada bg-white/10 text-nexus-100 ring-1 ring-white/20">
              ✦ {dic.inicio.etiqueta}
            </span>
            <h1 className="mt-5 animate-entrada text-4xl font-bold leading-[1.1] tracking-tight [animation-delay:80ms] sm:text-5xl lg:text-6xl">
              {dic.inicio.titulo}
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-entrada text-base leading-relaxed text-nexus-100 [animation-delay:160ms] sm:text-lg lg:mx-0">
              {dic.inicio.descripcion}
            </p>
            <div className="mx-auto mt-8 flex max-w-xs animate-entrada flex-col gap-3 [animation-delay:240ms] sm:max-w-none sm:flex-row sm:justify-center lg:justify-start">
              <Link href={ruta(idioma, '/libreria')} className="btn-primario bg-white px-6 text-nexus-800 shadow-lg hover:bg-nexus-50">
                {dic.inicio.ctaLibreria} →
              </Link>
              <Link
                href={ruta(idioma, '/coworking')}
                className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10"
              >
                {dic.inicio.ctaCoworking}
              </Link>
            </div>
          </div>

          {/* Portadas en abanico (solo en pantallas grandes) */}
          <div aria-hidden className="relative hidden h-80 lg:block">
            {top.slice(0, 3).map((libro, i) => (
              // El div exterior coloca y gira la portada; el interior se anima.
              // (Si la animación fuese en el mismo elemento, su "transform: none"
              // final anularía el giro.)
              <div
                key={libro.id}
                className="absolute top-1/2 w-44"
                style={{
                  left: `${18 + i * 22}%`,
                  transform: `translateY(-50%) rotate(${(i - 1) * 8}deg)`,
                  zIndex: i === 1 ? 2 : 1,
                }}
              >
                <div
                  className="relative aspect-[3/4] animate-entrada overflow-hidden rounded-xl shadow-2xl shadow-black/40 ring-1 ring-white/20 transition duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${300 + i * 120}ms` }}
                >
                  <Portada src={libro.cover_url} alt="" semilla={`book${libro.id}`} sizes="176px" priority />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Más vendidos */}
      <section className="contenedor py-14 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="titulo-pagina">{dic.inicio.masVendidos}</h2>
            <p className="mt-1 text-sm text-slate-500">{dic.inicio.masVendidosSub}</p>
          </div>
          <Link href={ruta(idioma, '/libreria')} className="text-sm font-semibold text-nexus-700 hover:text-nexus-800">
            {dic.inicio.verCatalogo} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
          {top.map((libro, i) => (
            <TarjetaLibro key={libro.id} libro={libro} posicion={i + 1} indice={i} />
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="contenedor py-14 sm:py-20">
          <h2 className="titulo-pagina text-center">{dic.inicio.servicios}</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicios.map(({ clave, href }) => {
              const contenido = (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-50 text-2xl transition group-hover:scale-110 group-hover:bg-nexus-100">
                    {ICONOS[clave]}
                  </span>
                  <h3 className="mt-4 font-semibold text-tinta">{dic.inicio.servicio[clave].titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{dic.inicio.servicio[clave].texto}</p>
                </>
              );
              return href ? (
                <Link
                  key={clave}
                  href={href}
                  className="tarjeta group p-6 transition duration-300 hover:-translate-y-1 hover:border-nexus-200 hover:shadow-lg"
                >
                  {contenido}
                </Link>
              ) : (
                <div key={clave} className="tarjeta group relative p-6">
                  {contenido}
                  <span className="insignia absolute right-4 top-4 bg-slate-100 text-slate-500">{dic.inicio.proximamente}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
