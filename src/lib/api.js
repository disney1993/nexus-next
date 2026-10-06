// URL base de la API simulada (mock) creada en Apidog en la Actividad 1 de DWOC
export const URL_BASE = 'https://mock.apidog.com/m1/1255596-1252971-default';

// Cabeceras HTTP, añadiendo el token si existe
function cabeceras(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Construye el query string ignorando los parámetros vacíos
function queryString(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== undefined && valor !== null) qs.append(clave, valor);
  });
  const cadena = qs.toString();
  return cadena ? `?${cadena}` : '';
}

// Petición genérica. Se usa tanto en el servidor (Server Components / Server Actions)
// como en el cliente (Client Components). En el servidor, "opciones.next" y
// "opciones.cache" controlan la caché de Next.js (SSG / ISR / SSR).
async function peticion(ruta, opciones = {}) {
  const url = `${URL_BASE}${ruta}`;
  const lado = typeof window === 'undefined' ? 'servidor' : 'cliente';
  // Traza para demostrar en la vídeo memoria que los datos vienen de la API simulada
  console.log(`[API simulada · ${lado}] ${opciones.method || 'GET'} ${url}`);

  // La API simulada devuelve a veces 502/429 si recibe muchas peticiones a la vez
  // (p. ej. en el build, al generar todas las fichas): los GET se reintentan.
  const reintentos = opciones.method && opciones.method !== 'GET' ? 0 : 3;
  let respuesta = await fetch(url, opciones);
  for (let i = 1; i <= reintentos && (respuesta.status === 429 || respuesta.status >= 500); i++) {
    await new Promise((resolver) => setTimeout(resolver, 500 * i));
    respuesta = await fetch(url, opciones);
  }
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const error = new Error(datos?.error || `Error ${respuesta.status}`);
    error.status = respuesta.status;
    error.code = datos?.code;
    throw error;
  }
  return datos;
}

// Tiempos de revalidación (ISR) en segundos
export const REVALIDAR = {
  catalogo: 3600, // categorías y fichas de libros: cambian poco
  masVendidos: 3600, // ranking de la landing
};

// ── AUTENTICACIÓN ─────────────────────────────────────────────────────────────

export const login = (email, password) =>
  peticion('/auth/login', {
    method: 'POST',
    headers: cabeceras(),
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

export const logout = (token) =>
  peticion('/auth/logout', {
    method: 'POST',
    headers: cabeceras(token),
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────

export const getCategorias = () =>
  peticion('/categories', { next: { revalidate: REVALIDAR.catalogo } });

// ── LIBROS ────────────────────────────────────────────────────────────────────

// Parámetros: category, year, max_price, type, search, page, limit
export const getLibros = (params = {}, opciones = { cache: 'no-store' }) =>
  peticion(`/books${queryString(params)}`, opciones);

export const getMasVendidos = () =>
  peticion('/books/bestsellers', { next: { revalidate: REVALIDAR.masVendidos } });

export const getLibroPorId = (id, opciones = { next: { revalidate: REVALIDAR.catalogo } }) =>
  peticion(`/books/${id}`, opciones);

// ── COMPRAS ───────────────────────────────────────────────────────────────────

export const getComprasUsuario = (idUsuario, token) =>
  peticion(`/users/${idUsuario}/purchases`, { headers: cabeceras(token), cache: 'no-store' });

export const crearCompra = (idLibro, idUsuario, token) =>
  peticion('/purchases', {
    method: 'POST',
    headers: cabeceras(token),
    body: JSON.stringify({ book_id: Number(idLibro), user_id: Number(idUsuario) }),
    cache: 'no-store',
  });

// ── ESPACIOS DE COWORKING ─────────────────────────────────────────────────────

// Parámetros: occupied (true/false), min_capacity. La ocupación cambia en tiempo
// real, así que nunca se cachea.
export const getEspacios = (params = {}) =>
  peticion(`/spaces${queryString(params)}`, { cache: 'no-store' });

// La API simulada solo tiene ejemplos de detalle para algunos IDs. Si el detalle
// no existe, se busca el espacio en el listado (que sí devuelve todos).
export async function getEspacioPorId(id) {
  try {
    return await peticion(`/spaces/${id}`, { cache: 'no-store' });
  } catch (error) {
    if (error.status !== 404) throw error;
    const espacios = await getEspacios();
    return espacios.find((e) => String(e.id) === String(id)) ?? null;
  }
}

// ── RESERVAS ──────────────────────────────────────────────────────────────────

export const getReservas = (params = {}, token) =>
  peticion(`/reservations${queryString(params)}`, { headers: cabeceras(token), cache: 'no-store' });

export const crearReserva = (datos, token) =>
  peticion('/reservations', {
    method: 'POST',
    headers: cabeceras(token),
    body: JSON.stringify(datos),
    cache: 'no-store',
  });
