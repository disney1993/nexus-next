'use client';

// Client Component. Necesario porque:
//  - useActionState gestiona el estado del formulario (error, pendiente)
//  - useState controla los campos para poder rellenarlos con el botón
//    "Usar credenciales de prueba" (evento onClick)
//  - useSearchParams lee "?destino=" para volver a la ruta protegida tras el login
// El envío ejecuta la Server Action "iniciarSesion", que llama a la API simulada
// y guarda el token en una cookie httpOnly (el navegador nunca ve el token).

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { iniciarSesion } from '@/lib/acciones';
import { useIdioma } from '@/i18n/ProveedorIdioma';

const CREDENCIALES_DEMO = { email: 'ana.garcia@universidad.es', password: 'password123' };

export default function FormularioLogin() {
  const { idioma, dic, ruta } = useIdioma();
  const destino = useSearchParams().get('destino') ?? ruta('/');
  const [estado, accion, pendiente] = useActionState(iniciarSesion, null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function usarDemo() {
    setEmail(CREDENCIALES_DEMO.email);
    setPassword(CREDENCIALES_DEMO.password);
  }

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="destino" value={destino} />
      <input type="hidden" name="idioma" value={idioma} />
      <div>
        <label htmlFor="email" className="etiqueta">{dic.login.email}</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={dic.login.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="password" className="etiqueta">{dic.login.password}</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="campo"
        />
      </div>

      {estado?.error && (
        <p role="alert" className="animate-emerger rounded-lg border border-ocupado/20 bg-ocupado-suave px-3 py-2 text-center text-sm text-ocupado">
          {dic.login.errorCredenciales}
        </p>
      )}

      <button type="submit" className="btn-primario w-full" disabled={pendiente}>
        {pendiente && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {pendiente ? dic.login.entrando : dic.login.entrar}
      </button>

      <button
        type="button"
        onClick={usarDemo}
        className="group w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:border-nexus-300 hover:bg-nexus-50/50 hover:text-nexus-700"
      >
        🔑 {dic.login.demo}
        <span className="mt-0.5 block text-[11px] font-normal text-slate-400 group-hover:text-nexus-500">
          {CREDENCIALES_DEMO.email} / {CREDENCIALES_DEMO.password}
        </span>
      </button>
    </form>
  );
}
