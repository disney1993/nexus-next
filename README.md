# Nexus — Next.js con App Router

Migración a **Next.js 16 (App Router)** de la aplicación React de Nexus (Actividad 3 de
**Demo en Vercel:** https://nexus-next-beta.vercel.app

*Desarrollo Web Orientado a Componentes*). La app original era 100 % Client Components con
React Router; esta versión usa **Server Components por defecto**, **Client Components solo
donde hay interacción**, enrutado por **sistema de ficheros** y **Tailwind CSS**.

Los datos vienen de la **API simulada de Apidog** (Actividad 1):
`https://mock.apidog.com/m1/1255596-1252971-default`

## Ejecutar en local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción (muestra el tipo de renderizado de cada ruta)
npm start
```

Usuario de prueba: `ana.garcia@universidad.es` / `password123`

## Despliegue en Vercel

1. Subir esta carpeta (`nexus-next`) a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → *Add New… → Project* → importar el repositorio.
3. Framework: **Next.js** (se detecta solo). No hace falta ninguna variable de entorno.
4. *Deploy*. Vercel da la URL pública (`https://<proyecto>.vercel.app`).

Alternativa por terminal: `npx vercel` (y `npx vercel --prod` para producción).

## Rutas (generadas desde `src/app`)

Todas las rutas cuelgan del segmento dinámico **`[lang]`** (idioma): `/es/libreria`,
`/en/libreria`, `/fr/…`, `/it/…`, `/de/…`.

| URL | Fichero | Renderizado | Acceso |
|---|---|---|---|
| `/{lang}` | `app/[lang]/page.js` | **ISR** (`revalidate = 3600`), 1 página por idioma | Pública |
| `/{lang}/login` | `app/[lang]/login/page.js` | **SSG** (estática) | Pública |
| `/{lang}/libreria` | `app/[lang]/(servicios)/libreria/page.js` | **SSR** (lee `searchParams`) | Protegida |
| `/{lang}/libreria/[id]` | `app/[lang]/(servicios)/libreria/[id]/page.js` | **SSG + ISR** (`generateStaticParams` × idiomas) | Protegida |
| `/{lang}/mis-compras` | `app/[lang]/(servicios)/mis-compras/page.js` | **SSR** (lee cookies) | Protegida |
| `/{lang}/coworking` | `app/[lang]/(servicios)/coworking/page.js` | **SSR** sin caché | Protegida |
| `/{lang}/coworking/[id]` | `app/[lang]/(servicios)/coworking/[id]/page.js` | **SSR** + **CSR** (reservas) | Protegida |
| cualquier otra | `app/[lang]/[...resto]/page.js` → `not-found.js` | — | — |

- `[lang]` y `[id]` son **rutas dinámicas**; `[...resto]` es una ruta **catch-all**.
- `(servicios)` es un **grupo de rutas**: los paréntesis hacen que no aparezca en la URL.
- `layout.js` raíz está en `app/[lang]` (cambia `<html lang>` según el idioma) y
  `template.js` anima la entrada de cada página en cada navegación.
- `loading.js` (esqueletos de carga), `error.js` (errores de la API) y `not-found.js`
  (404) son ficheros especiales del App Router.
- `src/proxy.js` (antes *middleware*) añade el idioma a las URL que no lo llevan y
  protege las rutas privadas (sustituye al `<RutaProtegida>` de la app original).

El tipo de renderizado se puede comprobar en la salida de `npm run build`:
`○` estática, `●` SSG con `generateStaticParams`, `ƒ` dinámica (SSR), y la columna
*Revalidate* muestra las rutas ISR.

## Server Components vs Client Components

### Server Components (por defecto, sin `'use client'`)

| Componente | Por qué es de servidor |
|---|---|
| `app/layout.js` | Estructura HTML común (navbar, pie, fuente). No lee cookies para no volver dinámicas todas las rutas. |
| Todas las `page.js` | Piden los datos a la API **en el servidor** (`async/await`); el HTML llega ya pintado y el código de las peticiones no se envía al navegador. |
| `(servicios)/layout.js` | Contenedor común de las rutas protegidas. |
| `Navbar`, `Logo`, `Pie` | Marca, estructura y enlaces estáticos; la barra delega solo la parte interactiva. |
| `BotonGoogle` | Lee las variables de entorno de Auth0 en el servidor y decide si el botón está activo. |
| `TarjetaLibro` | Solo pinta props y navega con `<Link>`. |
| `TarjetaEspacio` | Pinta el estado del espacio. La ficha al pasar el ratón es **solo CSS** (`group-hover` de Tailwind), así que no necesita JS. |
| `MenuCategorias` | Menú desplegable con `<details>` nativo; cada categoría es un `<Link>` que cambia `?category=`. |
| `Paginacion` | Enlaces `<Link>` que cambian `?page=`. |
| `loading.js`, `not-found.js` | Contenido estático. |

### Client Components (`'use client'`)

