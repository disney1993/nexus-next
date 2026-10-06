'use server';

// Server Actions: funciones que se ejecutan en el servidor pero se invocan desde
// Client Components (formularios y botones). Así el token de sesión nunca sale
// del servidor (cookie httpOnly) y el cliente solo recibe el resultado.
// Devuelven CÓDIGOS (no textos) para que el cliente los traduzca a su idioma.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as api from './api';
import { COOKIE_COMPRAS, COOKIE_TOKEN, COOKIE_USUARIO, obtenerComprasSesion, obtenerSesion } from './sesion';
import { esIdiomaValido, IDIOMA_POR_DEFECTO } from '@/i18n/config';

const OPCIONES_COOKIE = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 8, // 8 horas
};

// Solo se permiten redirecciones internas tras el login
function destinoSeguro(destino, idioma) {
  return typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//')
    ? destino
    : `/${idioma}`;
}

// ── LOGIN / LOGOUT ────────────────────────────────────────────────────────────

// Pensada para useActionState: recibe el estado previo y el FormData del formulario
export async function iniciarSesion(_estadoPrevio, formData) {
  const idioma = esIdiomaValido(formData.get('idioma')) ? formData.get('idioma') : IDIOMA_POR_DEFECTO;
  const email = formData.get('email');
  const password = formData.get('password');
  const destino = destinoSeguro(formData.get('destino'), idioma);

  let datos;
  try {
    datos = await api.login(email, password);
  } catch {
    return { error: 'credenciales' };
  }

  const almacen = await cookies();
  almacen.set(COOKIE_TOKEN, datos.token, { ...OPCIONES_COOKIE, httpOnly: true });
  almacen.set(
    COOKIE_USUARIO,
    JSON.stringify({ id: datos.user.id, name: datos.user.name, avatar: datos.user.avatar }),
    OPCIONES_COOKIE,
  );

  redirect(destino);
}

// Se usa con .bind(null, idioma) para volver al login en el idioma actual
export async function cerrarSesion(idioma) {
  const sesion = await obtenerSesion();
  if (sesion) {
    try {
      await api.logout(sesion.token);
    } catch {
      // Si la API falla, la sesión local se cierra igualmente
    }
  }
  const almacen = await cookies();
  almacen.delete(COOKIE_TOKEN);
  almacen.delete(COOKIE_USUARIO);
  almacen.delete(COOKIE_COMPRAS);
  redirect(`/${esIdiomaValido(idioma) ? idioma : IDIOMA_POR_DEFECTO}/login`);
}

// ── COMPRA DE LIBROS ──────────────────────────────────────────────────────────

export async function comprarLibro(idLibro) {
  const sesion = await obtenerSesion();
  if (!sesion) return { ok: false, codigo: 'sesion' };

  try {
    const [compra, libro] = await Promise.all([
      api.crearCompra(idLibro, sesion.usuario.id, sesion.token),
      api.getLibroPorId(idLibro),
    ]);

    // Se recuerda la compra en la sesión (ver COOKIE_COMPRAS en sesion.js)
    const comprasSesion = await obtenerComprasSesion();
    comprasSesion.push({
      id: `sesion-${Date.now()}`,
      book_id: Number(idLibro),
      price_paid: libro.price,
      purchased_at: new Date().toISOString(),
    });
    const almacen = await cookies();
    almacen.set(COOKIE_COMPRAS, JSON.stringify(comprasSesion.slice(-20)), { ...OPCIONES_COOKIE, httpOnly: true });

    // La próxima visita a "Mis compras" (en cualquier idioma) se regenera
    revalidatePath('/[lang]/mis-compras', 'page');
    return { ok: true, pedido: compra.id, titulo: libro.title };
  } catch {
    return { ok: false, codigo: 'error' };
  }
}

// ── RESERVA DE ESPACIOS ───────────────────────────────────────────────────────

export async function reservarEspacio({ idEspacio, inicio, fin }) {
  const sesion = await obtenerSesion();
  if (!sesion) return { ok: false, codigo: 'sesion' };

  if (!inicio || !fin || new Date(fin) <= new Date(inicio)) {
    return { ok: false, codigo: 'rango' };
  }

  try {
    await api.crearReserva(
      { space_id: Number(idEspacio), user_id: sesion.usuario.id, start_time: inicio, end_time: fin },
      sesion.token,
    );
    revalidatePath('/[lang]/coworking', 'layout');
    return { ok: true };
  } catch {
    return { ok: false, codigo: 'error' };
  }
}
