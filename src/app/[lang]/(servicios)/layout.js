// Layout del grupo de rutas "(servicios)" (Server Component).
// Los paréntesis hacen que el nombre de la carpeta NO forme parte de la URL:
// agrupa /libreria, /mis-compras y /coworking (las rutas protegidas por el
// proxy) bajo un contenedor común sin cambiar sus direcciones.
export default function LayoutServicios({ children }) {
  return <div className="contenedor py-8 sm:py-10">{children}</div>;
}
