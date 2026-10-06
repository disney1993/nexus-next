// Esqueleto del detalle de un espacio. Además, al existir loading.js, el
// prefetch de los <Link> del plano solo descarga este esqueleto y no ejecuta
// la página completa (que consulta la API) para cada espacio visible.
export default function CargandoEspacio() {
  return (
    <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-8">
      <div className="space-y-6">
        <div className="esqueleto aspect-[16/10]" />
        <div className="esqueleto h-40" />
      </div>
      <div className="space-y-6">
        <div className="esqueleto h-72" />
        <div className="esqueleto h-56" />
      </div>
    </div>
  );
}
