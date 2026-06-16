import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";

type Props = {
  bookclubId: string;
};

export const bookClubGoCycleSetting = ({ bookclubId }: Props) => {
  return (
    <Card className="card-base">
      <SectionHeader title="Manage your book club" />
      <div className="flex gap-2 md:gap-4 px-4 sm:px-6 md:px-8">
        <Button asChild className="flex-1 min-w-0">
          <Link to={`/newcycle/${bookclubId}`}>Manage cycle</Link>
        </Button>
        <Button asChild className="flex-1 min-w-0">
          <Link to="/bookclubsettings">Manage club</Link>
        </Button>
      </div>
    </Card>
  );
};

export default bookClubGoCycleSetting;
