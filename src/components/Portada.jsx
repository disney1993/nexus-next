'use client';

// Client Component. Necesario porque usa el evento onError de la imagen (los
// eventos del DOM solo existen en el navegador) y useState para cambiar a una
// imagen alternativa si la portada original no carga.

import { useState } from 'react';
import Image from 'next/image';

export default function Portada({ src, alt, semilla, className = '', sizes = '200px', priority = false }) {
  const alternativa = `https://picsum.photos/seed/${semilla}/300/420`;
  const [origen, setOrigen] = useState(src || alternativa);

  return (
    <Image
      src={origen}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setOrigen(alternativa)}
    />
  );
}
