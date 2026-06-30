# Planneat — Menú Semanal

App de planificación de menús semanales: **Next.js 15 (App Router) + React 19 + TypeScript + MongoDB (Mongoose) + NextAuth**.

Permite armar menús de lunes a viernes (almuerzo/cena) a partir de un catálogo de comidas con info nutricional, agrupando usuarios en una "Casa".

## Correr localmente

Requisitos: Node 20+, Docker.

```bash
# 1. Base de datos MongoDB (contenedor local)
docker run -d --name menusemanal-mongo -p 27017:27017 -v menusemanal-mongo-data:/data/db mongo:7

# 2. Variables de entorno: crear .env.local (ver más abajo)

# 3. Dependencias  (--legacy-peer-deps por un conflicto de peer deps de nodemailer)
npm install --legacy-peer-deps

# 4. Datos de prueba + usuario demo (necesario para poder loguearse)
node scripts/seed-demo.cjs
# (o, si tu base no está en la URI por defecto:)
# MONGODB_URI="mongodb://localhost:27017/menusemanal" node scripts/seed-demo.cjs

# 5. Levantar
npm run dev          # http://localhost:3000
```

Manejo del contenedor: `docker stop menusemanal-mongo` / `docker start menusemanal-mongo`.

### `.env.local` mínimo

```env
MONGODB_URI=mongodb://localhost:27017/menusemanal
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ADMIN_JWT_SECRET=<otro secret aleatorio>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Opcionales: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (login con Google),
`HUGGING_FACE_API_KEY` (sugerencias por IA), `EMAILJS_*` (envío de mails).

## Autenticación

La app usa **autenticación real con NextAuth** (estrategia JWT). El acceso está protegido:

- **Login en `/login`** con email y contraseña (provider Credentials).
- `middleware.ts` protege las rutas: sin sesión, redirige a `/login` (las páginas
  `/login` y `/register` son públicas).
- Las rutas de API (`app/api/*`) validan la sesión con `getServerSession` y
  **filtran los datos por casa/usuario**: cada casa solo ve y modifica lo suyo.
  Sin sesión devuelven `401`.

### Usuario demo (tras correr el seed)

- **Email:** `demo@demo.com`
- **Password:** `demo1234`

### Login con Google (opcional)

El provider de Google existe pero está deshabilitado en local: requiere configurar
`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env.local`. Sin esas variables,
solo funciona el login con credenciales (en consola aparece el aviso "Credenciales
de Google no configuradas").

## Notas

- Hay un endpoint `app/api/seed-database` (POST) que recrea datos demo (crea Casa + usuario `demo@demo.com` y comidas).
- `scripts/seed-demo.cjs` hace lo mismo desde la línea de comandos.
