import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import bookclubService from "@/services/bookclubs";
import { ButtonDialog } from "./ButtonDialog";
type Bookclub = {
  id: number;
  name: string;
  invite_code: string;
};

type Props = {
  bookclubId: string;
};

export const BookclubComponent = ({ bookclubId }: Props) => {
  const [bookclub, setBookclub] = useState<Bookclub | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return null;
  if (!bookclub) return <div>Book club not found</div>;

  const handleDeletion = async (
    event: React.SyntheticEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    try {
      await bookclubService.remove(bookclub.id);
      await navigate("/home", { replace: true });
    } catch (error) {
      console.error("error during deletion", error);
    }
  };

  return (
    <>
      <PageHeader
        badgeText="Club"
        title={bookclub.name}
        description="Suggest books and decide your next read together."
        buttonText={bookclub.invite_code}
        afterButtonClick="alert"
        buttonOnClick={async () => {
          try {
            await navigator.clipboard.writeText(bookclub.invite_code);
          } catch {}
        }}
      />
      <div className="card-actions">
        <ButtonDialog
          buttonText="Delete"
          buttonOnClick={handleDeletion}
          alertDialogDescription="Once the book club is deleted, it cannot be undone."
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8" />
    </>
  );
};
