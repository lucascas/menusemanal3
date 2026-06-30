# Plan de Testing — Semana de Comidas

> Estado: **PROPUESTA**. Este documento describe la estrategia de testing recomendada.
> A día de hoy el proyecto **NO** tiene runner ni tests configurados (no hay `jest`/`vitest`
> en `package.json`, ni scripts `test:*`). Nada de lo descrito aquí está aplicado todavía.
> Ninguna dependencia debe instalarse ni ningún archivo de configuración debe crearse
> a partir de este plan sin una decisión explícita.

Stack objetivo: **Next.js 15 (App Router) + Mongoose/MongoDB + NextAuth (JWT)**.
Contexto del cambio reciente: se revirtió el "modo demo abierto" y se restauró
autenticación real con NextAuth, protección de rutas vía `middleware.ts` y filtrado
por `casa`/`user` en todas las APIs (commit `2c37f39`). El testing debe centrarse
en **autenticación, protección de rutas y aislamiento de datos entre casas/usuarios**,
que es justamente lo que se acaba de tocar y donde una regresión es más peligrosa.

---

## 1. Runner recomendado: **Vitest**

Recomendación: **Vitest** por sobre Jest para este repo.

Justificación breve:

- **ESM y TypeScript nativos.** El repo es TS moderno (`typescript ^5`, `next ^15.5`,
  `react 19`) con imports tipo `@/...`. Vitest usa esbuild y resuelve TS/ESM sin la
  fricción de `ts-jest` + `babel` + `transformIgnorePatterns` que suele aparecer con
  Jest y paquetes ESM como `next-auth`/`@auth/core`.
- **Alias `@/`** se resuelve fácil reusando la config (vía `vite-tsconfig-paths`),
  evitando duplicar el `moduleNameMapper` de Jest. El proyecto usa `@/` en casi todos
  los imports de las rutas API y modelos.
- **Velocidad** y watch mode rápido para el ciclo de feedback de unit/integration.
- **API compatible con Jest** (`describe/it/expect`, `vi.mock`), curva de aprendizaje baja.
- **Playwright ya está presente** (`@playwright/test` está en `dependencies`) y es
  independiente del runner unit/integration, así que conviven sin conflicto.

Dependencias que haría falta agregar **a futuro** (NO ahora):

- `vitest` — runner.
- `@vitest/coverage-v8` — cobertura.
- `vite-tsconfig-paths` — resolver el alias `@/`.
- `mongodb-memory-server` — Mongo efímero en memoria para tests de integración.
- `node-mocks-http` o construcción manual de `Request`/`NextRequest` para las rutas API.
- (Opcional E2E de UI) `@testing-library/react` + `@testing-library/jest-dom` +
  `jsdom` si se decide testear componentes/hooks de cliente como `hooks/useAuth.ts`.

> Alternativa: si el equipo ya domina Jest y prefiere no introducir Vite, Jest +
> `ts-jest`/SWC también funciona, pero esperar más configuración para ESM de `next-auth`.

---

## 2. Estrategia / pirámide ajustada al proyecto

```
        /\
       /e2e\        ~10%  Playwright (ya disponible)
      /------\
     /  integ \     ~25-30%  rutas API + Mongoose real (mongodb-memory-server)
    /----------\
   /    unit     \  ~60%  authorize, callbacks, hook pre-save, helpers puros
  /--------------\
```

Para este repo el reparto clásico se ajusta así (la capa de integración pesa un poco
más de lo habitual porque el valor crítico vive en las rutas API y su filtrado por
`casa`/`user`):

- **Unit (~60%)** — lógica pura y aislable, sin red ni DB real:
  - `authorize` de Credentials (validación de input, comparación de password).
  - Callbacks `jwt` y `session` de `authOptions` (propagación de `id`/`casa`).
  - Hook `pre("save")` de `models/User.ts` (hashea una sola vez).
  - Lógica del `middleware.ts` (decisión de redirect según token/ruta).
  - Helpers en `lib/` (p. ej. `logger`, utilidades puras).

- **Integration (~25-30%)** — rutas API ejecutadas de verdad contra Mongoose, con
  `mongodb-memory-server` y `getServerSession` mockeado:
  - `meals` y `meals/[id]` (filtrado por `casa`, ownership en PUT/DELETE).
  - `weeklyMenu` y `weeklyMenu/[id]` (filtrado por `user`).
  - `casa` y `casa/invitar` (creación de casa, generación de token, canje).
  - `auth/register` (doble-hash, invitaciones, usuario existente).

