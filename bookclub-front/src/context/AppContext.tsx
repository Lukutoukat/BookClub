import type { LoggedInUser } from '@/services/login.ts'
import { createContext, type ReactNode } from 'react'

interface AppContextType {
	user?: LoggedInUser
}

export const AppContext = createContext<AppContextType>({})

/**
 * App provider for useful global context within the app. Currently exposes the user.
 */
export const AppProvider = ({ user, children }: { user?: LoggedInUser, children: ReactNode }) => {
	return <AppContext.Provider value={{ user }}>
		{children}
	</AppContext.Provider>
}