| Componente | Por qué necesita el cliente |
|---|---|
| `NavegacionCliente` | `usePathname` (enlace activo), `useState` (menú móvil animado) y lectura de la cookie pública con `document.cookie`. |
| `SelectorIdioma` | Desplegable propio con banderas (`useState`, clic fuera y Escape con `useEffect`), guarda la cookie `NEXT_LOCALE` y navega con `useRouter` a la misma página en otro idioma. |
| `PanelLateral` | Panel deslizante de categorías/filtros en móvil y tablet: estado abierto/cerrado, tecla Escape, bloqueo del scroll. Recibe Server Components como `children`. |
| `ProveedorIdioma` | Context de React con el diccionario para que los Client Components traduzcan sus textos (`useIdioma()`). |
| `FormularioLogin` | `useActionState` (errores y estado pendiente), campos controlados que rellena el botón "credenciales de prueba" y `useSearchParams` (`?destino=`). |
| `FiltrosLibreria` | Controles con `onChange`, estado local, *debounce* y `useRouter` para escribir los filtros en la URL. |
| `FiltrosCoworking` | `onChange` + `useRouter`/`useSearchParams`. |
| `VistaRapidaLibro` | Eventos `onMouseEnter`/`onMouseLeave` y **petición a la API desde el navegador** (CSR) solo al pasar el ratón. |
| `Portada` | Evento `onError` de la imagen para usar una portada alternativa. |
| `BotonComprar` | `onClick` y `useTransition`; llama a la Server Action `comprarLibro`. |
| `FormularioReserva` | Campos controlados, validación instantánea y conversión de la fecha a la zona horaria del usuario; llama a `reservarEspacio`. |
| `ReservasEspacio` | Recibe la lista inicial del servidor y la **refresca desde el navegador cada 30 s** (`useEffect` + `setInterval`). |
| `ActualizarEspacios` | Temporizador y `router.refresh()` para actualizar el plano sin recargar la página. |
| `(servicios)/error.js` | Next.js exige que sea de cliente (Error Boundary con `reset()`). |

**Patrón clave:** los Client Components son "hojas" pequeñas dentro de Server Components
(p. ej. `TarjetaLibro` → `Portada` + `VistaRapidaLibro`), así se envía al navegador el
mínimo JavaScript posible.

### Server Actions (`src/lib/acciones.js`)

`iniciarSesion`, `cerrarSesion`, `comprarLibro` y `reservarEspacio` se ejecutan en el
servidor. Guardan el token en una cookie **httpOnly** (el JavaScript del navegador no lo
puede leer) y hacen las peticiones `POST` a la API simulada.

## Peticiones a la API simulada

Todas pasan por `src/lib/api.js`, que escribe una traza en la consola:

```
[API simulada · servidor] GET https://mock.apidog.com/m1/1255596-1252971-default/books/bestsellers
[API simulada · cliente]  GET https://mock.apidog.com/m1/1255596-1252971-default/books/2
```

- Las del **servidor** (SSR/SSG/ISR y Server Actions) aparecen en la terminal de
  `npm run dev` (o en *Logs* de Vercel).
- Las del **cliente** (vista rápida al pasar el ratón por un libro y refresco de reservas)
  aparecen en *DevTools → Network* filtrando por `apidog`.

## Internacionalización (i18n)

- Idiomas: **español, inglés, francés, italiano y alemán** (`src/i18n/config.js`).
- Diccionarios JSON en `src/i18n/diccionarios/` (mismas claves en los 5 idiomas).
- **Server Components**: `obtenerDiccionario()` / `obtenerIdioma()` (`src/i18n/servidor.js`)
  leen el idioma con `next/root-params`, sin pasarlo por props.
- **Client Components**: `useIdioma()` (Context de `ProveedorIdioma`).
- Fechas, horas y precios se formatean con `Intl` según el idioma (`src/lib/formato.js`).
- El proxy elige idioma por la cookie `NEXT_LOCALE` o la cabecera `Accept-Language`.
- Las páginas estáticas se generan para los 5 idiomas (`generateStaticParams` en el layout).
- Los datos de la API (títulos, descripciones) llegan en español.

## Login con Google (preparado)

La Actividad 1 usa el login de la API simulada. El sistema ya está preparado para
OAuth 2.0 con Google vía **Auth0** (Actividades 2/3):

- `BotonGoogle` aparece en el login; se activa solo cuando existen `AUTH0_DOMAIN` y
  `AUTH0_CLIENT_ID` (ver `.env.example`).
- `src/lib/auth/proveedores.js` explica los pasos (instalar `@auth0/nextjs-auth0`,
  crear el cliente, delegar `/auth/*` en el proxy y leer la sesión en `src/lib/sesion.js`).
- El proxy ya deja libres las rutas `/auth/*` y `/api/*`.

## Estilos y diseño

Tailwind CSS v4 (`src/app/globals.css`):

- Paleta como tokens en `@theme`: escala índigo `nexus-50…900`, `tinta`, `acento`,
  `libre`/`ocupado` → utilidades `bg-nexus-600`, `text-tinta`, `bg-libre-suave`…
- Clases reutilizables con `@apply`: `.btn-primario`, `.tarjeta`, `.campo`, `.insignia`,
  `.esqueleto` (carga con brillo animado), `.contenedor`.
- Animaciones sutiles solo con CSS: entrada escalonada de tarjetas, transición entre
  páginas (`template.js`), zoom de portadas, fichas emergentes, menú y panel deslizantes.
  Se desactivan si el sistema pide *reducir movimiento* (`prefers-reduced-motion`).
- **Responsive** comprobado a 375 px (móvil), 820 px (tablet) y 1280 px (escritorio),
  sin desbordamiento horizontal: menú hamburguesa y panel de filtros por debajo de 1024 px.

## Limitaciones conocidas de la API simulada

- Las respuestas de `POST /purchases` y `POST /reservations` son siempre el mismo ejemplo
  y no se guardan. Para que la compra se vea en *Mis compras*, las compras de la sesión se
  recuerdan en una cookie (`nexus_compras_sesion`). En las próximas actividades se
  sustituirá por PostgreSQL.
- `GET /spaces/{id}` solo tiene respuesta de detalle para algunos ids; si devuelve 404,
  el espacio se busca en `GET /spaces` (`getEspacioPorId` en `src/lib/api.js`).