- **E2E (~10%)** — flujos completos en navegador con Playwright:
  - Login con credenciales válidas/ inválidas y redirección.
  - Acceso a ruta protegida sin sesión → redirige a `/login`.
  - Flujo feliz: login → crear comida → verla en la lista.

> Nota: los componentes de UI (Radix, formularios) son numerosos pero de bajo riesgo
> de regresión respecto al cambio actual; no son prioridad. Cubrirlos con unit tests
> de Testing Library solo donde haya lógica (estado, validación), no por cobertura.

---

## 3. Prioridades concretas (basadas en lo que se acaba de tocar)

Orden de prioridad descendente. Todo lo "crítico" toca seguridad: auth, protección
de rutas y aislamiento de datos.

### P0 — Aislamiento de datos entre casas/usuarios (IDOR)
Es el riesgo más alto: una falla aquí filtra datos privados entre hogares.
- `app/api/meals/route.ts` — `Meal.find({ casa })` en GET; en POST fuerza
  `casa`/`user` desde la sesión.
- `app/api/meals/[id]/route.ts` — GET/PUT/DELETE hacen `findOne({ _id, casa })`;
  PUT preserva `casa` y `user` (anti mass-assignment, líneas 52-53).
- `app/api/weeklyMenu/route.ts` y `weeklyMenu/[id]/route.ts` — filtran por
  `user: session.user.id`; PUT preserva `user` y `casa` (líneas 52-53).

### P0 — Autenticación
- `app/api/auth/[...nextauth]/route.ts`:
  - `authorize` de Credentials (líneas 37-71): validación, `bcrypt.compare`,
    forma del objeto devuelto (`id`, `email`, `name`, `casa`).
  - callback `jwt` (159-172): copia `id/email/name/casa` al token.
  - callback `session` (173-201): rehidrata `casa` desde DB si falta en el token.
  - callback `signIn` (75-158): canje de invitación al loguear con Google.
- `hooks/useAuth.ts` — mapea `useSession` a `{ user, isAuthenticated, isLoading }`.

### P0 — Protección de rutas (`middleware.ts`)
- Rutas públicas (`/login`, `/register`, `/api/auth`) pasan sin token.
- Rutas normales sin token → redirect a `/login`.
- Rama admin (`/administrador/*`) usa cookie `admin_token`; `/administrador/login`
  es público.
- `matcher` excluye `api`, `_next/static`, `_next/image`, `favicon.ico`, assets.

### P1 — Doble-hash de password (regresión conocida)
- `app/api/auth/register/route.ts` (líneas 105-112): pasa la password en **texto
  plano** a `User.create`; **no** debe hashear ahí.
- `models/User.ts` hook `pre("save")` (53-58): hashea solo si `isModified("password")`.
- Regresión a evitar: que la password quede hasheada dos veces y el login falle.

### P1 — Invitaciones
- `app/api/casa/route.ts` POST: crea `Casa`, asigna `user.casa`, genera token
  (`crypto.randomBytes(32)`), crea `Invitation`, rollback si falla el email.
- `app/api/casa/invitar/route.ts`: genera token, borra invitaciones previas del
  email, asigna casa directa si el usuario ya existe sin casa.
- Canje vía `signIn` (Google) y vía `register` (Credentials con `invitationToken`).

---

## 4. Casos de prueba específicos por área

> Convenciones abajo: "sin sesión" = `getServerSession` devuelve `null`;
> "sesión sin casa" = `session.user.casa` es `null`; "casa A/B" = dos `casa._id`
> distintas.

### 4.1 `meals` — `app/api/meals/route.ts`

GET:
- [feliz] sesión con casa A → 200, devuelve **solo** comidas de casa A.
- [aislamiento] existen comidas de casa A y casa B → la respuesta NO contiene
  ninguna de casa B.
- [401] sin sesión → 401 `"No autorizado o sin casa asignada"`.
- [401] sesión sin casa (usuario nuevo sin casa) → 401.
- [500] error de DB (mock que lanza) → 500.

POST:
- [feliz] crea comida; el doc resultante tiene `casa = session.user.casa.id` y
  `user = session.user.id`, **ignorando** cualquier `casa`/`user` enviado en el body.
