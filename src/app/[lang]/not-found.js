import Link from 'next/link';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// 404 de la aplicación (en el idioma de la URL)
export default async function NoEncontrado() {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  return (
    <div className="contenedor flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="bg-gradient-to-br from-nexus-500 to-nexus-800 bg-clip-text text-7xl font-black text-transparent">404</p>
      <h1 className="mt-3 text-xl font-semibold text-tinta">{dic.errores.noEncontradoTitulo}</h1>
      <p className="mt-1 text-sm text-slate-500">{dic.errores.noEncontradoTexto}</p>
      <Link href={ruta(idioma)} className="btn-primario mt-8">
        {dic.comun.volverInicio}
      </Link>
    </div>
  );
}
