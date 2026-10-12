# Catálogos Pro

Plataforma de catálogos para negocios: cada cliente tiene su propio catálogo
(`tusitio.com/nombre-del-negocio`) con su diseño, productos, fotos y textos,
y recibe pedidos por WhatsApp. El primer catálogo es **Creaciones LisArt** (`/`).

## Cómo funciona

La página principal (`/`) es el **portafolio** del dueño de la plataforma (estilo editorial,
editable en `/super` → *Mi portafolio*). Cada catálogo vive en `/nombre-del-negocio`.

| Quién | Dónde entra | Qué puede hacer |
|---|---|---|
| Visitantes | `/` o `/nombre` | Ver el catálogo y pedir por WhatsApp |
| Dueño de un catálogo | `/admin` → su catálogo | Editar productos, fotos, textos, colores y datos de su negocio |
| Super administrador | `/admin` → `/super` | Crear catálogos y cuentas de clientes, suspender/activar, editar cualquier catálogo |

Todo se guarda en Firestore y se sincroniza **en tiempo real**: lo que se edita
en un dispositivo aparece al instante en todos los demás.

## Estructura del código

```
api/              Funciones de servidor en Vercel (sin dependencias): cambiar contraseñas y crear cuentas
src/
  app/            Punto de entrada y rutas (/, /admin, /super, /:negocio)
  config/         Configuración de la plataforma (nombre, super admin, catálogo por defecto)
  lib/            Utilidades sin estado: Firebase, Cloudinary, formatos, imágenes
  services/       ÚNICO lugar que habla con la base de datos (repo + un servicio por entidad)
  features/
    auth/         Sesión, roles y página de inicio de sesión
    tenant/       Datos del negocio, temas (colores/fuentes) y plantillas de contenido
    catalog/      El catálogo público: secciones, productos, diseños de fotos
    cart/         Pedido y envío por WhatsApp
    editor/       Edición en línea + panel del dueño (Mi negocio, Productos, Diseño, Textos)
    superadmin/   Panel del super administrador (clientes, solicitudes y editor del portafolio)
    portfolio/    Página principal: portafolio editorial con animaciones
    platform/     Páginas propias de la plataforma
  shared/ui/      Componentes visuales reutilizables
  styles/         Estilos globales y tokens de diseño
```

Base de datos:

```
tenants/{negocio}                  datos del negocio (nombre, logo, tema, WhatsApp, estado)
tenants/{negocio}/products/{id}    productos
tenants/{negocio}/settings/home    secciones, estilos de fotos, textos editados, anuncio
users/{uid}                        rol (superadmin | owner) y negocio asignado
tickets/{id}                       solicitudes de ayuda (olvidé mi contraseña)
platform/portfolio                 contenido del portafolio (página principal)
```

Plantillas para clientes (al crear un catálogo): Regalos, Tienda general, Editorial (boutique),
Moda urbana, Tecnología (modo oscuro) y Tienda minimal. Cada una trae sus secciones, textos y
colores; el cliente puede cambiar todo después desde su panel.

## Puesta en marcha (una sola vez)

1. **Firebase → Authentication → Método de acceso**: activa *Correo/contraseña* y *Google*.
   En *Configuración → Dominios autorizados* agrega tu dominio de Vercel.
2. **Firebase → Firestore → Reglas**: pega el contenido de `firestore.rules` y publica.
3. **Variables de entorno**: copia `.env.example` como `.env` (local) y crea las mismas
   variables en **Vercel → Settings → Environment Variables**. Vuelve a desplegar.
4. **Cuenta de servicio (para cambiar contraseñas)**: Firebase → Configuración del proyecto →
   *Cuentas de servicio* → *Generar nueva clave privada*. Copia todo el contenido del JSON en la
   variable `FIREBASE_SERVICE_ACCOUNT` de Vercel (es secreta: no lleva `VITE_` y no va en `.env` del navegador).
5. Entra a `/admin` con Google usando el correo de super administrador
   (o crea la cuenta con *“Primera vez: crear cuenta de administrador”* y verifica el correo).
6. En `/super` usa **“Activa el catálogo de LisArt”**: copia los productos, estilos y
   textos de la versión anterior a `/lisart` (hazlo desde el dispositivo donde está el logo).
7. Desde ahí, **“Crear catálogo para un cliente”** para cada cliente nuevo.

## Contraseñas y solicitudes