- [mass-assignment] body con `casa: <casaB>` → se guarda con casa de la sesión, no la del body.
- [401] sin sesión / sin casa → 401.
- [validación] body sin `name`/`type`/`ingredients`/`mealTime` → 500 por validación
  de Mongoose (documentar comportamiento actual; idealmente debería ser 400).

### 4.2 `meals/[id]` — `app/api/meals/[id]/route.ts`

GET:
- [feliz] id de comida de casa A, sesión casa A → 200 con la comida.
- [IDOR] id de comida de casa B, sesión casa A → **404** (no 200, no 403 que filtre existencia).
- [404] id inexistente → 404.
- [401] sin sesión / sin casa → 401.

PUT:
- [feliz] actualiza comida propia (casa A) → 200, cambios aplicados.
- [IDOR] intenta actualizar comida de casa B → 404, sin modificar el doc.
- [anti mass-assignment] body con `casa: <casaB>` y `user: <otro>` → el doc
  conserva `casa` original y `user = existingMeal.user` (líneas 52-53).
- [401] sin sesión / sin casa → 401.

DELETE:
- [feliz] borra comida propia → 200, el doc ya no existe.
- [IDOR] intenta borrar comida de casa B → 404 y la comida de B **sigue existiendo**.
- [401] sin sesión / sin casa → 401.

### 4.3 `weeklyMenu` — `route.ts` y `[id]/route.ts`

GET (lista):
- [feliz] sesión usuario U → 200, solo menús de `user: U`, ordenados por `fecha` desc.
- [aislamiento] menús de otro usuario no aparecen.
- [401] sin sesión (`!session.user.id`) → 401 `"No autorizado"`.

POST:
- [feliz crear] fecha + menú válidos → crea con `user` y `casa` de la sesión.
- [feliz upsert] ya existe menú para esa fecha y usuario → **actualiza** el existente
  (rama `existingMenu`, líneas 60-71), no crea duplicado.
- [400] sin `fecha` → 400 `"La fecha es requerida"`.
- [400] `menu` vacío / ausente → 400 `"El menú debe tener al menos un día"`.
- [400] JSON inválido → 400 `"Datos inválidos"`.
- [401] sin casa → 401.

GET/PUT/DELETE `[id]`:
- [feliz] menú propio → 200.
- [IDOR] menú de otro usuario → 404 (filtra por `user: session.user.id`).
- [anti mass-assignment] PUT con `user`/`casa` en body → conserva `user` de sesión y
  `casa` original (líneas 52-53).
- [401] sin sesión → 401.

### 4.4 Autenticación — `authOptions`

`authorize` (Credentials):
- [feliz] email+password correctos → devuelve `{ id, email, name, casa }` con `casa`
  poblada (`{ id, nombre }`) cuando el usuario tiene casa.
- [feliz sin casa] usuario válido sin casa → `casa: null`.
- [error] sin email o sin password → throw `"Email y contraseña son requeridos"`.
- [error] email inexistente → throw `"Credenciales inválidas"`.
- [error] usuario sin password (solo Google) → throw `"Credenciales inválidas"`.
- [error] password incorrecta → throw `"Credenciales inválidas"`.
- [normalización] email con mayúsculas → busca con `.toLowerCase()`.
- [name por defecto] usuario sin `name` → `name = email.split("@")[0]`.

callback `jwt`:
- [feliz] con `user` presente → token recibe `id/email/name/casa`.
- [persistencia] llamada posterior sin `user` → token mantiene los valores previos.

callback `session`:
- [feliz] token con casa → `session.user.casa` se completa.
- [rehidratación] token **sin** casa pero el usuario en DB ya tiene casa → consulta DB
  y rellena `session.user.casa` (líneas 181-194). Caso borde importante: usuario que
  obtuvo casa por invitación después de emitido el JWT.
- [sin casa] usuario realmente sin casa → `session.user.casa` queda null sin romper.

callback `signIn` (Google):
- [usuario nuevo] crea `User` con `googleId = profile.sub`.
- [usuario existente] actualiza `name`/`googleId`/`emailVerified`.
- [canje invitación] existe `Invitation` pendiente para el email y el usuario no tiene
  casa → asigna `dbUser.casa` y marca `invitation.used = true`.
- [no recanje] usuario que ya tiene casa → no consume la invitación.
- [error] sin email en la cuenta de Google → return `false`.

`hooks/useAuth.ts`:
- [autenticado] `useSession` → `status: "authenticated"` → `isAuthenticated true`,
  `user` = `session.user`.
