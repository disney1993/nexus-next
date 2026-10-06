import { notFound } from 'next/navigation';

// Ruta "catch-all" [...resto]: captura cualquier URL que no coincida con otra
// ruta (p. ej. /es/no-existe) y muestra el not-found.js del idioma.
// Es necesaria porque el layout raíz está dentro de [lang].
export default function RutaDesconocida() {
  notFound();
}
