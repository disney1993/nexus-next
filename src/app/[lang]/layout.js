import { Geist } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Pie from '@/components/Pie';
import { ProveedorIdioma } from '@/i18n/ProveedorIdioma';
import { IDIOMAS } from '@/i18n/config';
import { obtenerDiccionario, obtenerIdioma } from '@/i18n/servidor';
import '../globals.css';

// Layout raíz (Server Component) dentro del segmento dinámico [lang].
// Todas las rutas cuelgan de /{idioma}/… → /es/libreria, /en/libreria…
//  - generateStaticParams genera las páginas estáticas para los 5 idiomas
//  - <html lang> cambia según el idioma (accesibilidad y SEO)
//  - ProveedorIdioma pasa el diccionario a los Client Components
// No lee cookies, para que las páginas estáticas (SSG/ISR) sigan siéndolo.

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

export async function generateMetadata() {
  const dic = await obtenerDiccionario();
  return {
    title: { default: 'Nexus', template: '%s · Nexus' },
    description: dic.comun.lema,
  };
}

// Color de la barra del navegador en móvil
export const viewport = { themeColor: '#4f46e5' };

export default async function LayoutRaiz({ children }) {
  const [idioma, diccionario] = await Promise.all([obtenerIdioma(), obtenerDiccionario()]);

  return (
    <html lang={idioma} className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ProveedorIdioma idioma={idioma} diccionario={diccionario}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Pie />
        </ProveedorIdioma>
      </body>
    </html>
  );
}