- [cargando] `status: "loading"` → `isLoading true`.
- [no autenticado] sin sesión → `user: null`, `isAuthenticated false`.

### 4.5 Protección de rutas — `middleware.ts`

- [público] `/login`, `/register`, `/api/auth/...` → `NextResponse.next()` sin token.
- [protegida sin token] `/` u otra ruta de usuario sin token → redirect a `/login`.
- [protegida con token] mismo caso con token válido → `next()`.
- [admin sin cookie] `/administrador/comidas` sin `admin_token` → redirect a
  `/administrador/login`.
- [admin login público] `/administrador/login` → `next()` sin cookie.
- [admin con cookie] `/administrador/...` con `admin_token` → `next()`.
- [error getToken] `getToken` lanza → redirect a `/login` (catch, líneas 57-60).
- [matcher] verificar que `/api/...`, `/_next/static/...`, `favicon.ico` y assets
  `.png/.svg/...` quedan fuera del matcher (no pasan por el middleware).

### 4.6 Doble-hash de password — `register` + `User` pre-save

- [registro feliz] POST `/api/auth/register` con email+password nuevos → crea usuario;
  luego `bcrypt.compare(passwordPlano, user.password)` === `true`. **Test anti-regresión
  clave**: que NO esté doblemente hasheado.
- [login tras registro] el usuario registrado puede pasar `authorize` con la misma
  password (validación end-to-end del no-doble-hash).
- [no re-hash en update] al guardar el usuario modificando otro campo (p. ej.
  `lastLogin`) sin tocar `password`, el hash NO cambia (`isModified("password")` false).
- [400] register sin email o password → 400 `"Email y contraseña son requeridos"`.
- [409] email ya registrado sin token → 409 `"El email ya está registrado..."`.
- [longitud] password < 6 chars → error de validación de Mongoose.

### 4.7 Invitaciones — `casa` y `casa/invitar`

`casa` POST:
- [feliz] usuario sin casa crea casa → `Casa` creada con `creador = user._id`,
  `user.casa` actualizado.
- [token] por cada invitado válido se crea una `Invitation` con `token` de 64 hex
  chars y `used: false`.
- [rollback] si `sendInvitationEmail` falla → la invitación creada se elimina y el
  email va a `invitacionesFallidas`.
- [duplicado] usuario que ya tiene casa → 400 `"El usuario ya pertenece a una casa"`.
- [400] `nombre` faltante o no string → 400.
- [401] sin sesión → 401.

`casa/invitar` POST:
- [feliz] usuario con casa invita email nuevo → crea `Invitation`, envía email, 200.
- [limpieza] `Invitation.deleteMany({ email })` elimina invitaciones previas del email.
- [usuario existente sin casa] se asigna `casa` directamente y la invitación queda
  `used: true`.
- [usuario con casa] email pertenece a alguien que ya tiene casa → 400.
- [rollback email] falla `sendInvitationEmail` → borra la invitación → 500.
- [401] sin casa en sesión → 401.

Canje (cross-flujo):
- [register con token] register con `invitationToken` válido → usuario nuevo queda con
  la casa de la invitación y la invitación `used: true`.
- [register usuario existente sin casa + token] → asocia casa, `wasInvited: true`.
- [token inválido] register con token inexistente/expirado/usado → 400
  `"Invitación no válida o expirada"`.

---

## 5. Cómo testear APIs de Next App Router

### 5.1 Invocar los handlers directamente
Los handlers exportan funciones (`GET`, `POST`, `PUT`, `DELETE`) que reciben un
`Request` estándar (y `{ params }` en las rutas dinámicas). En test se importan y
se invocan directamente, sin levantar el servidor:

```ts
import { POST } from "@/app/api/meals/route"

const req = new Request("http://localhost/api/meals", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Milanesa", type: "carne", ingredients: ["..."], mealTime: "Almuerzo" }),
})
const res = await POST(req)
expect(res.status).toBe(200)
const body = await res.json()
```

Para rutas `[id]` se pasa el segundo argumento:
```ts
import { GET } from "@/app/api/meals/[id]/route"
const res = await GET(new Request("http://localhost/api/meals/123"), { params: { id: "123" } })
```

Para el `middleware` se construye un `NextRequest` y se mockea `getToken`:
```ts
import middleware from "@/middleware"
import { NextRequest } from "next/server"
// vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }))
```

### 5.2 Mockear `getServerSession`
Todas las rutas API usan `getServerSession(authOptions)` desde `next-auth/next`.
Se mockea por test para simular: sin sesión, sesión sin casa, sesión casa A, casa B.

