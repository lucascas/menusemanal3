# Worklog — 2026-06-26

Registro del trabajo hecho sobre **Planneat / Menú Semanal** (repo `menusemanal3`)
en una sesión de puesta a punto local. Todo el código quedó en el branch
`fix/local-setup-and-bugs` (commit `1023201`), sin pushear ni mergear a `master`.

---

## 1. Clonado y diagnóstico inicial

- Se clonó `https://github.com/lucascas/menusemanal3.git` en
  `C:\Users\lucas\Documents\Projects\Menu Semanal` (la carpeta estaba vacía).
- **Hallazgo aparte:** existe un `.git` perdido en `C:\Users\lucas` (home) que
  hacía que git intentara versionar todo el home (`.ssh`, `NTUSER.DAT`, etc.).
  Es de jul/2024 y probablemente accidental. **No se tocó** — si no versionás
  tu home a propósito, conviene borrarlo: `rm -rf /c/Users/lucas/.git`.

## 2. Puesta en marcha local

| Paso | Detalle |
|------|---------|
| Base de datos | MongoDB 7 en Docker: `docker run -d --name menusemanal-mongo -p 27017:27017 -v menusemanal-mongo-data:/data/db mongo:7` |
| Variables | `.env.local` con `MONGODB_URI`, `NEXTAUTH_SECRET`/`ADMIN_JWT_SECRET` generados, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` |
| Dependencias | `npm install --legacy-peer-deps` (pnpm vía corepack falla por permisos en Program Files; conflicto de peer deps de nodemailer requiere el flag) |
| Datos demo | `node scripts/seed-demo.cjs` |
| Arranque | `npm run dev` → http://localhost:3000 |

Verificado: `/api/test-db` devuelve "Conexión exitosa a MongoDB". App operativa.

## 3. Bugs corregidos

1. **Doble-hash de contraseña en registro** — `app/api/auth/register/route.ts`
   hasheaba la password y además el hook `pre-save` de `User` la volvía a
   hashear → el usuario registrado nunca podía loguearse. Fix: pasar la
   password en texto plano y dejar que el hook la hashee una sola vez.

2. **Hook `pre-save` de `User` con `next()`** — `models/User.ts` definía el hook
   como `async function(next)` y llamaba `next()`; en la versión actual de
   Mongoose un hook async no recibe `next` → `"next is not a function"`, lo que
   rompía **cualquier** alta de usuario (no solo el registro). Fix: hook async
   sin `next`, lanzando el error directamente.

3. **Seed roto** — `app/api/seed-database/route.ts` insertaba
   `casa: "default-casa"` (string) en un campo `ObjectId` requerido → fallaba al
   castear. Fix: crea una `Casa` y un usuario reales (find-or-create) y usa sus
   `ObjectId`.

## 4. Limpieza y actualización

- **Flood de consola:** `app/page.tsx` leía `searchParams.tab` desde la prop
  (deprecado en Next 15) generando ~962 errores en consola. Reescrito para usar
  solo `useSearchParams()`. Verificado en navegador: **0 errores** y desaparece
  el badge "1 Issue".
- **Componente duplicado:** borrado `app/components/HomeContent.tsx` (no se
  importaba en ningún lado; `page.tsx` tiene su propia versión inline).
- **CVE:** Next **15.2.4 → 15.5.19** (CVE-2025-66478). Se mantiene en la línea 15
  (no se saltó a 16 para no arriesgar el demo).
- **next.config.mjs:** `experimental.serverComponentsExternalPackages` →
  `serverExternalPackages` (renombrado en Next 15) y removida la clave inválida
  `middleware`.
- **README.md** nuevo con instrucciones de setup, credenciales demo y la
  advertencia de modo mock.
- **scripts/seed-demo.cjs** nuevo para cargar datos de prueba por CLI.
- `package-lock.json` agregado al `.gitignore` (lockfile canónico es
  `pnpm-lock.yaml`).

## 5. Recorrido funcional (verificado en Brave)

- **Catálogo:** muestra las comidas sembradas con calorías y filtros por tipo.
  `/api/meals` responde 200.
- **Planificador:** el selector de comida (ícono 💡) abre el diálogo, lista el
  catálogo, y al elegir un plato calcula el resumen nutricional del día.

## 6. Decisión: modo mock (NO se tocó la auth)

La app está intencionalmente en "modo demo abierto" (commits previos
"simplify ... for browser extension"):

- `hooks/useAuth.ts` devuelve siempre un usuario falso (`isAuthenticated: true`).
- `middleware.ts` está vacío, no protege rutas.
- Las APIs no validan sesión ni filtran por casa → cualquiera ve/modifica todo.
- `app/api/meals` POST hardcodea `casa: "mock-casa"` (string).

**Decisión del usuario:** dejarlo en modo mock por ahora. **No es apto para
producción.** Revertir implicaría reconectar `useAuth` a NextAuth, agregar
`SessionProvider`, reactivar el middleware y filtrar por casa en todas las APIs.

## 7. Pendientes / notas

- **`pnpm-lock.yaml` desactualizado:** se instaló con npm, así que el lockfile
  canónico sigue apuntando a Next 15.2.4. Regenerar con `pnpm install` cuando
  pnpm esté disponible.
- El branch `fix/local-setup-and-bugs` **no está pusheado ni mergeado**.
  - Merge a master: `git checkout master && git merge fix/local-setup-and-bugs`
  - Push: `git push -u origin fix/local-setup-and-bugs`
- Typo cosmético sin tocar en `next.config.mjs` (comentario `import'next'`).
- `.git` perdido en el home (ver punto 1).

---

# Sesión 2026-06-30 — Revertir modo mock (auth real)

Branch: `fix/local-setup-and-bugs`. Cambios **en el working tree, sin commitear ni
pushear** (sobre el commit `1023201`). Se revirtió el "modo demo abierto" del
punto 6 y se restauró la autenticación real con NextAuth.

## 8. Reversión del modo mock

Estrategia: recuperar las implementaciones originales desde git (commit `34a1c7f`,
anterior a la desactivación de auth) con `git show 34a1c7f:<archivo>`, en vez de
reescribir de cero. Se conservaron los fixes legítimos del branch (doble-hash de
password, hook `pre-save` de `User`, seed con ObjectId real).

Archivos modificados:

- **`hooks/useAuth.ts`** — deja de devolver el usuario falso; envuelve
  `useSession`/`signOut` reales de `next-auth/react`. `isAuthenticated` derivado de
  `status === "authenticated"`.
- **`middleware.ts`** — protección de rutas restaurada con `getToken` de
  `next-auth/jwt`. Rutas sin token → redirect a `/login`. `matcher` excluye `api`,
  `_next/static`, `_next/image`, `favicon.ico`, `login`, `register`. Las rutas
  admin (`/administrador/*`) mantienen su esquema propio (cookie `admin_token`).
- **`app/layout.tsx`** — montado el `SessionProvider` vía `app/components/Providers.tsx`.
  **No** se restauró el `getServerSession + redirect("/login")` del layout original
  porque causaba un bucle de redirección (el root layout también envuelve `/login`);
  la protección queda solo en el middleware.
- **APIs (mock → sesión real + filtro por casa/usuario):** `app/api/meals/route.ts`,
  `meals/[id]/route.ts`, `weeklyMenu/route.ts`, `weeklyMenu/[id]/route.ts`,
  `user/route.ts`, `casa/route.ts`. Validan sesión con `getServerSession(authOptions)`,
  devuelven 401 sin sesión, y filtran/asignan por `session.user.casa.id` /
  `session.user.id`. Quitados los hardcodes `"mock-casa"`/`"mock-user"` y los
  fallbacks a datos mock.

## 9. Bug encontrado en la verificación en caliente

- **`app/login/page.tsx`** hacía `redirect("/")` (resto del modo mock) → con auth
  real generaba un **bucle infinito** `/` → `/login` → `/` y pantalla en blanco.
  Fix: restaurado el original que renderiza `<LoginForm />` dentro de `<Suspense>`.

## 10. Verificación en caliente (Chrome, 2026-06-30)

Con MongoDB en Docker + seed demo (`demo@demo.com` / `demo1234`):

- **Protección de rutas:** `/` sin sesión → redirige a `/login` (log "Acceso denegado
  sin autenticación").
- **Login real:** credenciales demo autentican vía NextAuth → redirige a
  `/?tab=planner` con sesión activa.
- **Planificador y Catálogo:** cargan con la sesión; `/api/meals` 200 con las 5
  comidas del seed filtradas por casa.
- **APIs protegidas devuelven 401 sin sesión** (verificado con curl): `/api/meals`,
  `/api/weeklyMenu`, `/api/user`.
- `npx tsc --noEmit`: 217 errores **preexistentes** (migración Next 15), **0 nuevos**
  introducidos por el revert (verificado contra baseline con `git stash`).

Warnings esperados en dev: `[next-auth][DEBUG_ENABLED]` (por `debug` en development)
y "Credenciales de Google no configuradas" (falta `GOOGLE_CLIENT_ID/SECRET` →
login con Google no funciona, el de credenciales sí).

## 11. Limpieza post-revert (2026-06-30)

- **Archivos mock muertos eliminados** (verificado que no tenían importadores activos):
  `components/MockSession.tsx`, `app/components/MockSession.tsx` y el
  `components/MainLayout.tsx` de nivel superior. `app/page.tsx` importa
  `./components/MainLayout` (= `app/components/MainLayout.tsx`, el activo), así que el
  borrado no afecta el render.
- **Bug de invitaciones corregido** en el POST de `app/api/casa/route.ts`: además de
  pasar solo 3 args a `sendInvitationEmail`, **nunca creaba el registro `Invitation`**,
  así que el token no existía en la DB y la invitación no podía canjearse. Fix: en el
  loop de invitados se genera el token (`crypto.randomBytes`), se crea la `Invitation`
  (find-or-replace por email), se pasa el token al email, y si el envío falla se borra
  la invitación. Replica el patrón de `app/api/casa/invitar/route.ts`.
- Verificado con `npx tsc --noEmit`: 217 → **216** (se eliminó el error de
  `sendInvitationEmail`), sin errores nuevos ni referencias rotas a los archivos
  borrados.

## 12. Revisión con subagentes + hardening (2026-06-30)

Se corrieron subagentes (instalados vía `claude-code-templates`) sobre el revert de auth.

### 12.1 code-reviewer (revisión del commit `2c37f39`)
Veredicto: **APROBADO** para mergear — 0 críticos, 0 altos, 2 medios, 4 bajos. No
hay rutas privadas sin proteger ni IDOR entre casas; ownership en PUT/DELETE correcto.

**Hallazgos aplicados (fixes en el working tree):**
- `app/api/weeklyMenu/route.ts`: el POST devolvía `details: error.message` en el 500
  (fuga de internals) → ahora devuelve solo el mensaje genérico, como el resto de APIs.
- `app/api/weeklyMenu/[id]/route.ts` (PUT) y `app/api/meals/[id]/route.ts` (PUT):
  el spread del body permitía reasignar `casa`/`user` (mass-assignment) → se fuerza
  `casa: existingMenu.casa` / `user: existingMeal.user`.
- `middleware.ts`: el `matcher` no excluía los assets de `public/` (imágenes recibían
  307 a `/login` sin sesión) → se agregó la exclusión de extensiones estáticas.
- `app/api/casa/route.ts`: `Invitation.deleteMany({ email })` borraba invitaciones de
  TODAS las casas → se acotó con `casa: nuevaCasa._id`.
- Verificado con `git stash`: **0 errores de tipos nuevos** introducidos por los fixes.

**Hallazgos NO aplicados (requieren decisión, ver pendientes):**
- **[MEDIO] Scope de `weeklyMenu`:** filtra por `user` mientras `meals` filtra por
  `casa`. No es fuga (es más restrictivo), pero si los menús deben compartirse en la
  casa, los convivientes no ven el menú de otro. **Decisión de producto pendiente.**
- **[BAJO] `middleware.ts` rama admin:** solo valida *presencia* de la cookie
  `admin_token`, no su firma. OK si las vistas/APIs admin verifican el JWT server-side;
  conviene confirmarlo o validar la firma en el middleware.
- **[BAJO] Helper de invitaciones:** `casa/route.ts` y `casa/invitar/route.ts` tienen
  lógica de invitación divergente; conviene extraer un helper compartido.
- Notas de hardening preexistentes (no de este commit): otros `details: error.message`
  en `casa/route.ts` (POST/PUT) e `invitar/route.ts`; `invitar/route.ts:75` devuelve el
  token de invitación en la respuesta; endpoints de dev sin proteger.

### 12.2 test-engineer (plan de testing)
- Creado **`docs/TEST_PLAN.md`** (solo plan, sin instalar nada ni tocar código).
  Recomienda **Vitest** (+ Playwright ya presente para E2E), pirámide ~60/30/10, y
  prioriza P0: aislamiento por casa/usuario (IDOR), autenticación (authorize/callbacks),
  middleware; P1: anti-regresión del doble-hash de password e invitaciones. Incluye
  casos concretos y setup propuesto (mongodb-memory-server, mock de `getServerSession`).
- **El proyecto sigue SIN tests ni runner** — el plan es la referencia para implementarlos.

### 12.3 documentation-expert (README)
- **`README.md`** actualizado: se eliminó el framing de "modo mock / demo abierto"
  (ya no es cierto) y se documentó la autenticación real (login en `/login`, usuario
  demo, Google OAuth opcional, seed necesario para loguearse). Setup y `.env.local`
  conservados.

## 13. Pendientes tras esta sesión

- **Decidir scope de `weeklyMenu`** (`user` vs `casa`) — hallazgo MEDIO del review.
- **Confirmar validación del `admin_token`** (firma JWT, no solo presencia) — hallazgo BAJO.
- **Implementar los tests** según `docs/TEST_PLAN.md` (instalar Vitest, etc.).
- **Errores de tipos de Next 15**: migrar firmas de `params` a `Promise<{...}>`
  en rutas `[id]`, `cookies()` async en rutas admin, e instalar `@types/jsonwebtoken`.
  No bloquean el dev server ni el build (`ignoreBuildErrors: true`), pero impiden un
  `tsc` limpio.
- **Google OAuth:** configurar `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` si se quiere
  login con Google.
- **Crear el PR** (`gh` no está instalado; branch ya pusheado).
- Pendientes previos que siguen vigentes: regenerar `pnpm-lock.yaml` con pnpm,
  typo cosmético en `next.config.mjs`, `.git` perdido en el home (ver punto 1).

## Manejo del entorno

```bash
docker stop menusemanal-mongo     # apagar la base
docker start menusemanal-mongo    # encenderla
npm run dev                       # levantar la app
```
