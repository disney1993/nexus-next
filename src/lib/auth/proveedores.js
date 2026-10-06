// Preparación del login social (OAuth 2.0 con Google a través de Auth0).
// En la Actividad 1 la sesión se obtiene de la API simulada (/auth/login).
// En las siguientes actividades se activará Auth0 sin tocar la interfaz:
//
//  1. npm install @auth0/nextjs-auth0
//  2. Rellenar .env.local a partir de .env.example (AUTH0_DOMAIN, AUTH0_CLIENT_ID…)
//  3. Crear src/lib/auth/auth0.js:  export const auth0 = new Auth0Client();
//  4. En src/proxy.js, delegar las rutas /auth/* en auth0.middleware(request)
//  5. En src/lib/sesion.js, leer la sesión con auth0.getSession()
//
// El SDK v4 de Auth0 monta automáticamente /auth/login, /auth/logout y
// /auth/callback; el proxy ya excluye /auth/* para no interferir.

// Google está disponible en cuanto existan las credenciales de Auth0
export const googleHabilitado = Boolean(process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID);

// URL que inicia el flujo OAuth forzando la conexión de Google en Auth0
export function urlLoginGoogle(destino = '/') {
  const params = new URLSearchParams({ connection: 'google-oauth2', returnTo: destino });
  return `/auth/login?${params}`;
}
