import { useSession } from "next-auth/react";
import { LoadingLayout } from "~/components/Loading";
import { LoginPrompt } from "~/components/LoginPrompt";
import Saved from "~/components/saved";

export default function SavedPage() {
  const { status } = useSession();

  if (status === "loading") return <LoadingLayout />;
  if (status === "unauthenticated") return <LoginPrompt />;
  return <Saved />;
}
