export const Column = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className="
			[column-fill:_balance]
			columns-1            /* Mobile (under 768px wide): 1 card per row */
			md:columns-1         /* Tablet (768px - 1023px): 2 cards per row */
			lg:columns-1         /* Laptop (1024px - 1279px): 3 cards per row */
			xl:columns-1         /* Desktop (1280px - 1535px): 4 cards per row */
			2xl:columns-2        /* Extra Large (1536px+): 5 cards per row */
			break-inside-avoid gap-8 inline-block
			[&>*]:mb-8
			"
		>
			{children}
		</div>
	)
}
