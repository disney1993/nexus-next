import Link from 'next/link';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

export default async function EspacioNoEncontrado() {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  return (
    <div className="tarjeta mx-auto max-w-lg animate-emerger p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-nexus-50 text-2xl">🚪</span>
      <h2 className="mt-4 text-lg font-semibold text-tinta">{dic.espacio.noEncontrado}</h2>
      <p className="mt-1 text-sm text-slate-500">{dic.espacio.noEncontradoTexto}</p>
      <Link href={ruta(idioma, '/coworking')} className="btn-primario mt-6">
        {dic.espacio.volver}
      </Link>
    </div>
  );
}
