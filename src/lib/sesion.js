import 'server-only';
import { cookies } from 'next/headers';

// Nombres de las cookies de sesión
export const COOKIE_TOKEN = 'nexus_token'; // httpOnly: el JavaScript del navegador no puede leerla
export const COOKIE_USUARIO = 'nexus_usuario'; // datos públicos del usuario (nombre, avatar) para la UI
// La API simulada no guarda las compras nuevas (siempre devuelve el mismo ejemplo),
// así que las compras hechas durante la sesión se recuerdan en esta cookie para
// poder mostrarlas en "Mis compras". En la Actividad 2/3 lo sustituirá PostgreSQL.
export const COOKIE_COMPRAS = 'nexus_compras_sesion';

// Lee la sesión desde las cookies. Solo puede usarse en el servidor
// (Server Components y Server Actions). Usarla convierte la ruta en dinámica (SSR).
export async function obtenerSesion() {
  const almacen = await cookies();
  const token = almacen.get(COOKIE_TOKEN)?.value;
  const usuarioCrudo = almacen.get(COOKIE_USUARIO)?.value;
  if (!token || !usuarioCrudo) return null;
  try {
    return { token, usuario: JSON.parse(usuarioCrudo) };
  } catch {
    return null;
  }
}

// Compras realizadas durante la sesión actual: [{ id, book_id, price_paid, purchased_at }]
export async function obtenerComprasSesion() {
  const almacen = await cookies();
  try {
    return JSON.parse(almacen.get(COOKIE_COMPRAS)?.value ?? '[]');
  } catch {
    return [];
  }
}
