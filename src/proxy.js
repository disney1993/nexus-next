import { NextResponse } from 'next/server';
import { COOKIE_IDIOMA, IDIOMAS, IDIOMA_POR_DEFECTO, esIdiomaValido } from '@/i18n/config';

// Proxy (antes "middleware" en Next.js ≤ 15): se ejecuta antes de servir cada ruta.
// Tiene dos responsabilidades:
//  1. Internacionalización: si la URL no lleva idioma (/libreria) redirige a la
//     versión con idioma (/es/libreria), eligiendo el idioma por la cookie
//     NEXT_LOCALE o por la cabecera Accept-Language del navegador.
//  2. Autenticación: sustituye al <RutaProtegida> de la app React original.
//     Sin cookie de sesión, las rutas privadas redirigen al login.

const RUTAS_PROTEGIDAS = ['/libreria', '/mis-compras', '/coworking'];

function detectarIdioma(request) {
  const deCookie = request.cookies.get(COOKIE_IDIOMA)?.value;
  if (esIdiomaValido(deCookie)) return deCookie;

  // "fr-FR,fr;q=0.9,en;q=0.8" → ['fr', 'fr', 'en'] por orden de preferencia
  const preferidos = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((parte) => parte.split(';')[0].trim().slice(0, 2).toLowerCase());
  return preferidos.find(esIdiomaValido) ?? IDIOMA_POR_DEFECTO;
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // 1. URL sin idioma → redirigir a /{idioma}/...
  const idiomaEnRuta = IDIOMAS.find((i) => pathname === `/${i}` || pathname.startsWith(`/${i}/`));
  if (!idiomaEnRuta) {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectarIdioma(request)}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  // 2. Autenticación sobre la parte de la ruta sin el idioma
  const resto = pathname.slice(idiomaEnRuta.length + 1) || '/';
  const token = request.cookies.get('nexus_token')?.value;

  if (resto === '/login') {
    return token ? NextResponse.redirect(new URL(`/${idiomaEnRuta}`, request.url)) : NextResponse.next();
  }

  const protegida = RUTAS_PROTEGIDAS.some((r) => resto === r || resto.startsWith(`${r}/`));
  if (protegida && !token) {
    const urlLogin = new URL(`/${idiomaEnRuta}/login`, request.url);
    urlLogin.searchParams.set('destino', pathname + search);
    return NextResponse.redirect(urlLogin);
  }

  return NextResponse.next();
}

// Se ejecuta en todo excepto en los ficheros internos de Next, las imágenes
// optimizadas, ficheros con extensión (favicon.ico…) y las rutas /auth y /api
// (reservadas para Auth0 y los Route Handlers de las próximas actividades).
export const config = {
  matcher: ['/((?!_next/|api/|auth/|.*\\..*).*)'],
};
