import { useSession } from "next-auth/react";
import Home from "~/components/Home";
import LandingPage from "~/components/LandingPage";

export default function Main() {
  const { status } = useSession();

  return status === "authenticated" ? <Home /> : <LandingPage />;
}
