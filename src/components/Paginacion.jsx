import Link from 'next/link';
import { ruta, t } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Server Component: la paginación son simples enlaces que cambian ?page=
// conservando los filtros actuales. No hace falta estado en el cliente.
export default async function Paginacion({ pagina, totalPaginas, params }) {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  function href(numero) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && k !== 'page' && qs.set(k, v));
    if (numero > 1) qs.set('page', numero);
    const cadena = qs.toString();
    return ruta(idioma, cadena ? `/libreria?${cadena}` : '/libreria');
  }

  const desactivado = 'btn-secundario pointer-events-none opacity-40';

  return (
    <nav className="mt-10 flex items-center justify-between gap-3 border-t border-slate-200 pt-6" aria-label="Paginación">
      <Link href={href(pagina - 1)} className={pagina <= 1 ? desactivado : 'btn-secundario'} aria-disabled={pagina <= 1}>
        ← <span className="hidden sm:inline">{dic.libreria.anterior}</span>
      </Link>
      <span className="text-sm text-slate-500">{t(dic.libreria.pagina, { pagina, total: totalPaginas })}</span>
      <Link
        href={href(pagina + 1)}
        className={pagina >= totalPaginas ? desactivado : 'btn-secundario'}
        aria-disabled={pagina >= totalPaginas}
      >
        <span className="hidden sm:inline">{dic.libreria.siguiente}</span> →
      </Link>
    </nav>
  );
}
