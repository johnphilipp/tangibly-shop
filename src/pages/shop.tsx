import { useSession } from "next-auth/react";
import { LoadingLayout } from "~/components/Loading";
import { LoginPrompt } from "~/components/LoginPrompt";
import Shop from "~/components/shop";

export default function ShopPage() {
  const { status } = useSession();

  if (status === "loading") return <LoadingLayout />;
  if (status === "unauthenticated") return <LoginPrompt />;
  return <Shop />;
}
