export const Grid = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="gap-10 grid
        grid-cols-1            /* Mobile (under 768px wide): 1 card per row */
        md:grid-cols-1         /* Tablet (768px - 1023px): 2 cards per row */
        lg:grid-cols-2         /* Laptop (1024px - 1279px): 3 cards per row */
        xl:grid-cols-2         /* Desktop (1280px - 1535px): 4 cards per row */
        2xl:grid-cols-2        /* Extra Large (1536px+): 5 cards per row */">
      {children}
    </div>
  )
}