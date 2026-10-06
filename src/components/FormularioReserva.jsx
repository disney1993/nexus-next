'use client';

// Client Component: formulario de reserva de un espacio.
// Necesita el cliente porque:
//  - los campos son controlados (useState) y se validan al instante (fin > inicio)
//  - convierte la fecha local del navegador (datetime-local) a ISO con la zona
//    horaria del USUARIO; en el servidor (UTC) la hora saldría desplazada
//  - muestra el estado de envío con useTransition
// La reserva la crea la Server Action "reservarEspacio" (POST /reservations).

import { useState, useTransition } from 'react';
import { reservarEspacio } from '@/lib/acciones';
import { formatearFechaHora } from '@/lib/formato';
import { t } from '@/i18n/config';
import { useIdioma } from '@/i18n/ProveedorIdioma';

export default function FormularioReserva({ idEspacio, nombreEspacio }) {
  const { idioma, dic } = useIdioma();
  const textos = dic.espacio;
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [resultado, setResultado] = useState(null);
  const [pendiente, startTransition] = useTransition();

  const rangoInvalido = inicio && fin && new Date(fin) <= new Date(inicio);

  function enviar(evento) {
    evento.preventDefault();
    if (rangoInvalido) return;
    const datos = { idEspacio, inicio: new Date(inicio).toISOString(), fin: new Date(fin).toISOString() };
    setResultado(null);
    startTransition(async () => {
      const respuesta = await reservarEspacio(datos);
      if (respuesta.ok) {
        setResultado({
          ok: true,
          mensaje: t(textos.reservaOk, {
            espacio: nombreEspacio,
            inicio: formatearFechaHora(datos.inicio, idioma),
            fin: formatearFechaHora(datos.fin, idioma),
          }),
        });
        setInicio('');
        setFin('');
      } else {
        const mensajes = { sesion: dic.errores.sesionCaducada, rango: textos.rangoInvalido };
        setResultado({ ok: false, mensaje: mensajes[respuesta.codigo] ?? textos.reservaError });
      }
    });
  }

  return (
    <section className="tarjeta p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nexus-50 text-lg">📅</span>
        <div>
          <h2 className="text-lg font-semibold text-tinta">{textos.reservar}</h2>
          <p className="text-xs text-slate-500">{textos.sinPago}</p>
        </div>
      </div>

      <form onSubmit={enviar} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reserva-inicio" className="etiqueta">{textos.inicio}</label>
            <input
              id="reserva-inicio"
              type="datetime-local"
              required
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label htmlFor="reserva-fin" className="etiqueta">{textos.fin}</label>
            <input
              id="reserva-fin"
              type="datetime-local"
              required
              min={inicio || undefined}
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className={`campo ${rangoInvalido ? 'border-ocupado focus:border-ocupado focus:ring-ocupado/15' : ''}`}
            />
          </div>
        </div>

        {rangoInvalido && <p className="animate-emerger text-sm text-ocupado">{textos.rangoInvalido}</p>}

        {resultado && (
          <p
            role="status"
            className={`flex animate-emerger items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
              resultado.ok ? 'border-libre/20 bg-libre-suave text-libre' : 'border-ocupado/20 bg-ocupado-suave text-ocupado'
            }`}
          >
            <span aria-hidden>{resultado.ok ? '✓' : '!'}</span>
            {resultado.mensaje}
          </p>
        )}

        <button type="submit" disabled={pendiente || rangoInvalido} className="btn-primario w-full sm:w-auto sm:px-8">
          {pendiente && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {pendiente ? textos.reservando : textos.confirmar}
        </button>
      </form>
    </section>
  );
}
