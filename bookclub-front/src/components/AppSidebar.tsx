import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Link, useLocation } from 'react-router-dom'
import { type MenuItem } from './PageMenu'

interface AppSidebarProps {
  menuItems: MenuItem[]
}

export function AppSidebar({ menuItems }: AppSidebarProps) {
  const location = useLocation()

  return (
    <SidebarProvider className="min-h-auto h-auto">
        <Sidebar>
        <SidebarHeader />
        <SidebarContent>
            <SidebarGroup>
            <SidebarMenu>
                {menuItems.map((item) => {
                const isActive = location.pathname === item.to
                return (
                    <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                    >
                        <Link to={item.to} className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                )
                })}
            </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        </Sidebar>
    </SidebarProvider>
  )
}