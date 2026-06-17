import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays } from "date-fns";
import { Button } from "./ui/button";
import { RangeCalendarComponent } from "./RangeCalendarComponent";
import { type DateRange } from "react-day-picker";
import cycleService, { type CreateCycle } from "../services/cycle";

type Bookclub = {
  id: number;
  name: string;
  invite_code: string;
};

type Props = {
  bookclubId: string;
};

export const NewCycle = ({ bookclubId }: Props) => {
  const [bookclub, setBookclub] = useState<Bookclub | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(new Date()), 14),
    to: addDays(new Date(new Date()), 28),
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookclub = async () => {
      try {
        const res = await fetch(`/api/bookclubs/${bookclubId}`);

        if (!res.ok) {
          setBookclub(null);
          return;
        }

        const data = (await res.json()) as Bookclub;
        setBookclub(data);
      } finally {
        setLoading(false);
      }
    };

    if (bookclubId) void fetchBookclub();
  }, [bookclubId]);

  const handleCreate = async () => {
    if (dateRange?.from && dateRange?.to) {
      const createdcycle: CreateCycle = {
        bookclub_id: bookclubId,
        proposalEnd: dateRange.from,
        votingEnd: dateRange.to,
      };
      try {
        await cycleService.create(createdcycle);
        await navigate(`/club/${bookclubId}`);
      } catch (error) {
        console.error("Failed to create cycle:", error);
      }
    }
  };

  if (loading) return null;
  if (!bookclub) return <div>Bookclub not found</div>;
  return (
    <>
      <RangeCalendarComponent dateRange={dateRange} setDateRange={setDateRange}>
        <Button onClick={handleCreate} className="w-fit self-end mx-4">Create</Button>
      </RangeCalendarComponent>
    </>
  );
};
