import type React from "react"
import {
  Home,
  Settings,
  Users,
  ShoppingBag,
  BarChart,
  Package,
  ClipboardList,
  FileText,
  Calendar,
  MessageSquare,
  Headphones,
  HelpCircle,
  LogOut,
} from "react-feather"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<any>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: Users,
  },
  {
    title: "Productos",
    href: "/productos",
    icon: ShoppingBag,
  },
  {
    title: "Estadísticas",
    href: "/estadisticas",
    icon: BarChart,
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Package,
  },
  {
    title: "Órdenes",
    href: "/ordenes",
    icon: ClipboardList,
  },
  {
    title: "Facturas",
    href: "/facturas",
    icon: FileText,
  },
  {
    title: "Calendario",
    href: "/calendario",
    icon: Calendar,
  },
  {
    title: "Mensajes",
    href: "/mensajes",
    icon: MessageSquare,
  },
  {
    title: "Soporte",
    href: "/soporte",
    icon: Headphones,
  },
  {
    title: "Ayuda",
    href: "/ayuda",
    icon: HelpCircle,
  },
  {
    title: "Configuración",
    href: "/configuracion-casa",
    icon: Settings,
  },
  {
    title: "Cerrar Sesión",
    href: "/cerrar-sesion",
    icon: LogOut,
  },
]

const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        {navItems.map((item) => (
          <li key={item.title}>
            <a href={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
