import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { type MenuItem } from "./PageMenu";

interface AppNavbarProps {
  menuItems: MenuItem[];
  children: React.ReactNode;
}

/**
 * AppNavbar is the mobile navigation component.
 * Displays a fixed bottom menu for mobile screens.
 */
export const AppNavbar = ({ menuItems, children }: AppNavbarProps) => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updatePadding = () => {
      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
      const scrollHeight = document.documentElement.scrollHeight;
      const visibleHeight = window.innerHeight - navHeight;
      const needsPadding = scrollHeight > visibleHeight;

      document.body.style.paddingBottom = needsPadding ? `${navHeight}px` : "";
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePadding)
        : null;
    if (observer) {
      observer.observe(document.documentElement);
      observer.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", updatePadding);
      observer?.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [location.pathname]);

  return (
    <>
      <main>{children}</main>
      <div
        ref={navRef}
        className="fixed inset-x-0 bottom-0 top-auto z-50 border-t bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <nav className="mx-auto flex max-w-md items-center justify-around px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Button
                key={item.to}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="flex h-16 w-16 flex-col items-center justify-center gap-2 text-xs"
              >
                <Link to={item.to}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
