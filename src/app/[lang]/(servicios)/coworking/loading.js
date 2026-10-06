// Esqueleto que Next.js muestra mientras el Server Component consulta la API
export default function CargandoCoworking() {
  return (
    <div aria-busy="true">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row">
        <div className="esqueleto h-9 w-80" />
        <div className="esqueleto h-24 w-full sm:w-80" />
      </div>
      <div className="esqueleto mb-6 h-20 w-full" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="esqueleto h-72" />
        ))}
      </div>
    </div>
  );
}