```ts
import { vi } from "vitest"
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn() }))
import { getServerSession } from "next-auth/next"

;(getServerSession as any).mockResolvedValue({
  user: { id: "u1", email: "a@a.com", casa: { id: "casaA", nombre: "Casa A" } },
})
// sin sesión:
;(getServerSession as any).mockResolvedValue(null)
// sin casa:
;(getServerSession as any).mockResolvedValue({ user: { id: "u1", email: "a@a.com", casa: null } })
```

### 5.3 `dbConnect` / Mongoose
`lib/dbConnect.ts` exige `MONGODB_URI` y cachea la conexión en `global.mongoose`.
Dos enfoques según la capa:

- **Unit (sin DB real):** mockear `@/lib/dbConnect` para que sea un no-op, y mockear
  los modelos (`@/models/Meal`, etc.) con `vi.mock`, devolviendo objetos con
  `find`/`findOne`/`create`/`findByIdAndUpdate` simulados. Útil para verificar que el
  handler filtra por `casa`/`user` correctos (assert sobre los argumentos de la query).

- **Integration (DB real efímera, recomendado):** usar **`mongodb-memory-server`**.
  En `beforeAll` arrancar el server en memoria, setear `process.env.MONGODB_URI` a su
  URI y conectar Mongoose. Limpiar colecciones en `afterEach`, cerrar en `afterAll`.
  Como `dbConnect` cachea en `global.mongoose`, conviene resetear ese cache entre
  suites o conectar una sola vez por proceso.

```ts
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

let mongod: MongoMemoryServer
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  await mongoose.connect(process.env.MONGODB_URI)
})
afterEach(async () => {
  for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({})
})
afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
```

> Para tests de integración del filtrado por casa: sembrar comidas de `casaA` y
> `casaB`, mockear la sesión como `casaA`, y verificar que GET/PUT/DELETE jamás
> tocan documentos de `casaB`. Es la verificación de seguridad más valiosa.

### 5.4 Mockeos transversales
- `@/lib/logger` → mockear a no-op para silenciar salida.
- `@/app/actions/email` (`sendInvitationEmail`) → mockear; controlar `{ success: true }`
  y `{ success: false }` para probar los rollbacks de invitación.
- `next-auth/jwt` (`getToken`) → mockear en tests del middleware.
- Variables de entorno requeridas en setup: `NEXTAUTH_SECRET`, `MONGODB_URI`
  (las settea `mongodb-memory-server` en integración).

---

## 6. Setup propuesto (referencia — NO aplicado)

> Lo siguiente es una **propuesta** de configuración para cuando se decida implementar
> el testing. No está aplicado: no agregar estos scripts/dependencias ni crear estos
> archivos como parte de este plan.

Scripts a añadir en `package.json` (propuesta):

```jsonc
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

Config propuesta `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()], // resuelve el alias @/
  test: {
    environment: "node",            // rutas API y middleware
    setupFiles: ["tests/setup.ts"], // env vars + mocks globales (logger)
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["app/api/**", "middleware.ts", "models/**", "hooks/**", "lib/**"],
    },
  },
})
```

> Para tests de `hooks/useAuth.ts` (cliente React) usar `environment: "jsdom"` en esos
> archivos vía comentario `// @vitest-environment jsdom` o un proyecto/config aparte.

Estructura de carpetas sugerida:

```
tests/
  setup.ts
  unit/
    auth-authorize.test.ts
    auth-callbacks.test.ts
    user-presave.test.ts
    middleware.test.ts
    useAuth.test.ts
  integration/
    meals.test.ts
    meals-id.test.ts
    weeklyMenu.test.ts
    casa.test.ts
    register.test.ts
e2e/                # Playwright (ya disponible vía @playwright/test)
  login.spec.ts
  protected-routes.spec.ts
  meals-flow.spec.ts
```

Quality gates sugeridos (a calibrar al implementar):
- Cobertura mínima en las áreas críticas (`app/api/**`, `middleware.ts`,
  `models/User.ts`, `authOptions`): apuntar a 80%+ de líneas/branches.
- Los tests de **aislamiento por casa/usuario (IDOR)** y el de **no-doble-hash**
  deben ser bloqueantes en CI: son la red de seguridad del cambio recién hecho.
- E2E de login + ruta protegida en el pipeline antes de merge a `main`.
