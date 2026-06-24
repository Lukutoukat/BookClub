export const Column = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className="
			[column-fill:_balance]
			columns-1
			2xl:columns-2
			3xl:columns-3
			[&>*]:break-inside-avoid 2xl:gap-8
			[&>*]:mb-4 2xl:[&>*]:mb-8
			"
		>
			{children}
		</div>
	)
}
