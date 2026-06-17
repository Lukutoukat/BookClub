/*
This component is used to display the footer of the page. It contains a link to the GitHub repository and uses lucide icons. It is used by the AppSidebar component to display only on desktop.
*/

import { Users } from "lucide-react";

export const PageFooter = () => {
  return (
    <footer className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background/85 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
        <Users size={16} />
        <a
          href="https://github.com/Lukutoukat/BookClub"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          GitHub
        </a>
    </footer>
  );
};
