import NextAuth, { type AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Invitation from "@/models/Invitation"
import { logger } from "@/lib/logger"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET debe estar configurado")
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  logger.warn("Credenciales de Google no configuradas, usando valores de respaldo")
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        await dbConnect()

        // Asegurarse de que los modelos estén registrados
        require("@/models/Casa")
        require("@/models/User")
        require("@/models/Invitation")

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password").populate("casa")

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("Credenciales inválidas")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split("@")[0],
          casa: user.casa
            ? {
                id: user.casa._id.toString(),
                nombre: user.casa.nombre,
              }
            : null,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect()

        // Asegurarse de que los modelos estén registrados
        require("@/models/Casa")
        require("@/models/User")
        require("@/models/Invitation")

        logger.info(`Intento de inicio de sesión: ${user.email} via ${account?.provider}`)

        if (account?.provider === "google") {
          // Asegurarse de que el email esté en minúsculas
          const email = user.email?.toLowerCase()
          if (!email) {
            logger.error("No se proporcionó email en la cuenta de Google")
            return false
          }

          // Buscar usuario existente por email o googleId
          let dbUser = await User.findOne({
            $or: [
              { email },
              { googleId: profile.sub }, // Usar sub en lugar de id
            ],
          })

          if (!dbUser) {
            logger.info(`Creando nuevo usuario para: ${email}`)
            // Crear nuevo usuario
            dbUser = await User.create({
              email,
              name: profile.name,
              googleId: profile.sub,
              emailVerified: profile.email_verified,
            })
          } else {
            logger.info(`Actualizando usuario existente: ${email}`)
            // Actualizar información del usuario
            dbUser.name = profile.name || dbUser.name
            dbUser.googleId = profile.sub
            dbUser.emailVerified = profile.email_verified || dbUser.emailVerified
            await dbUser.save()
          }

          // Buscar invitación pendiente
          const invitation = await Invitation.findOne({
            email,
            used: false,
          }).populate("casa")

          if (invitation && !dbUser.casa) {
            logger.info(`Asignando casa a usuario: ${email}`)
            dbUser.casa = invitation.casa._id
            await dbUser.save()

            invitation.used = true
            await invitation.save()
          }

          // Cargar la información de la casa si existe
          if (dbUser.casa) {
            await dbUser.populate("casa")
          }

          // Actualizar el objeto user con la información de la base de datos
          user.id = dbUser._id.toString()
          user.name = dbUser.name
          user.email = dbUser.email
          if (dbUser.casa) {
            user.casa = {
              id: dbUser.casa._id.toString(),
              nombre: dbUser.casa.nombre,
            }
          }
        }

        logger.info(`Inicio de sesión exitoso: ${user.email}`)
        return true
      } catch (error) {
        logger.error("Error en signIn:", error)
        return false
      }
    },
    async jwt({ token, user, account, profile }) {
      try {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.casa = user.casa
        }
        return token
      } catch (error) {
        logger.error("Error en jwt callback:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.casa = token.casa as { id: string; nombre: string } | null

          if (!session.user.casa) {
            await dbConnect()
            // Asegurarse de que los modelos estén registrados
            require("@/models/Casa")
            require("@/models/User")

            const user = await User.findById(token.id).populate("casa")
            if (user?.casa) {
              session.user.casa = {
                id: user.casa._id.toString(),
                nombre: user.casa.nombre,
              }
            }
          }
        }
        return session
      } catch (error) {
        logger.error("Error en session callback:", error)
        return session
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
