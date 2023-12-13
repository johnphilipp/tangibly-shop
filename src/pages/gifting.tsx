import { useSession } from "next-auth/react";
import { LoadingLayout } from "~/components/Loading";
import { LoginPrompt } from "~/components/LoginPrompt";
import Gifting from "~/components/gifting";

export default function GiftingPage() {
  const { status } = useSession();

  if (status === "loading") return <LoadingLayout />;
  if (status === "unauthenticated") return <LoginPrompt />;
  return <Gifting />;
}
