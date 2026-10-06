// loading.js: Next.js lo muestra automáticamente (con <Suspense>) mientras el
// Server Component de la página espera a la API simulada.
export default function CargandoLibreria() {
  return (
    <div aria-busy="true">
      <div className="esqueleto mb-8 h-9 w-72" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="esqueleto h-12 w-full lg:h-[32rem] lg:w-64" />
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="esqueleto aspect-[3/5]" />
          ))}
        </div>
      </div>
    </div>
  );
}
