// Server Component: logotipo de Nexus (marca + nombre). Puro marcado.
export default function Logo({ claro = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-500 to-nexus-800 text-base font-black text-white shadow-md shadow-nexus-600/30">
        N
      </span>
      <span className={`text-lg font-bold tracking-tight ${claro ? 'text-white' : 'text-tinta'}`}>
        Nexus<span className="text-acento">.</span>
      </span>
    </span>
  );
}