- **Olvidé mi contraseña** (dueños de catálogo): no se envía un correo automático; se crea una
  *solicitud* que aparece en `/super` → *Solicitudes* (con contador también en la pestaña del navegador).
  Desde ahí asignas una contraseña nueva y se la envías por WhatsApp.
- **Cambiar contraseña** de cualquier cliente: botón *Contraseña* en su tarjeta. Al cambiarla se
  cierran sus sesiones abiertas en todos los dispositivos.
- Esto usa la función de servidor `api/admin/set-password.js` (Vercel), que verifica que quien
  la llama sea el super administrador. En local también funciona con `npm run dev` si `.env.local`
  tiene `FIREBASE_SERVICE_ACCOUNT_FILE` apuntando al archivo .json de la llave.
- El super administrador recupera su propia contraseña por correo (enlace de Firebase).

## El plus de cada catálogo

**Panel → 📊 Cuentas** (privado, solo el dueño):

- **Resumen del mes:** vendido, ganancia y margen, número de ventas, ticket promedio, ventas por día, lo más vendido y una lista de «para hacer hoy».
- **Costos y ganancia:** el costo de cada producto (materiales, mano de obra, empaque, otros) da la ganancia, el margen y el precio sugerido según el % de ganancia deseado.
- **Ventas:** se anotan a mano o pegando el pedido que llegó por WhatsApp. Pueden descontar el inventario.
- **Cotizaciones:** numeradas (COT-0001), con logo; se envían por WhatsApp, se guardan en PDF y se pasan a venta.

**Panel → 🚀 Vender más** (estrategias de venta con datos reales):

- **Meta de compra:** «Te faltan $X para envío gratis / % de descuento / regalo», con hasta 3 niveles.
- **Ofertas con cuenta regresiva:** precio antes/ahora con fecha de fin.
- **Pocas unidades:** «¡Quedan 3!» según el inventario; con 0 aparece «Agotado».
- **Compara y elige (precio ancla):** 3 opciones con «El más elegido».
- **Combos con ahorro**, **Lleva también / Completa tu pedido** y **Opiniones de clientes**.

Datos privados en Firestore: `tenants/{negocio}/private/business`, `sales`, `quotes` (ver `firestore.rules`).

## Cobros a tus clientes

Panel **/super → Cobros**. Cada catálogo tiene su propio plan (lo eliges al crearlo y lo cambias con «Plan»):

- **Mensualidad**: un valor fijo cada mes.
- **Creación + mantenimiento**: un pago único de creación (se cobra en el primer pago) y luego una cuota mensual de mantenimiento.
- Puedes poner un **precio especial** por cliente, dar días de **prueba gratis** y descuento por pago anual.

Vencimientos: el dueño ve un aviso en su catálogo **5 días antes**; después del vencimiento tiene **5 días de gracia** y luego el catálogo se **pausa** solo (los visitantes ven «no disponible»). Al registrar o recibir el pago se reactiva automáticamente. Los días se cambian en «Cobros → Precios y reglas».

Formas de pago:

1. **Transferencia / Nequi** (siempre disponible): el cliente ve tus datos en *Panel → Mi plan* y te envía el comprobante por WhatsApp; tú lo registras con «Registrar pago».
2. **En línea con Wompi** (tarjeta, PSE, Nequi, Bancolombia):
   1. Crea tu cuenta en wompi.co y entra a *Desarrolladores*.
   2. En Vercel agrega `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET` y `WOMPI_EVENTS_SECRET` (Production) y vuelve a desplegar.
   3. En Wompi pon la *URL de eventos*: `https://TU-DOMINIO/api/billing/webhook`.
   4. En *Cobros → Precios y reglas* activa «Pago en línea con Wompi».
   Prueba primero con las llaves `pub_test_…` (tarjeta de prueba 4242 4242 4242 4242).

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run lint
```

Modo demo (solo desarrollo, sin tocar la base real): define `window.__DEMO__ = { docs: {...}, user: {...} }`
antes de cargar la app. Ver `src/services/demo.js`.

## Seguridad

- `.env` **no** debe estar en GitHub (está en `.gitignore`). Si alguna vez se subió,
  sácalo del repositorio (`git rm --cached .env`) y cambia las claves expuestas.
- Los permisos reales los aplica `firestore.rules`; el correo del super administrador
  debe coincidir en las reglas y en `VITE_SUPERADMIN_EMAILS`.
