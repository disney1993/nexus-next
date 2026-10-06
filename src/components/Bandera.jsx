// Banderas de los idiomas en SVG (los emojis de bandera no se ven en Windows).
// Componente sin estado ni eventos: se puede usar desde Server y Client Components.
// Inglés → Reino Unido.

const BANDERAS = {
  es: (
    <>
      <rect width="60" height="40" fill="#AA151B" />
      <rect y="10" width="60" height="20" fill="#F1BF00" />
    </>
  ),
  en: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="7" />
    </>
  ),
  fr: (
    <>
      <rect width="20" height="40" fill="#002654" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#CE1126" />
    </>
  ),
  it: (
    <>
      <rect width="20" height="40" fill="#009246" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#CE2B37" />
    </>
  ),
  de: (
    <>
      <rect width="60" height="40" fill="#000" />
      <rect y="13.33" width="60" height="13.34" fill="#DD0000" />
      <rect y="26.67" width="60" height="13.33" fill="#FFCE00" />
    </>
  ),
};

export default function Bandera({ idioma, className = 'h-4 w-6' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 40"
      preserveAspectRatio="xMidYMid slice"
      className={`shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10 ${className}`}
    >
      {BANDERAS[idioma]}
    </svg>
  );
}
