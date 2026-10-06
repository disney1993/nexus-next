import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import FormularioLogin from '@/components/FormularioLogin';
import BotonGoogle from '@/components/BotonGoogle';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Ruta "/[lang]/login" (Server Component).
// Renderizado: SSG (estática, una por idioma). El marco se genera en el build y
// solo el formulario se hidrata en el cliente.
// Si ya hay sesión, el proxy (src/proxy.js) redirige a la portada.

export async function generateMetadata() {
  const dic = await obtenerDiccionario();
  return { title: dic.login.metaTitulo };
}

export default async function PaginaLogin() {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  return (
    <div className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-nexus-200/60 to-transparent blur-3xl" />
      </div>

      <div className="tarjeta w-full max-w-md animate-emerger p-6 shadow-xl shadow-nexus-900/5 sm:p-8">
        <Link href={ruta(idioma)} className="flex justify-center">
          <Logo />
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-tinta">{dic.login.titulo}</h1>
        <p className="mt-1 text-center text-sm text-slate-500">{dic.login.subtitulo}</p>

        <div className="mt-8">
          <BotonGoogle />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          {dic.login.o}
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* useSearchParams en un componente cliente exige un límite de Suspense en páginas estáticas */}
        <Suspense fallback={<div className="esqueleto h-64" />}>
          <FormularioLogin />
        </Suspense>
      </div>
    </div>
  );
}
