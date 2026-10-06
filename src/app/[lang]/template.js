// template.js: igual que un layout, pero se vuelve a montar en cada navegación.
// Se aprovecha para animar la entrada de cada página con un fundido CSS.
// Importante: la animación es solo de OPACIDAD. Una animación de "transform"
// convertiría este contenedor en la referencia de los elementos position:fixed
// de su interior (el panel lateral de filtros en móvil), que pasarían a medir lo
// que mide toda la página en lugar de la pantalla y perderían el scroll.
export default function Plantilla({ children }) {
  return <div className="animate-aparecer">{children}</div>;
}
