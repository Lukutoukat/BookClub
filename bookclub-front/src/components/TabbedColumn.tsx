import { Card, CardContent } from './ui/card'
import React, { useState } from 'react'
import { Tabs } from 'radix-ui'
import { Badge } from '@/components/ui/badge.tsx'
import { useSearchParams } from 'react-router-dom'

export interface Tab<Id extends string = string> {
	id: Id
	label: string
	content: React.ReactNode
}

interface TabbedColumnProps<Id extends string> {
	tabs: Tab<Id>[]
}

export const TabbedColumn = <Id extends string>({ tabs }: TabbedColumnProps<Id>) => {
	const defaultTab = tabs[0]?.id ?? 'unknown';
	const [searchParams, setSearchParams] = useSearchParams()
	const [currentTab, setCurrentTab] = useState<string>(searchParams.get('tab') ?? defaultTab)
	const [visited, setVisited] = useState<string[]>([])

	const setTab = (tab: string) => {
		setCurrentTab(tab)
		setSearchParams({tab: tab})
		if (!visited.includes(tab)) {
			visited.push(tab)
			setVisited(visited)
		}
	}

	return (
		<Tabs.Root
			className="flex flex-col gap-5"
			value={currentTab}
			onValueChange={(value) => setTab(value)}
		>
			<Tabs.List>
				<Card size="sm">
					<CardContent className="flex gap-1 overflow-scroll">
						{tabs.map((tab) => (
							<Tabs.Trigger key={tab.id} value={tab.id}>
								<Badge className="text-base" variant={tab.id === currentTab ? 'default' : 'ghost'}>
									{tab.label}
								</Badge>
							</Tabs.Trigger>
						))}
					</CardContent>
				</Card>
			</Tabs.List>

			<div>
				{tabs.map((tab) => (
					<Tabs.Content
						className={tab.id !== currentTab ? "hidden" : ""}
						key={tab.id}
						value={tab.id}
						forceMount={visited.includes(tab.id) ? true : undefined}
					>
						{tab.content}
					</Tabs.Content>
				))}
			</div>
		</Tabs.Root>
	)
}