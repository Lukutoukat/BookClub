import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar'
import {Link, useLocation} from 'react-router-dom'
import {type MenuItem} from './PageMenu'
import {type ReactNode} from 'react'
import {PageFooter} from './PageFooter'

interface AppSidebarProps {
	menuItems: MenuItem[]
	children?: ReactNode
}

export function AppSidebar({ menuItems, children }: AppSidebarProps) {
	const location = useLocation()

    return (
		<SidebarProvider>
			<Sidebar variant="inset" collapsible="icon">
				<SidebarContent>
					<SidebarGroup>
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive = location.pathname === item.to
								return (
									<SidebarMenuItem key={item.to}>
										<SidebarMenuButton asChild isActive={isActive}>
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
			</Sidebar>
			<SidebarInset>
                <SidebarTrigger className="mr-auto"/>
                {children}
				<PageFooter />
			</SidebarInset>
		</SidebarProvider>
	)
}
