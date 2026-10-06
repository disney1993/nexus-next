import { googleHabilitado, urlLoginGoogle } from '@/lib/auth/proveedores';
import { ruta } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';

// Server Component: botón "Continuar con Google" (OAuth 2.0 vía Auth0).
// Lee las variables de entorno en el servidor (nunca llegan al navegador):
//  - sin credenciales de Auth0 → botón desactivado "Disponible próximamente"
//  - con credenciales → enlace a /auth/login?connection=google-oauth2
// Es un <a> normal (no <Link>) porque el flujo OAuth sale de la aplicación.

function IconoGoogle() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.95l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default async function BotonGoogle() {
  const [idioma, dic] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);
  const clases =
    'flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition';

  if (!googleHabilitado) {
    return (
      <button type="button" disabled className={`${clases} cursor-not-allowed opacity-70`} title={dic.login.googleProximamente}>
        <IconoGoogle />
        {dic.login.google}
        <span className="insignia bg-slate-100 text-slate-500">{dic.login.googleProximamente}</span>
      </button>
    );
  }

  return (
    <a href={urlLoginGoogle(ruta(idioma))} className={`${clases} hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]`}>
      <IconoGoogle />
      {dic.login.google}
    </a>
  );
}
