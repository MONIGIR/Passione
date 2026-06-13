# Documentación Técnica — Backend Passione E-Commerce

> **Tipo:** Auditoría de código / Manual de onboarding técnico  
> **Fecha de generación:** 2026-06-12  
> **Alcance:** Todos los archivos fuente en `/backend` (excluye `node_modules`)  
> **Stack:** Node.js · Express 5 · MongoDB / Mongoose 9 · JWT · bcryptjs

---

## Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [package.json — Dependencias y Scripts](#2-packagejson--dependencias-y-scripts)
3. [Variables de Entorno — .env](#3-variables-de-entorno--env)
4. [Punto de Entrada — server.js](#4-punto-de-entrada--serverjs)
5. [Configuración de Base de Datos — config/db.js](#5-configuración-de-base-de-datos--configdbjs)
6. [Middleware](#6-middleware)
   - 6.1 [authMiddleware.js](#61-authmiddlewarejs)
   - 6.2 [errorHandler.js](#62-errorhandlerjs)
7. [Modelos Mongoose](#7-modelos-mongoose)
   - 7.1 [models/Usuario.js](#71-modelsusuariojs)
   - 7.2 [models/Producto.js](#72-modelsproductojs)
   - 7.3 [models/Orden.js](#73-modelsordenjs)
8. [Controladores](#8-controladores)
   - 8.1 [controllers/authController.js](#81-controllersauthcontrollerjs)
   - 8.2 [controllers/usuarioController.js](#82-controllersusuariocontrollerjs)
   - 8.3 [controllers/productoController.js](#83-controllersproductocontrollerjs)
   - 8.4 [controllers/ordenController.js](#84-controllersordencontrollerjs)
9. [Rutas](#9-rutas)
   - 9.1 [routes/authRoutes.js](#91-routesauthroutesjs)
   - 9.2 [routes/usuarioRoutes.js](#92-routesusuarioroutesjs)
   - 9.3 [routes/productoRoutes.js](#93-routesproductoroutesjs)
   - 9.4 [routes/ordenRoutes.js](#94-routesordensroutesjs)
10. [Flujo de Datos End-to-End](#10-flujo-de-datos-end-to-end)
11. [Mapa de Seguridad](#11-mapa-de-seguridad)
12. [Casos Límite y Riesgos Detectados](#12-casos-límite-y-riesgos-detectados)

---

## 1. Arquitectura General

```
backend/
├── server.js                  ← Punto de entrada. Configura Express, CORS, rutas y arranca el servidor.
├── .env                       ← Variables de entorno (nunca comittear en producción)
├── package.json               ← Dependencias y scripts npm
│
├── config/
│   └── db.js                  ← Función connectDB() — establece conexión Mongoose con MongoDB Atlas
│
├── middleware/
│   ├── authMiddleware.js      ← protect() y soloAdmin() — guardianes de rutas
│   └── errorHandler.js        ← notFound() y errorHandler() — manejo centralizado de errores
│
├── models/
│   ├── Usuario.js             ← Schema de usuario con hash de contraseña y comparación
│   ├── Producto.js            ← Schema de producto con virtuals (stockBajo, valorTotal, precioFinal)
│   └── Orden.js               ← Schema de orden con snapshot de precios y estado de entrega
│
├── controllers/
│   ├── authController.js      ← registro, login, logout, getMe, actualizarPerfil
│   ├── usuarioController.js   ← CRUD de usuarios + obtenerStats (dashboard)
│   ├── productoController.js  ← CRUD de productos + reportes de inventario
│   └── ordenController.js     ← Checkout atómico, listado admin, cambio de estado
│
└── routes/
    ├── authRoutes.js          ← /api/auth/*
    ├── usuarioRoutes.js       ← /api/usuarios/* (todo requiere protect + soloAdmin)
    ├── productoRoutes.js      ← /api/productos/* (GET público, escritura requiere admin)
    └── ordenRoutes.js         ← /api/ordenes/*
```

### Patrón arquitectónico

El backend sigue el patrón **MVC desacoplado** (Model-View-Controller) donde:

- **Model**: Mongoose Schemas en `/models` — definen estructura, validaciones y lógica de negocio de datos.
- **Controller**: Funciones en `/controllers` — contienen la lógica de cada endpoint, orquestan queries a la DB y construyen respuestas.
- **Route**: Archivos en `/routes` — mapean verbos HTTP + path a controllers, e intercalan middleware de autenticación/autorización.
- **View**: No existe (API REST pura — devuelve JSON).

### Convención de respuesta JSON

Todas las respuestas siguen el mismo contrato:

```json
{
  "exito": true | false,
  "mensaje": "string (opcional, para errores o confirmaciones)",
  "datos": { ... } | [ ... ],
  "conteo": number,
  "total": number,
  "paginas": number,
  "paginaActual": number,
  "stack": "string | null (solo en desarrollo para errores)"
}
```

---

## 2. package.json — Dependencias y Scripts

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev":   "nodemon server.js",
    "seed":  "node seed.js"
  }
}
```

### `"type": "module"`

Activa **ES Modules (ESM)** nativos de Node.js en todo el proyecto. Esto significa:
- Se usa `import`/`export` en lugar de `require`/`module.exports`.
- Todos los archivos `.js` se tratan como módulos ESM automáticamente.
- Los imports **deben incluir la extensión** `.js` (ej: `import X from './X.js'`).
- `__dirname` y `__filename` no existen — se usan `import.meta.url` y `path.dirname`.

### Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start` | `node server.js` | Producción — inicia el servidor sin reloading automático |
| `dev` | `nodemon server.js` | Desarrollo — reinicia el servidor al detectar cambios en archivos `.js` |
| `seed` | `node seed.js` | Popula la base de datos con datos iniciales (script externo no documentado aquí) |

### Dependencias de producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `express` | ^5.2.1 | Framework web HTTP. La v5 añade soporte nativo para async/await en handlers sin necesidad de `try/catch` en algunos casos, aunque el proyecto lo usa explícitamente |
| `mongoose` | ^9.7.0 | ODM (Object Document Mapper) para MongoDB. Versión 9 cambia el comportamiento de hooks `pre('save')` — los async NO reciben `next` |
| `bcryptjs` | ^3.0.3 | Hash y comparación de contraseñas. Implementación JS pura (sin binarios nativos), más portable que `bcrypt` |
| `jsonwebtoken` | ^9.0.3 | Firma y verificación de JSON Web Tokens (JWT) para autenticación stateless |
| `cookie-parser` | ^1.4.7 | Middleware que parsea la cabecera `Cookie` y expone las cookies en `req.cookies` |
| `cors` | ^2.8.6 | Middleware para configurar CORS (Cross-Origin Resource Sharing) — permite o restringe peticiones desde otros orígenes |
| `dotenv` | ^17.4.2 | Carga variables de entorno desde `.env` al proceso de Node.js (`process.env`) |
| `express-validator` | ^7.3.2 | Middleware de validación declarativa para los cuerpos de petición HTTP |
| `morgan` | ^1.11.0 | Logger de peticiones HTTP para desarrollo — imprime método, URL, status y tiempo de respuesta |

### Dependencias de desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `nodemon` | ^3.1.14 | Observa cambios en el sistema de archivos y reinicia Node.js automáticamente |

---

## 3. Variables de Entorno — .env

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5174
MONGODB_URI=mongodb+srv://nigga:nigga@passione.xnsqyzd.mongodb.net/productos?appName=Passione
JWT_SECRET=passione_super_secret_key_cambiar_en_produccion
JWT_EXPIRES_IN=7d
```

### Análisis campo por campo

| Variable | Valor actual | Descripción técnica | Riesgo |
|----------|-------------|---------------------|--------|
| `PORT` | `5000` | Puerto TCP donde escucha el servidor HTTP | Bajo |
| `NODE_ENV` | `development` | Controla comportamiento condicional: stack traces en errores, todos los orígenes CORS aceptados, cookies sin `secure` | **Crítico en producción** — debe ser `production` |
| `CLIENT_URL` | `http://localhost:5174` | URL del frontend para CORS en producción (en dev se ignora, se acepta todo) | Bajo |
| `MONGODB_URI` | Atlas URI con credenciales embebidas | Cadena de conexión completa a MongoDB Atlas incluyendo usuario, contraseña, host del cluster y nombre de la base de datos | **ALTO** — credenciales expuestas en texto plano |
| `JWT_SECRET` | `passione_super_secret_key_...` | Llave simétrica usada para firmar y verificar JWTs con algoritmo HS256 | **ALTO** — debe ser reemplazada por una cadena aleatoria de 64+ caracteres antes de producción |
| `JWT_EXPIRES_IN` | `7d` | Tiempo de vida del JWT. `7d` = 7 días. Mongoose usa este valor en `jwt.sign()` | Medio — evaluar si 7 días es aceptable según el modelo de seguridad |

### Cómo se cargan

En `server.js`, la primera línea efectiva es `dotenv.config()`, que lee el archivo `.env` en el directorio de trabajo actual y carga cada par `KEY=VALUE` en `process.env`. Cualquier variable ya existente en el entorno del sistema **no es sobreescrita**.

---

## 4. Punto de Entrada — server.js

```js
import express      from "express";
import dotenv       from "dotenv";
import cors         from "cors";
import cookieParser from "cookie-parser";
import morgan       from "morgan";
import connectDB    from "./config/db.js";
import productoRoutes from "./routes/productoRoutes.js";
import authRoutes     from "./routes/authRoutes.js";
import usuarioRoutes  from "./routes/usuarioRoutes.js";
import ordenRoutes    from "./routes/ordenRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;
```

### Bloque 1 — Importaciones

Los imports ESM cargan los módulos en el orden declarado. Los módulos de terceros (`express`, `cors`, etc.) se cargan desde `node_modules`. Los módulos propios usan rutas relativas con `.js` explícito.

- `dotenv` se importa al inicio para que `process.env` esté disponible cuando `connectDB()` lo necesite.
- `connectDB` es la función que inicia la conexión a MongoDB — si falla, llama a `process.exit(1)`.

---

### Bloque 2 — Lógica de CORS dinámica

```js
const corsOrigin =
  process.env.NODE_ENV === "development"
    ? (origin, cb) => cb(null, true)
    : process.env.CLIENT_URL;
```

Este bloque implementa una **política de CORS bifurcada** según el entorno:

**En desarrollo (`NODE_ENV=development`):**
- `corsOrigin` es una **función callback** que siempre llama `cb(null, true)`.
- `cors` acepta esta función como `origin` y la invoca para cada petición, pasando el origen de la petición.
- Al llamar `cb(null, true)`, acepta **cualquier origen** — incluyendo peticiones sin origen (Postman, curl).
- Esto soluciona el problema histórico de que Vite cambia de puerto (5173, 5174, etc.).

**En producción:**
- `corsOrigin` es un string (`process.env.CLIENT_URL`), p. ej. `https://passione.com`.
- `cors` compara el header `Origin` de cada petición contra este string exacto.
- Cualquier otro origen recibe una respuesta sin `Access-Control-Allow-Origin` y el navegador bloquea la petición.

```js
app.use(cors({ origin: corsOrigin, credentials: true }));
```

- `credentials: true`: necesario para que el navegador envíe cookies en peticiones cross-origin.
- Sin esta opción, `withCredentials: true` en el frontend no funcionaría.

---

### Bloque 3 — Middleware global de Express

```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
```

Los middleware se registran en orden y se ejecutan en cadena (pipeline) para cada petición:

1. **`express.json()`** — Parsea el cuerpo de la petición cuando `Content-Type: application/json`. Popula `req.body` con el objeto JavaScript deserializado. Límite por defecto: 100kb.

2. **`express.urlencoded({ extended: true })`** — Parsea cuerpos con `Content-Type: application/x-www-form-urlencoded` (formularios HTML). `extended: true` permite valores anidados usando la librería `qs`.

3. **`cookieParser()`** — Parsea la cabecera `Cookie` de la petición y expone el resultado en `req.cookies` (objeto plano) y `req.signedCookies` (cookies firmadas, si se usa secret). Sin este middleware, `req.cookies` estaría `undefined` y `protect()` fallaría silenciosamente.

```js
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
```

4. **`morgan("dev")`** — Solo activo en desarrollo. Formato `dev` imprime: `METHOD URL STATUS - RESPONSE_TIME ms`. Se desactiva en producción para no emitir logs de cada petición a stdout.

---

### Bloque 4 — Ruta raíz de diagnóstico

```js
app.get("/", (req, res) => {
  res.json({
    mensaje: "API Passione E-Commerce",
    version: "2.0.0",
    endpoints: { auth: "/api/auth", productos: "/api/productos" },
  });
});
```

Endpoint de health-check sin autenticación. Útil para verificar que el servidor está arriba. No devuelve información sensible.

---

### Bloque 5 — Montaje de routers

```js
app.use("/api/auth",     authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/ordenes",  ordenRoutes);
app.use("/api/productos", productoRoutes);
```

Cada `app.use(prefix, router)` monta un sub-router en el prefijo dado. Express quitará el prefijo antes de pasarle la petición al router, por lo que dentro de `authRoutes.js` las rutas se definen como `/registro` (no `/api/auth/registro`).

**Orden de montaje relevante:** `ordenRoutes` se monta antes de `productoRoutes`. No hay colisión porque tienen prefijos distintos.

---

### Bloque 6 — Middleware de error (debe ir al final)

```js
app.use(notFound);
app.use(errorHandler);
```

**Crucial: estos dos deben ser los últimos `app.use()`.**

- `notFound` captura cualquier petición que no haya sido manejada por ningún router previo. Genera un error 404 y lo pasa a `next(error)`.
- `errorHandler` es el **error handler centralizado** de Express. Se reconoce como tal porque tiene **4 parámetros** `(err, req, res, next)`. Express lo invoca automáticamente cuando cualquier handler anterior llama `next(error)` o lanza una excepción en código async.

---

### Bloque 7 — Inicio del servidor

```js
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
```

`app.listen()` crea un servidor HTTP nativo de Node.js y comienza a aceptar conexiones TCP en el puerto indicado. El callback se ejecuta una sola vez cuando el servidor está listo.

---

## 5. Configuración de Base de Datos — config/db.js

```js
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

### `dns.setServers(["8.8.8.8", "8.8.4.4"])`

Fuerza al resolver DNS de Node.js a usar los servidores públicos de Google en lugar del resolver del sistema operativo. Esto es un **workaround** para entornos donde el DNS local no resuelve correctamente los dominios de MongoDB Atlas (`*.mongodb.net`), que puede ocurrir en:
- Redes corporativas con DNS restrictivos.
- Algunos routers domésticos con DNS cache defectuoso.
- Entornos de desarrollo en Windows con resolución inconsistente.

**Efecto secundario:** todas las resoluciones DNS del proceso de Node.js usarán Google DNS, no solo las de MongoDB.

### `mongoose.connect(process.env.MONGODB_URI)`

Inicia la conexión al cluster de MongoDB Atlas usando la URI definida en `.env`. La URI sigue el formato:
```
mongodb+srv://usuario:contraseña@cluster.host/baseDatos?opciones
```

- `mongodb+srv://` — protocolo SRV, permite que MongoDB resuelva automáticamente los hosts del replica set desde DNS.
- El esquema `?appName=Passione` añade un nombre de aplicación visible en los logs de Atlas.
- Mongoose 9 usa por defecto `useNewUrlParser: true` y `useUnifiedTopology: true` — ya no hace falta pasarlos explícitamente.

`mongoose.connect()` devuelve una promesa que resuelve con el objeto `Mongoose`, que tiene una propiedad `connection` con información de la conexión activa (`host`, `port`, `name`, etc.).

### Manejo de error fatal

```js
process.exit(1)
```

Si la conexión falla, el proceso termina con código de salida `1` (error). Esto es correcto para un servidor web: no tiene sentido servir peticiones si no hay base de datos. El gestor de procesos (PM2, systemd, Docker) detectará el exit code y puede reiniciar el proceso automáticamente.

---

## 6. Middleware

### 6.1 authMiddleware.js

Este archivo exporta **dos middleware** que trabajan en cascada para proteger rutas.

---

#### `protect` — Verificación de JWT

```js
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    return next(new Error("No autorizado: token ausente"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = await Usuario.findById(decoded.id).select("-password");

    if (!req.usuario || !req.usuario.activo) {
      res.status(401);
      return next(new Error("No autorizado: usuario inválido o inactivo"));
    }

    next();
  } catch {
    res.status(401);
    next(new Error("No autorizado: token inválido o expirado"));
  }
};
```

**Flujo de ejecución paso a paso:**

1. **Lectura del token:** `req.cookies?.token` — usa optional chaining por si `cookie-parser` no está activo o la cookie no existe. Si no hay token, se establece el status 401 y se llama `next(error)`, lo que salta directamente al `errorHandler`. El `return` evita que el código continúe.

2. **Verificación criptográfica:** `jwt.verify(token, process.env.JWT_SECRET)` — decodifica el token JWT y verifica la firma HMAC-SHA256. Si el token fue alterado, expiró, o la firma no coincide, lanza `JsonWebTokenError` o `TokenExpiredError`. El `catch` los captura todos.

3. **Decodificación del payload:** Si la verificación es exitosa, `decoded` contiene el payload del JWT. En este sistema, el payload es `{ id: usuario._id, iat: timestamp, exp: timestamp }`.

4. **Hidratación del usuario:** `Usuario.findById(decoded.id).select("-password")` — busca al usuario en MongoDB usando el `_id` extraído del JWT. `.select("-password")` excluye el campo `password` del resultado (aunque ya tiene `select: false` en el schema, es una doble garantía explícita). El usuario resultante se adjunta a `req.usuario` para que esté disponible en el handler y en los middleware subsiguientes.

5. **Validación de estado:** Se verifica tanto que el usuario existe como que está activo. Esto permite **invalidar sesiones sin manejar una blacklist de tokens**: si un admin desactiva un usuario (`activo: false`), en la siguiente petición el middleware rechaza el JWT aunque siga siendo criptográficamente válido.

6. **Paso al siguiente middleware:** Si todo es válido, `next()` sin argumentos pasa el control al siguiente middleware o handler de la ruta.

**Dato de rendimiento:** Cada petición protegida hace una query a MongoDB para hidratar el usuario. Esto garantiza datos frescos pero tiene un coste de latencia. Una alternativa sería confiar 100% en el payload del JWT (sin query), pero se pierde la capacidad de invalidación en tiempo real.

---

#### `soloAdmin` — Autorización por Rol

```js
export const soloAdmin = (req, res, next) => {
  if (req.usuario?.role !== "admin") {
    res.status(403);
    return next(new Error("Prohibido: se requiere rol de administrador"));
  }
  next();
};
```

**Importante:** Este middleware es **sincrónico** (no `async`) porque no hace I/O — solo lee una propiedad que ya está en memoria gracias a `protect`.

- `req.usuario?.role` — optional chaining por si por error se usa `soloAdmin` sin `protect` antes. Sin el `?.`, si `req.usuario` es `undefined`, lanzaría un `TypeError` que llegaría al error handler de forma inesperada.
- **403 vs 401:** 401 (Unauthorized) significa "no estás autenticado". 403 (Forbidden) significa "estás autenticado pero no tienes permisos". La distinción es semánticamente correcta aquí.
- **Siempre debe ir después de `protect`** en la cadena de middleware.

---

### 6.2 errorHandler.js

```js
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    exito: false,
    mensaje: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
```

#### `notFound`

Captura rutas que no coinciden con ningún router registrado. Express pasa la petición a través de todos los `app.use()` en orden; si ninguno responde, llega aquí. Al llamar `next(error)`, delega al `errorHandler`.

`req.originalUrl` contiene el path completo original de la petición (incluyendo query string), útil para logs y depuración.

#### `errorHandler`

**Firma de 4 parámetros `(err, req, res, next)`:** Express detecta que este middleware es un error handler por tener exactamente 4 parámetros. Si tuviera 3, se trataría como un middleware normal y los errores nunca llegarían.

**Lógica del `statusCode`:**

```js
const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
```

Express inicializa `res.statusCode` en `200` por defecto. En los controllers, antes de llamar `next(new Error(...))`, se establece manualmente el status deseado:
```js
res.status(400);
return next(new Error("El email ya está registrado"));
```
Si el código llegó al error handler y el status sigue siendo `200`, significa que el error no fue anticipado (un bug genuino), por lo que se convierte en `500`.

**`stack` condicional:** El stack trace de Node.js expone la estructura interna del código, rutas de archivo, versiones de módulos, etc. En producción esto es información sensible que no debe enviarse al cliente. En desarrollo es invaluable para depurar.

---

## 7. Modelos Mongoose

### 7.1 models/Usuario.js

```js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({ ... }, { timestamps: true });
```

#### Schema Fields

| Campo | Tipo | Restricciones | Notas |
|-------|------|---------------|-------|
| `nombre` | String | required, maxlength: 80 | `trim: true` elimina espacios al inicio/fin antes de guardar |
| `email` | String | required, unique, match regex | `lowercase: true` normaliza a minúsculas. `unique` crea un índice único en MongoDB |
| `password` | String | required, minlength: 8, **select: false** | `select: false` excluye automáticamente este campo de todos los `.find()` y `.findOne()` a menos que se use `.select("+password")` explícitamente |
| `role` | String | enum: ["usuario", "admin"], default: "usuario" | Solo estos dos valores son válidos. Mongoose rechaza cualquier otro |
| `activo` | Boolean | default: true | Flag de soft-delete / suspensión de cuenta |
| `createdAt` | Date | auto (timestamps) | Generado automáticamente por `{ timestamps: true }` |
| `updatedAt` | Date | auto (timestamps) | Actualizado automáticamente en cada `.save()` |

#### `{ timestamps: true }`

Opción de schema que instruye a Mongoose para añadir automáticamente dos campos:
- `createdAt`: fecha de creación del documento, asignada una sola vez.
- `updatedAt`: fecha de última modificación, actualizada en cada operación de escritura.

#### Pre-save hook — Hash de contraseña

```js
usuarioSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

**¿Por qué `async function` sin `next`?**

En Mongoose 9, los hooks `pre` pueden ser funciones async. Cuando la función async **resuelve** (llega al final o hace `return`), Mongoose lo interpreta como la señal de que el hook terminó — equivalente a llamar `done()` o `next()`. Si se pasa `next` como parámetro y se intenta llamar, lanza `TypeError: next is not a function` porque Mongoose 9 ya no inyecta `next` en hooks async.

**`this.isModified("password")`:** Verifica si el campo `password` cambió desde la última vez que se guardó el documento. Esto es crítico para evitar re-hashear un hash ya existente cuando se actualiza otro campo (nombre, email, etc.). Sin esta guardia, el hash se volvería un hash de hash, corrompiendo la contraseña.

**`bcrypt.hash(this.password, 12)`:** El segundo parámetro es el **cost factor** (factor de costo o rounds). Un valor de `12` significa 2^12 = 4096 iteraciones del algoritmo Blowfish. Es un equilibrio entre seguridad (mayor = más difícil para ataques de fuerza bruta) y velocidad (mayor = más tiempo de CPU por hash). El valor `12` es el estándar de la industria en 2024-2026.

#### Método de instancia — `compararPassword`

```js
usuarioSchema.methods.compararPassword = async function (candidata) {
  return bcrypt.compare(candidata, this.password);
};
```

**¿Por qué `methods` y no una función standalone?**

Al definirlo como método de instancia, se puede llamar como `usuario.compararPassword(candidata)` donde `this` es el documento de Mongoose. La alternativa sería pasar ambas cadenas a una función externa, pero esto requeriría que el campo `password` estuviera disponible en el scope llamante — violando el principio de encapsulación.

`bcrypt.compare(candidata, hash)` extrae el salt del hash almacenado, aplica el mismo proceso de derivación a `candidata`, y compara los resultados. Devuelve `true` si coinciden, `false` si no. Esta función **no es vulnerable a timing attacks** porque bcrypt usa comparación de longitud constante internamente.

**Prerequisito:** Para usar este método, el campo `password` debe estar cargado. Como `select: false`, es necesario hacer `.select("+password")` en la query previa. Si se llama el método sin haber cargado `password`, `this.password` será `undefined` y `bcrypt.compare` puede comportarse de forma inesperada.

---

### 7.2 models/Producto.js

```js
const productoSchema = new mongoose.Schema({ ... }, { timestamps: true });
productoSchema.set("toJSON", { virtuals: true });
productoSchema.set("toObject", { virtuals: true });
```

#### Schema Fields

| Campo | Tipo | Restricciones | Notas |
|-------|------|---------------|-------|
| `nombre` | String | required, maxlength: 100, trim | Nombre visible del producto |
| `descripcion` | String | maxlength: 500, trim, default: "" | **Duplicado en el schema** (aparece dos veces — el segundo sobreescribe al primero) |
| `sku` | String | required, unique, uppercase, trim | Stock Keeping Unit. `uppercase` normaliza a mayúsculas. Índice único en MongoDB |
| `categoria` | String | required, enum (6 valores), default: "Otros" | Valores válidos: Electrónica, Ropa, Hogar, Deportes, Alimentos, Otros |
| `precio` | Number | required, min: 0 | Precio base, sin descuento |
| `costo` | Number | min: 0, default: 0 | Precio de costo — usado para calcular margen (no expuesto en vistas públicas) |
| `stock` | Number | required, min: 0, default: 0 | Unidades disponibles. No puede ser negativo gracias a `min: 0` |
| `stockMinimo` | Number | min: 0, default: 5 | Umbral para alertas de stock bajo. Usado en el virtual `stockBajo` y en reportes |
| `ubicacion` | String | trim, default: "" | Ubicación física en almacén (pasillo, estante, etc.) |
| `proveedor` | String | trim, default: "" | Nombre del proveedor |
| `activo` | Boolean | default: true | Soft delete / visibilidad del producto |
| `imageUrl` | String | trim, default: "" | URL completa de la imagen del producto |
| `enOferta` | Boolean | default: false | Flag que activa el descuento |
| `descuento` | Number | min: 0, max: 100, default: 0 | Porcentaje de descuento (0-100) |

**Nota sobre `descripcion` duplicado:** El schema define `descripcion` dos veces. En JavaScript, las claves duplicadas en un objeto literal hacen que la segunda definición sobreescriba a la primera. El resultado es que `descripcion` tiene `default: ""`, `trim: true`, y `maxlength: 500` (los valores de la segunda definición). La primera definición es efectivamente ignorada.

#### Índices

```js
productoSchema.index({ nombre: "text", descripcion: "text" });
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });
```

- **Índice de texto full-text** en `nombre` y `descripcion`: Permite búsquedas con `$text: { $search: "..." }`. Sin embargo, el `productoController.js` usa `$regex` en lugar de `$text`, por lo que este índice no se está aprovechando actualmente.
- **Índice en `categoria`**: Optimiza filtros por categoría (consultas frecuentes en el catálogo).
- **Índice en `activo`**: Optimiza los filtros `activo: true` que aparecen en casi todas las queries de productos visibles.

#### Virtuals

Los campos virtuales no se persisten en MongoDB — se calculan en tiempo de lectura. Para que aparezcan en respuestas JSON, se requiere `toJSON: { virtuals: true }`.

**`stockBajo`**

```js
productoSchema.virtual("stockBajo").get(function () {
  return this.stock <= this.stockMinimo;
});
```

Retorna `true` si el stock actual es igual o menor al stock mínimo. Usado en el dashboard de administración para contar productos en estado crítico.

**`valorTotal`**

```js
productoSchema.virtual("valorTotal").get(function () {
  return this.precio * this.stock;
});
```

Valor monetario total del inventario para este producto. Si un producto cuesta $500 y hay 10 unidades, `valorTotal = 5000`. Usado en el resumen financiero del inventario.

**`precioFinal`**

```js
productoSchema.virtual("precioFinal").get(function () {
  if (!this.enOferta || !this.descuento) return this.precio;
  return parseFloat((this.precio * (1 - this.descuento / 100)).toFixed(2));
});
```

Calcula el precio tras aplicar el descuento. La lógica:
1. Si `enOferta` es `false` o `descuento` es `0` (falsy), retorna el precio base sin modificar.
2. Si hay oferta: `precio * (1 - descuento/100)`. Por ejemplo: $1000 con 20% de descuento → `1000 * (1 - 0.20) = 800`.
3. `parseFloat(...toFixed(2))` redondea a 2 decimales y convierte de string a número.

---

### 7.3 models/Orden.js

```js
const itemOrdenSchema = new mongoose.Schema({ ... }, { _id: false });
const ordenSchema     = new mongoose.Schema({ ... }, { timestamps: true });
```

El modelo de Orden usa un **schema anidado** (`itemOrdenSchema`) para el array de items comprados.

#### `itemOrdenSchema` — Schema de Item

| Campo | Tipo | Notas |
|-------|------|-------|
| `producto` | ObjectId (ref: "Producto") | Referencia al producto original. Permite lookup futuro si se necesita info adicional |
| `nombre` | String, required | **Snapshot** — nombre del producto al momento de la compra |
| `sku` | String | **Snapshot** — SKU al momento de la compra |
| `imageUrl` | String, default: "" | **Snapshot** — URL de imagen al momento de la compra |
| `precio` | Number, required | **Snapshot** — precio base sin descuento al momento de la compra |
| `precioFinal` | Number, required | **Snapshot** — precio con descuento aplicado al momento de la compra |
| `cantidad` | Number, required, min: 1 | Unidades compradas |
| `subtotal` | Number, required | `precioFinal × cantidad`, calculado en el controller |

**`{ _id: false }`:** Los sub-documentos en un array de Mongoose reciben automáticamente un `_id`. Esta opción lo desactiva para ahorrar espacio en disco y simplificar la serialización JSON, dado que los items de una orden no necesitan ser identificados de forma independiente.

**¿Por qué desnormalizar (snapshots)?**

Si la orden almacenara solo la referencia `ObjectId` al producto, cambios futuros en el producto (subida de precio, cambio de nombre, eliminación) alterarían el historial de órdenes. Al guardar una copia de los datos en el momento de la compra, el historial es **inmutable** y fiel a lo que el usuario realmente pagó.

#### `ordenSchema` — Schema de Orden

| Campo | Tipo | Notas |
|-------|------|-------|
| `usuario` | ObjectId (ref: "Usuario"), required | Referencia al usuario que realizó la compra |
| `nombreCliente` | String, required | Snapshot del nombre del usuario al momento de la compra |
| `emailCliente` | String, required | Snapshot del email del usuario al momento de la compra |
| `items` | Array de `itemOrdenSchema`, required | Lista de productos comprados con sus datos desnormalizados |
| `total` | Number, required | Suma de todos los `subtotal` — calculado en el controller |
| `estado` | String, enum (5 valores), default: "pendiente" | Estado del ciclo de vida del pedido |
| `createdAt` | Date, auto | Fecha y hora de creación de la orden |
| `updatedAt` | Date, auto | Fecha y hora de última modificación |

**Estados del ciclo de vida:**

```
pendiente → procesando → enviado → completado
                                ↓
                           cancelado (desde cualquier estado, restaura stock)
```

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Orden recién creada, pendiente de revisión por el admin |
| `procesando` | El admin confirmó y está preparando el envío |
| `enviado` | El paquete está en tránsito |
| `completado` | El cliente recibió el pedido |
| `cancelado` | La orden fue cancelada; el stock se restaura automáticamente |

---

## 8. Controladores

### 8.1 controllers/authController.js

**Propósito:** Gestiona el ciclo de vida de la sesión de usuario: registro, login, logout, consulta de sesión activa, y actualización de perfil con verificaciones de seguridad.

#### Variable `COOKIE_OPTS`

```js
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
```

| Opción | Valor | Propósito de seguridad |
|--------|-------|----------------------|
| `httpOnly: true` | Siempre | El JavaScript del navegador **no puede leer** esta cookie. Protege contra ataques XSS — aunque el atacante inyecte JS malicioso, no puede extraer el token |
| `secure` | `true` en producción | La cookie solo se envía por HTTPS. Protege contra ataques de interceptación en tránsito (MITM) |
| `sameSite: "strict"` | Siempre | La cookie solo se envía cuando la navegación **origina** en el mismo sitio. Protege contra CSRF — peticiones de otros dominios no llevarán la cookie |
| `maxAge` | 7 días en ms | Tiempo de vida de la cookie en el navegador. Transcurrido este tiempo, el navegador la elimina automáticamente |

#### Función `generarToken(id)`

```js
const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
```

Firma un JWT con algoritmo HS256 (HMAC-SHA256). El payload contiene solo `{ id }` — mínimo de información. `jwt.sign()` añade automáticamente `iat` (issued at) y `exp` (expiration) al payload.

**¿Por qué solo `{ id }` y no `{ id, role, email }`?**

Si el role estuviera en el token, un cambio de role en la DB no se reflejaría hasta que el token expire. Al guardar solo el `id` y hacer un `findById` en `protect`, siempre se obtiene el role actualizado.

#### Función `respuestaUsuario(usuario)`

```js
const respuestaUsuario = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  role: usuario.role,
});
```

Proyección manual para construir el objeto de respuesta. Garantiza que campos como `password`, `activo`, `createdAt`, `__v` **nunca lleguen al cliente**, aunque haya un bug que los cargue. Es un "allow-list" de propiedades seguras.

---

#### `registro` — POST /api/auth/registro

```js
export const registro = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    res.status(400);
    return next(new Error(errores.array()[0].msg));
  }

  const { nombre, email, password } = req.body;
  const existe = await Usuario.findOne({ email });
  if (existe) { ... return next(new Error("El email ya está registrado")); }

  const usuario = await Usuario.create({ nombre, email, password });
  const token = generarToken(usuario._id);

  res.status(201).cookie("token", token, COOKIE_OPTS)
     .json({ exito: true, datos: respuestaUsuario(usuario) });
};
```

**Flujo de datos:**

1. `validationResult(req)` — `express-validator` agrega los resultados de las validaciones definidas en la ruta a `req`. Si hay errores, se extrae el primer mensaje (`[0].msg`) y se pasa al error handler. Solo se reporta un error a la vez para simplicidad.
2. Búsqueda de duplicado por email antes de crear — si ya existe, 400.
3. `Usuario.create()` dispara el pre-save hook que hashea la contraseña.
4. Se firma un JWT con el `_id` del usuario recién creado.
5. La respuesta establece la cookie y devuelve los datos públicos del usuario.

**Datos de entrada (body):** `{ nombre, email, password }`  
**Datos de salida:** Cookie HTTP-only + `{ exito: true, datos: { _id, nombre, email, role } }`

---

#### `login` — POST /api/auth/login

```js
const usuario = await Usuario.findOne({ email }).select("+password");
if (!usuario || !(await usuario.compararPassword(password))) { 401 }
if (!usuario.activo) { 403 }

const token = generarToken(usuario._id);
res.cookie("token", token, COOKIE_OPTS).json({ ... });
```

**Flujo de datos:**

1. `findOne({ email }).select("+password")` — el `+password` sobreescribe el `select: false` del schema y carga el hash de la contraseña. Este es el **único lugar** donde el hash debería estar accesible.
2. `compararPassword(password)` — el método de instancia ejecuta `bcrypt.compare`. La comparación combina la verificación de existencia del usuario con la verificación de contraseña en una sola condición: `!usuario || !comparación`. Esto previene ataques de timing donde un atacante podría inferir si un email existe basándose en si el servidor llega o no a la comparación.
3. Verificación de `activo` separada — permite dar un mensaje diferente para cuentas suspendidas vs. credenciales incorrectas.

**Datos de entrada (body):** `{ email, password }`  
**Datos de salida:** Cookie HTTP-only + `{ exito: true, datos: { _id, nombre, email, role } }`

---

#### `logout` — POST /api/auth/logout

```js
export const logout = (req, res) => {
  res.cookie("token", "", { ...COOKIE_OPTS, maxAge: 0 })
     .json({ exito: true, mensaje: "Sesión cerrada" });
};
```

**Mecanismo de logout con cookies:** No existe una forma de "eliminar" una cookie desde el servidor. La técnica estándar es sobreescribir la cookie con un valor vacío y `maxAge: 0`, lo que instruye al navegador a eliminarla inmediatamente.

`{ ...COOKIE_OPTS, maxAge: 0 }` — usa spread para copiar todas las opciones de seguridad (mismas flags = mismo dominio/path para que el navegador la identifique) pero sobreescribe `maxAge` a `0`.

Este endpoint no requiere `protect` — un usuario puede hacer logout incluso con un token inválido.

---

#### `getMe` — GET /api/auth/me

```js
export const getMe = async (req, res) => {
  res.json({ exito: true, datos: respuestaUsuario(req.usuario) });
};
```

La lógica real está en `protect`. Si la petición llegó aquí, `req.usuario` ya está hidratado y verificado. Este endpoint sirve para **restaurar la sesión** al recargar la página: el frontend hace esta petición al montar la app; si devuelve 200, la sesión sigue activa; si devuelve 401, el usuario debe hacer login.

**Datos de entrada:** Cookie HTTP-only (procesada por `protect`)  
**Datos de salida:** `{ exito: true, datos: { _id, nombre, email, role } }`

---

#### `actualizarPerfil` — PUT /api/auth/perfil

```js
export const actualizarPerfil = async (req, res, next) => {
  const { nombre, email, passwordActual, nuevoPassword } = req.body;

  const cambioSensible = email || nuevoPassword;

  if (cambioSensible) {
    if (!passwordActual) { 400 }
    const usuarioConPw = await Usuario.findById(req.usuario._id).select("+password");
    const valida = await usuarioConPw.compararPassword(passwordActual);
    if (!valida) { 401 }
    if (nuevoPassword && nuevoPassword.length < 8) { 400 }
  }

  const usuario = await Usuario.findById(req.usuario._id);
  if (nombre)        usuario.nombre   = nombre.trim();
  if (email)         usuario.email    = email.toLowerCase().trim();
  if (nuevoPassword) usuario.password = nuevoPassword; // pre-save hook hashea
  // role NUNCA se toca

  await usuario.save();
  res.json({ exito: true, datos: respuestaUsuario(usuario) });
};
```

**Arquitectura de seguridad del endpoint:**

- **Cambios no sensibles** (solo `nombre`): Se permiten sin verificación adicional.
- **Cambios sensibles** (`email` o `nuevoPassword`): Requieren `passwordActual` válida.
- **`role` nunca se actualiza** desde este endpoint — incluso si el cliente envía `{ role: "admin" }`, el campo se ignora silenciosamente.
- Se hace una segunda query `findById` sin `+password` para la operación de escritura. Esto es necesario porque el primer `findById` (en `protect`) tampoco cargó el password.
- Al asignar `usuario.password = nuevoPassword` y llamar `usuario.save()`, Mongoose detecta que `password` fue modificado (`isModified("password") === true`) y el pre-save hook lo hashea automáticamente.

**Nota de diseño:** Se realizan dos queries a la DB en el happy path de cambio sensible:
1. `findById(...).select("+password")` — para verificar la contraseña actual.
2. `findById(...)` — para actualizar los campos.

Esto podría optimizarse en una sola query, pero la legibilidad del código justifica el coste mínimo en este contexto.

---

### 8.2 controllers/usuarioController.js

**Propósito:** CRUD completo de usuarios desde el panel de administración, más el endpoint de estadísticas del dashboard.

#### `obtenerUsuarios` — GET /api/usuarios

```js
const usuarios = await Usuario.find().sort({ createdAt: -1 }).select("-password");
```

- `find()` sin filtro retorna todos los documentos de la colección.
- `.sort({ createdAt: -1 })` — orden descendente por fecha de creación (más recientes primero). `-1` = descendente, `1` = ascendente.
- `.select("-password")` — exclusión explícita aunque `select: false` ya lo cubra.

**Datos de salida:** `{ exito: true, conteo: N, datos: [array de usuarios] }`

---

#### `crearUsuario` — POST /api/usuarios

```js
const usuario = await Usuario.create({ nombre, email, password, role: role || "usuario" });
```

A diferencia de `registro`, este endpoint es solo para admins y **permite asignar el role** en la creación. El operador `||` garantiza que si `role` es `undefined` o `null`, se use `"usuario"` como default.

La validación aquí es manual (comprobación de campos requeridos) en lugar de `express-validator`. Inconsistencia menor respecto al flujo de registro.

---

#### `actualizarUsuario` — PUT /api/usuarios/:id

```js
const usuario = await Usuario.findById(req.params.id);
// ... asignaciones
if (password && password.length >= 8) usuario.password = password;
await usuario.save();
```

Usa `.save()` **deliberadamente** (en lugar de `findByIdAndUpdate`) para que el pre-save hook se ejecute y hashee la contraseña si fue modificada. `findByIdAndUpdate` con `$set` **no dispara** hooks `pre('save')`.

La validación de longitud mínima `password.length >= 8` es una salvaguarda — si el admin envía un password corto, simplemente no se actualiza el campo (fallo silencioso). Sería mejor devolver un error 400.

---

#### `eliminarUsuario` — DELETE /api/usuarios/:id

```js
if (req.params.id === req.usuario._id.toString()) {
  res.status(400);
  return next(new Error("No puedes eliminar tu propia cuenta"));
}
```

La comparación usa `.toString()` porque `req.params.id` es un string (viene de la URL) pero `req.usuario._id` es un objeto `ObjectId` de MongoDB. Sin `.toString()`, la comparación `===` siempre sería `false` (string !== object).

Esta es la única protección anti-suicidio del sistema. No hay protección para eliminar el único admin — si hay dos admins y uno borra al otro, el sistema podría quedar sin admins.

---

#### `obtenerStats` — GET /api/usuarios/stats

```js
const [totalUsuarios, totalAdmins, totalProductos, stockBajo] = await Promise.all([
  Usuario.countDocuments(),
  Usuario.countDocuments({ role: "admin" }),
  Producto.countDocuments({ activo: true }),
  Producto.countDocuments({ activo: true, $expr: { $lte: ["$stock", "$stockMinimo"] } }),
]);
```

**`Promise.all()`:** Ejecuta las cuatro queries a MongoDB **en paralelo** (concurrentemente). Sin `Promise.all`, las 4 queries se ejecutarían en serie, haciendo el endpoint 4x más lento innecesariamente.

**`$expr: { $lte: ["$stock", "$stockMinimo"] }`:** El operador `$expr` permite comparar dos campos del mismo documento usando expresiones de agregación. No es posible comparar dos campos del mismo documento con operadores de query normales (`$lt`, `$lte`, etc. solo comparan un campo contra un valor literal).

---

### 8.3 controllers/productoController.js

**Propósito:** CRUD completo de productos con filtrado, paginación y reportes de inventario.

#### `obtenerProductos` — GET /api/productos

```js
const {
  buscar, categoria, activo, enOferta,
  ordenar = "-createdAt",
  pagina = 1, limite = 20,
} = req.query;
```

Los parámetros se reciben como **query strings**. Todos son opcionales con valores por defecto: ordenamiento por fecha de creación descendente, primera página, 20 items por página.

**Construcción dinámica del filtro:**

```js
const filtro = {};
if (buscar) {
  filtro.$or = [
    { nombre:    { $regex: buscar, $options: "i" } },
    { sku:       { $regex: buscar, $options: "i" } },
    { proveedor: { $regex: buscar, $options: "i" } },
  ];
}
if (categoria) filtro.categoria = categoria;
if (activo !== undefined) filtro.activo = activo === "true";
if (enOferta !== undefined) filtro.enOferta = enOferta === "true";
```

- `$regex` con `$options: "i"` — búsqueda insensible a mayúsculas/minúsculas. No escapa el input del usuario antes de usarlo como regex — **potencial ReDoS** si el usuario envía patrones regex complejos.
- `activo === "true"` — conversión explícita de string a boolean porque los query params siempre llegan como strings.
- `$or` busca en tres campos — nombre, SKU y proveedor.

**Paginación:**

```js
const skip = (parseInt(pagina) - 1) * parseInt(limite);
const total = await Producto.countDocuments(filtro);
const productos = await Producto.find(filtro).sort(ordenar).skip(skip).limit(parseInt(limite));
```

- `skip` calcula cuántos documentos saltar. Página 1 = skip(0), Página 2 = skip(20), etc.
- `countDocuments(filtro)` devuelve el total de documentos que coinciden con el filtro (sin paginar). Necesario para que el frontend construya la paginación.
- `sort(ordenar)` acepta strings como `"-precio"` (desc) o `"nombre"` (asc) directamente.

**Datos de salida:**

```json
{
  "exito": true,
  "conteo": 20,
  "total": 150,
  "paginas": 8,
  "paginaActual": 1,
  "datos": [...]
}
```

---

#### `crearProducto` — POST /api/productos

```js
const skuExistente = await Producto.findOne({ sku: req.body.sku?.toUpperCase() });
if (skuExistente) { 400 }
const producto = await Producto.create(req.body);
```

Verificación manual de SKU único antes de crear. Aunque el campo `sku` tiene `unique: true` en el schema (que genera un índice único en MongoDB), la verificación manual permite dar un mensaje de error más descriptivo que el error de índice duplicado nativo de MongoDB.

**Riesgo:** `Producto.create(req.body)` pasa el body completo al schema. Aunque Mongoose ignora campos no definidos en el schema, esto es una práctica de "mass assignment" que puede ser peligrosa si se añaden campos sensibles al schema en el futuro. Mejor práctica: desestructurar solo los campos permitidos del body.

---

#### `actualizarProducto` — PUT /api/productos/:id

```js
const productoActualizado = await Producto.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true, runValidators: true }
);
```

- `new: true` — retorna el documento **después** de la actualización en lugar del original.
- `runValidators: true` — ejecuta las validaciones del schema durante el update. Sin esta opción, `findByIdAndUpdate` bypasea las validaciones por defecto.

**Nota:** Usa `findByIdAndUpdate` en lugar de `.save()`, lo que significa que el pre-save hook (hash de password) **no se dispara**. Para productos esto es correcto — no tienen campo de password. Pero es importante recordar esta diferencia al trabajar con `Usuario`.

---

#### `obtenerStockBajo` — GET /api/productos/reportes/stock-bajo

```js
const productos = await Producto.find({
  activo: true,
  $expr: { $lte: ["$stock", "$stockMinimo"] },
}).sort({ stock: 1 });
```

Usa el mismo patrón `$expr` explicado en `obtenerStats`. Ordena por stock ascendente (los más críticos primero).

---

#### `obtenerResumen` — GET /api/productos/reportes/resumen

```js
const [resumen] = await Producto.aggregate([
  { $match: { activo: true } },
  {
    $group: {
      _id: null,
      totalProductos:   { $sum: 1 },
      totalUnidades:    { $sum: "$stock" },
      valorInventario:  { $sum: { $multiply: ["$precio", "$stock"] } },
      precioPromedio:   { $avg: "$precio" },
      stockPromedio:    { $avg: "$stock" },
    },
  },
]);
```

**Pipeline de Agregación MongoDB:**

1. `$match` — filtra solo productos activos (equivalente al `WHERE` de SQL).
2. `$group` — agrupa todos los documentos en un solo resultado (`_id: null`). Para cada documento en el grupo:
   - `$sum: 1` — cuenta documentos (equivalente a `COUNT(*)`).
   - `$sum: "$stock"` — suma los valores del campo `stock`.
   - `$sum: { $multiply: ["$precio", "$stock"] }` — suma el resultado de multiplicar precio × stock por cada producto (valor total del inventario).
   - `$avg` — promedio aritmético.

```js
const porCategoria = await Producto.aggregate([
  { $match: { activo: true } },
  {
    $group: {
      _id: "$categoria",
      cantidad: { $sum: 1 },
      unidades: { $sum: "$stock" },
      valor:    { $sum: { $multiply: ["$precio", "$stock"] } },
    },
  },
  { $sort: { valor: -1 } },
]);
```

Agrupa por el valor del campo `categoria`. Para cada categoría calcula cantidad de productos distintos, unidades totales, y valor total en inventario. `$sort: { valor: -1 }` ordena por valor descendente (categoría más valiosa primero).

---

### 8.4 controllers/ordenController.js

**Propósito:** Implementa el flujo de checkout atómico con rollback manual, y la gestión de órdenes por el administrador con restauración de stock al cancelar.

#### `crearOrden` — POST /api/ordenes

Este es el controller más complejo del sistema. Implementa un flujo transaccional manual:

**Paso 1 — Validar payload**

```js
const { items } = req.body; // [{ productoId, cantidad }]
if (!items || items.length === 0) { 400 }
```

**Paso 2 — Consulta masiva de productos**

```js
const ids = items.map(i => i.productoId);
const productos = await Producto.find({ _id: { $in: ids }, activo: { $ne: false } });
```

`$in` permite buscar múltiples documentos por sus IDs en **una sola query** a MongoDB en lugar de hacer N queries individuales.

`activo: { $ne: false }` — retorna productos donde `activo` es `true` o `undefined` (productos sin el campo, que son productos legacy). Esto es más permisivo que `activo: true` para compatibilidad con datos anteriores.

**Paso 3 — Validación de existencia y stock suficiente**

```js
for (const item of items) {
  const prod = productos.find(p => p._id.toString() === item.productoId);
  if (!prod) { 400 }
  if (prod.stock < item.cantidad) { 409 }
}
```

`p._id.toString() === item.productoId` — comparación string vs ObjectId (mismo problema resuelto de la misma manera que en `eliminarUsuario`).

HTTP 409 (Conflict) para stock insuficiente es semánticamente más preciso que 400 (Bad Request) — la petición es válida, pero hay un conflicto de estado en el servidor.

**Paso 4 — Decremento atómico con rollback**

```js
const decrementados = [];
for (const item of items) {
  const actualizado = await Producto.findOneAndUpdate(
    { _id: item.productoId, stock: { $gte: item.cantidad } },
    { $inc: { stock: -item.cantidad } },
    { new: true }
  );
  if (!actualizado) {
    // Rollback
    for (const d of decrementados) {
      await Producto.findByIdAndUpdate(d.id, { $inc: { stock: d.cantidad } });
    }
    res.status(409);
    return next(new Error("Stock agotado mientras procesabas la compra."));
  }
  decrementados.push({ id: item.productoId, cantidad: item.cantidad });
}
```

**¿Por qué dos fases (validación + decremento) en lugar de solo el decremento atómico?**

La validación previa (Paso 3) da mensajes de error más informativos. El decremento atómico (Paso 4) es la defensa real contra race conditions.

**Atomicidad del decremento:**

`findOneAndUpdate({ _id: X, stock: { $gte: cantidad } }, { $inc: { stock: -cantidad } })` es una operación **atómica a nivel de documento** en MongoDB. Si entre el Paso 3 y el Paso 4 otro usuario compró el último stock:
- La condición `{ stock: { $gte: cantidad } }` **falla** (stock ya es menor que lo necesario).
- `findOneAndUpdate` retorna `null`.
- El código detecta `null` y hace rollback de los ítems ya decrementados.

**El rollback es manual** (no hay transacciones en este código). Si el rollback mismo falla (problema de red, por ejemplo), el inventario quedaría en un estado inconsistente — hay unidades decrementadas sin orden creada. Este es un riesgo real de la implementación actual.

**Paso 5 — Snapshot de precios**

```js
const itemsOrden = items.map(item => {
  const prod = productos.find(p => p._id.toString() === item.productoId);
  const precioFinal =
    prod.enOferta && prod.descuento > 0
      ? parseFloat((prod.precio * (1 - prod.descuento / 100)).toFixed(2))
      : prod.precio;
  return {
    producto: prod._id,
    nombre:   prod.nombre,
    sku:      prod.sku,
    imageUrl: prod.imageUrl || "",
    precio:   prod.precio,
    precioFinal,
    cantidad: item.cantidad,
    subtotal: parseFloat((precioFinal * item.cantidad).toFixed(2)),
  };
});
```

El cálculo de `precioFinal` replica la lógica del virtual del schema pero explícitamente, porque los virtuals no se calculan durante la creación del documento de la orden (son del modelo Producto, no del modelo Orden).

**Paso 6 — Persistir la orden**

```js
const orden = await Orden.create({
  usuario:       req.usuario._id,
  nombreCliente: req.usuario.nombre,
  emailCliente:  req.usuario.email,
  items:         itemsOrden,
  total,
});
res.status(201).json({ exito: true, datos: orden });
```

`req.usuario` viene de `protect` — los datos del cliente se toman del token de sesión, no del body. Esto previene que un usuario compre "en nombre de otro".

---

#### `obtenerOrdenes` — GET /api/ordenes

```js
const ordenes = await Orden.find().sort({ createdAt: -1 });
```

Sin filtros — devuelve todas las órdenes del sistema, ordenadas por más recientes primero. Solo accesible para admins (`protect + soloAdmin`).

**Potencial de escalabilidad:** Sin paginación. Con muchas órdenes esto puede ser lento. Para uso en producción se debería añadir paginación similar a `obtenerProductos`.

---

#### `actualizarOrden` — PUT /api/ordenes/:id

```js
if (estado === "cancelado" && orden.estado !== "cancelado") {
  for (const item of orden.items) {
    await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } });
  }
}
orden.estado = estado;
await orden.save();
```

**Doble condición `estado === "cancelado" && orden.estado !== "cancelado"`:**

Esta guarda previene la **restauración doble de stock**. Si el admin cancela una orden ya cancelada (doble click, por ejemplo), sin esta guarda el stock se incrementaría dos veces. Con la guarda, la restauración solo ocurre en la **transición** a `cancelado` desde cualquier otro estado.

**Uso de `orden.save()` en lugar de `findByIdAndUpdate`:** Al usar `.save()`, el `updatedAt` se actualiza automáticamente por `{ timestamps: true }`. También dispararía el pre-save hook si existiera alguno en `ordenSchema`.

---

## 9. Rutas

### 9.1 routes/authRoutes.js

| Método | Path | Middleware | Handler | Auth |
|--------|------|-----------|---------|------|
| POST | `/registro` | validaciones express-validator | `registro` | Pública |
| POST | `/login` | validaciones express-validator | `login` | Pública |
| POST | `/logout` | — | `logout` | Pública |
| GET | `/me` | `protect` | `getMe` | Usuario autenticado |
| PUT | `/perfil` | `protect` | `actualizarPerfil` | Usuario autenticado |

**Validaciones en `/registro`:**

```js
body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
body("password").isLength({ min: 8 }).withMessage("..."),
```

- `trim()` — elimina espacios del valor antes de validar.
- `notEmpty()` — rechaza strings vacíos.
- `isEmail()` — verifica formato de email con regex interno de validator.js.
- `normalizeEmail()` — normaliza el email (lowercase, elimina puntos en gmail, etc.).
- `isLength({ min: 8 })` — valida longitud mínima.

Las validaciones se ejecutan **antes** de que el handler del controller reciba la petición. Los resultados se almacenan en `req` y se acceden con `validationResult(req)` dentro del handler.

---

### 9.2 routes/usuarioRoutes.js

```js
router.use(protect, soloAdmin);
```

`router.use()` sin path aplica el middleware a **todas las rutas** del router. Es equivalente a añadir `protect, soloAdmin` en cada `router.get()`, `router.post()`, etc., pero más conciso y sin riesgo de olvidar proteger una ruta nueva.

| Método | Path | Handler |
|--------|------|---------|
| GET | `/stats` | `obtenerStats` |
| GET | `/` | `obtenerUsuarios` |
| POST | `/` | `crearUsuario` |
| PUT | `/:id` | `actualizarUsuario` |
| DELETE | `/:id` | `eliminarUsuario` |

**Uso de `router.route()`:**

```js
router.route("/").get(obtenerUsuarios).post(crearUsuario);
router.route("/:id").put(actualizarUsuario).delete(eliminarUsuario);
```

`router.route()` agrupa múltiples métodos HTTP para el mismo path. Evita repetir el path y permite encadenar métodos.

---

### 9.3 routes/productoRoutes.js

Los reportes se definen **antes** que la ruta `/:id` para evitar ambigüedad:

```js
router.get("/reportes/stock-bajo", protect, soloAdmin, obtenerStockBajo);
router.get("/reportes/resumen",    protect, soloAdmin, obtenerResumen);
```

Si `/:id` estuviera definido primero, `"/reportes/stock-bajo"` sería interpretado como un request con `id = "reportes"` y el handler llamaría `findById("reportes")`, que fallaría con `CastError`.

| Método | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/reportes/stock-bajo` | Admin | `obtenerStockBajo` |
| GET | `/reportes/resumen` | Admin | `obtenerResumen` |
| GET | `/` | Pública | `obtenerProductos` |
| POST | `/` | Admin | `crearProducto` |
| GET | `/:id` | Pública | `obtenerProductoPorId` |
| PUT | `/:id` | Admin | `actualizarProducto` |
| DELETE | `/:id` | Admin | `eliminarProducto` |

---

### 9.4 routes/ordenRoutes.js

```js
router.post("/",    protect,             crearOrden);
router.get("/",     protect, soloAdmin,  obtenerOrdenes);
router.put("/:id",  protect, soloAdmin,  actualizarOrden);
```

| Método | Path | Auth | Handler |
|--------|------|------|---------|
| POST | `/` | Usuario autenticado | `crearOrden` |
| GET | `/` | Admin | `obtenerOrdenes` |
| PUT | `/:id` | Admin | `actualizarOrden` |

**Ausencia de DELETE:** Las órdenes nunca se eliminan físicamente — solo se cancelan (soft delete por cambio de estado). Esto preserva el historial para auditorías y contabilidad.

---

## 10. Flujo de Datos End-to-End

### Flujo de Autenticación

```
Cliente                          Express                    MongoDB
  │                                │                           │
  ├─ POST /api/auth/login ────────>│                           │
  │   { email, password }          │                           │
  │                                ├─ express-validator ───────│
  │                                ├─ findOne({email}) ───────>│
  │                                │<─ { usuario, hash } ──────│
  │                                ├─ bcrypt.compare() ────────│
  │                                ├─ jwt.sign({ id }) ────────│
  │<─ 200 Set-Cookie: token=JWT ───│                           │
  │   { _id, nombre, email, role } │                           │
  │                                │                           │
  ├─ GET /api/auth/me ────────────>│                           │
  │   Cookie: token=JWT            │                           │
  │                                ├─ protect()                │
  │                                ├─ jwt.verify(token) ───────│
  │                                ├─ findById(decoded.id) ───>│
  │                                │<─ { usuario sin pw } ─────│
  │<─ 200 { datos: usuario } ──────│                           │
```

### Flujo de Checkout

```
Cliente                          Express                    MongoDB
  │                                │                           │
  ├─ POST /api/ordenes ───────────>│                           │
  │   Cookie: token=JWT            │                           │
  │   { items: [{id, cant}...] }   │                           │
  │                                ├─ protect() ───────────────│
  │                                ├─ find({ $in: ids }) ─────>│
  │                                │<─ [productos] ────────────│
  │                                ├─ Validar stock ───────────│
  │                                │                           │
  │                                ├─ findOneAndUpdate (atóm.)>│ ← item 1
  │                                │<─ producto actualizado ───│
  │                                ├─ findOneAndUpdate (atóm.)>│ ← item 2
  │                                │<─ null (sin stock) ───────│
  │                                ├─ ROLLBACK: $inc +stock ──>│ ← reversar item 1
  │<─ 409 "Stock agotado" ─────────│                           │
  │                                │         [o bien]          │
  │                                ├─ Orden.create() ─────────>│
  │<─ 201 { orden } ───────────────│                           │
```

---

## 11. Mapa de Seguridad

| Capa | Mecanismo | Vulnerabilidad cubierta |
|------|-----------|------------------------|
| Transporte | Cookie `Secure` en producción | Interceptación MITM |
| XSS | Cookie `httpOnly: true` | Robo de token via JS malicioso |
| CSRF | Cookie `sameSite: strict` | Peticiones cross-site forjadas |
| Autenticación | JWT firmado con HS256 + `protect` middleware | Acceso sin autenticación |
| Autorización | `soloAdmin` middleware | Escalada de privilegios |
| Contraseñas | bcrypt con cost=12 | Fuerza bruta sobre contraseñas filtradas |
| Race conditions | MongoDB `$inc` + condición atómica | Overselling (stock negativo por concurrencia) |
| Inyección de roles | `actualizarPerfil` ignora campo `role` | Escalada de privilegios via perfil |
| Auto-eliminación | Comparación de IDs en `eliminarUsuario` | Admin borra su propia cuenta |
| Exposición de datos | `select: false` en password + `respuestaUsuario()` | Filtración de hash de contraseña |
| Sesiones invalidadas | `findById` en `protect` (no solo payload del JWT) | Usuarios desactivados con tokens válidos |
| Stack traces | Condicional `NODE_ENV` en `errorHandler` | Exposición de estructura interna en producción |

---

## 12. Casos Límite y Riesgos Detectados

> **Actualización 2026-06-13:** Verificación con git confirma exposiciones reales
> (no hipotéticas) y se añaden hallazgos que la revisión previa omitió. El código
> fuente del backend fue anotado con JSDoc de nivel producción en esta misma rama.

### Riesgo 0a — `server.JS` no arranca en Linux (CRÍTICO / BLOQUEANTE)

**Archivo:** `backend/server.JS` vs `backend/package.json`
**Descripción:** El archivo de entrada se llama `server.JS` (extensión en
mayúsculas), pero los scripts npm ejecutan `node server.js` (minúsculas). En
sistemas de archivos **case-sensitive** (Linux, la mayoría de contenedores
Docker y CI) `npm start` y `npm run dev` fallan con `Cannot find module
'.../server.js'`. Probablemente "funciona" sólo porque se desarrolla en
Windows/macOS (case-insensitive).
**Corrección:** Renombrar el archivo a `server.js` en minúsculas:
```bash
git mv backend/server.JS backend/server.js
```

---

### Riesgo 0b — `.env` versionado con credenciales reales (CRÍTICO / CONFIRMADO)

**Archivo:** `backend/.env`
**Descripción:** `git ls-files` confirma que `backend/.env` **está rastreado por
git** y forma parte del historial del repositorio. Contiene credenciales reales
de MongoDB Atlas (`mongodb+srv://nigga:nigga@passione.xnsqyzd.mongodb.net/...`)
y el `JWT_SECRET`. No existe ningún `.gitignore` en el repo. Cualquiera con
acceso al repositorio (o a su historial, aunque luego se borre el archivo) tiene
acceso completo a la base de datos y puede firmar JWTs arbitrarios.
**Corrección (urgente):**
1. **Rotar de inmediato** las credenciales del cluster de Atlas y el `JWT_SECRET`.
2. Crear `.gitignore` con `.env` y `node_modules/`.
3. Eliminar `.env` del seguimiento: `git rm --cached backend/.env`.
4. Considerar purgar el historial (`git filter-repo` / BFG) dado que el secreto
   ya quedó registrado en commits anteriores.

---

### Riesgo 0c — Sin validación de tipos en checkout: `cantidad` negativa e inyección NoSQL (ALTO)

**Archivo:** `controllers/ordenController.js` (`crearOrden`)
**Descripción:** `req.body.items` se consume sin validar tipos:
- Una `cantidad` **negativa** hace que la condición `{ stock: { $gte: cantidad } }`
  siempre se cumpla y que `$inc: { stock: -cantidad }` **incremente** el stock,
  generando además `subtotal` y `total` negativos en la orden persistida.
- `productoId` no se valida como string/ObjectId; un objeto inyectado podría
  alterar el `$in` o el `findOneAndUpdate` (inyección NoSQL).
**Corrección:** Validar cada ítem con express-validator o manualmente:
`productoId` ObjectId válido y `cantidad` entero `>= 1` antes de tocar la DB.

---

### Riesgo 0d — Faltan rate limiting y cabeceras de seguridad (MEDIO)

**Archivo:** `backend/server.JS`
**Descripción:** No hay `express-rate-limit` en `/login` y `/registro`
(brute-force / credential stuffing sin freno), ni `helmet` para cabeceras HTTP
de seguridad (HSTS, X-Content-Type-Options, etc.). Tampoco hay límite explícito
de tamaño de payload distinto al default de `express.json`.
**Corrección:** Añadir `helmet()` global y un `rateLimit` específico para las
rutas de autenticación.

---

### Riesgo 1 — JWT_SECRET en texto plano (CRÍTICO)

**Archivo:** `.env`  
**Descripción:** El secreto JWT `passione_super_secret_key_cambiar_en_produccion` es predecible. Si un atacante lo conoce, puede firmar tokens propios y suplantar cualquier usuario incluyendo admins.  
**Corrección:** Generar con `openssl rand -base64 64` y usar una variable de entorno segura (AWS Secrets Manager, Vault, etc.) en producción.

---

### Riesgo 2 — Credenciales de MongoDB en .env (CRÍTICO)

**Archivo:** `.env`  
**Descripción:** Usuario y contraseña de la base de datos están en texto plano en el archivo `.env`. Si este archivo se committea a un repositorio público, las credenciales quedan expuestas.  
**Corrección:** Añadir `.env` a `.gitignore`. Rotar las credenciales del cluster de Atlas.

---

### Riesgo 3 — ReDoS via `$regex` sin escapado (MEDIO)

**Archivo:** `controllers/productoController.js:23`  
**Descripción:** El parámetro `?buscar=` se usa directamente como regex: `{ $regex: buscar, $options: "i" }`. Un atacante puede enviar un patrón regex catastrófico como `((a+)+)$` que cause CPU exhaustion (ReDoS).  
**Corrección:** Escapar el input antes de usarlo como regex:
```js
const escaped = buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
filtro.$or = [{ nombre: { $regex: escaped, $options: "i" } }, ...];
```

---

### Riesgo 4 — Mass Assignment en `crearProducto` y `actualizarProducto` (BAJO-MEDIO)

**Archivo:** `controllers/productoController.js:88, 113`  
**Descripción:** `Producto.create(req.body)` y `findByIdAndUpdate(id, req.body)` pasan el body HTTP directamente sin filtrar campos. Actualmente seguro porque Mongoose ignora campos fuera del schema, pero si en el futuro se añade un campo como `costo` (que ya existe) o `activo`, el cliente podría modificarlo libremente.  
**Corrección:** Desestructurar solo los campos permitidos:
```js
const { nombre, sku, precio, stock, categoria, imageUrl, enOferta, descuento, descripcion } = req.body;
await Producto.create({ nombre, sku, precio, stock, categoria, imageUrl, enOferta, descuento, descripcion });
```

---

### Riesgo 5 — Rollback no atómico en checkout (MEDIO)

**Archivo:** `controllers/ordenController.js:45-53`  
**Descripción:** El rollback manual de stock es un bucle de `findByIdAndUpdate` independientes. Si una de estas operaciones falla (timeout, error de red), el inventario queda inconsistente: algunas unidades decrementadas sin orden creada.  
**Corrección ideal:** Usar MongoDB Transactions (requiere replica set, disponible en Atlas):
```js
const session = await mongoose.startSession();
session.startTransaction();
try {
  // ... operaciones con { session }
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
}
```

---

### Riesgo 6 — `descripcion` duplicado en Producto.js (BAJO)

**Archivo:** `models/Producto.js`  
**Descripción:** El campo `descripcion` aparece dos veces en el schema. En JavaScript, la segunda definición sobreescribe a la primera silenciosamente. No causa error en tiempo de ejecución pero es confuso para mantenedores.  
**Corrección:** Eliminar la primera ocurrencia del campo `descripcion` en el schema.

---

### Riesgo 7 — Sin paginación en `obtenerOrdenes` (RENDIMIENTO)

**Archivo:** `controllers/ordenController.js:98`  
**Descripción:** `Orden.find()` sin `limit()` carga todas las órdenes en memoria. Con miles de órdenes, esto degrada el rendimiento y puede causar errores de memoria.  
**Corrección:** Añadir paginación siguiendo el mismo patrón de `obtenerProductos`.

---

### Riesgo 8 — Posibilidad de quedarse sin admins (LÓGICA)

**Archivo:** `controllers/usuarioController.js:62`  
**Descripción:** El sistema solo previene que un admin se elimine a sí mismo, pero no previene que un admin elimine a todos los demás admins. Si hay exactamente un admin y otro admin lo elimina, el sistema queda sin administradores accesibles.  
**Corrección:** Antes de eliminar un usuario admin, verificar que quedaría al menos un admin activo:
```js
if (usuario.role === 'admin') {
  const totalAdmins = await Usuario.countDocuments({ role: 'admin', activo: true });
  if (totalAdmins <= 1) { return next(new Error("No puedes eliminar el último administrador")); }
}
```

---

### Riesgo 9 — Validación débil en `actualizarUsuario` (BAJO)

**Archivo:** `controllers/usuarioController.js:49`  
**Descripción:** Si el admin envía un password de menos de 8 caracteres, el campo simplemente no se actualiza (fallo silencioso). El admin no recibe retroalimentación y puede asumir que la contraseña fue cambiada.  
**Corrección:** Retornar un error 400 en lugar de ignorar silenciosamente:
```js
if (password) {
  if (password.length < 8) { res.status(400); return next(new Error("La contraseña debe tener al menos 8 caracteres")); }
  usuario.password = password;
}
```

---

*Fin de la documentación técnica del backend de Passione E-Commerce.*
