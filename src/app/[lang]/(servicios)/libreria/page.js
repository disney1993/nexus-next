import TarjetaLibro from '@/components/TarjetaLibro';
import MenuCategorias from '@/components/MenuCategorias';
import FiltrosLibreria from '@/components/FiltrosLibreria';
import PanelLateral from '@/components/PanelLateral';
import Paginacion from '@/components/Paginacion';
import { getCategorias, getLibros, REVALIDAR } from '@/lib/api';
import { t } from '@/i18n/config';
import { obtenerDiccionario } from '@/i18n/servidor';

// Ruta "/[lang]/libreria" — Catálogo (Server Component).
// Renderizado: SSR. Depende de searchParams (?category=&year=&type=&max_price=
// &search=&page=), así que se genera en el servidor en cada petición.
// Los filtros viven en la URL: se pueden compartir y el botón "atrás" funciona.
// Sustituye al useState + useEffect + useApi de la app React original.

export async function generateMetadata() {
  const dic = await obtenerDiccionario();
  return { title: dic.libreria.metaTitulo };
}

const POR_PAGINA = 12;
const CLAVES_FILTRO = ['category', 'type', 'year', 'max_price', 'search'];

export default async function PaginaLibreria({ searchParams }) {
  const params = await searchParams;
  const filtros = Object.fromEntries(CLAVES_FILTRO.map((k) => [k, params[k] ?? '']));
  const pagina = Math.max(1, Number(params.page) || 1);

  // Las peticiones a la API simulada se lanzan en paralelo en el servidor
  const [dic, resultado, categorias, catalogoCompleto] = await Promise.all([
    obtenerDiccionario(),
    getLibros({ ...filtros, page: pagina, limit: POR_PAGINA }),
    getCategorias(),
    // Solo para construir las opciones del filtro de año (cacheado 1 h)
    getLibros({ limit: 100 }, { next: { revalidate: REVALIDAR.catalogo } }),
  ]);

  const libros = resultado?.data ?? [];
  const paginacion = resultado?.pagination;
  const anios = [...new Set(catalogoCompleto.data.map((l) => l.year))].sort((a, b) => b - a);
  const categoriaActual = categorias.find((c) => c.slug === filtros.category);
  const total = paginacion?.total ?? libros.length;

  return (
    <>
      <header className="mb-8">
        <h1 className="titulo-pagina">{dic.libreria.titulo}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="insignia bg-nexus-50 text-nexus-700">
            {categoriaActual ? `${categoriaActual.icon} ${categoriaActual.name}` : dic.libreria.todasCategorias}
          </span>
          {t(total === 1 ? dic.libreria.resultadosUno : dic.libreria.resultadosVarios, { n: total })}
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* En escritorio es una barra lateral; en móvil/tablet, un panel deslizante */}
        <PanelLateral>
          <MenuCategorias categorias={categorias} filtros={filtros} />
          <FiltrosLibreria anios={anios} />
        </PanelLateral>

        <section className="min-w-0 flex-1">
          {libros.length === 0 ? (
            <div className="tarjeta animate-emerger p-12 text-center">
              <span className="text-4xl">🔍</span>
              <p className="mt-3 text-slate-500">{dic.libreria.sinResultados}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
              {libros.map((libro, i) => (
                <TarjetaLibro key={libro.id} libro={libro} indice={i} />
              ))}
            </div>
          )}

          {paginacion && paginacion.total_pages > 1 && (
            <Paginacion pagina={paginacion.page} totalPaginas={paginacion.total_pages} params={params} />
          )}
        </section>
      </div>
    </>
  );
}
