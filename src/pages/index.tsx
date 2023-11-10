import { useSession } from "next-auth/react";
import Dashboard from "~/components/Dashboard";
import LandingPage from "~/components/LandingPage";

export default function Home() {
  const { status } = useSession();

  return status === "authenticated" ? <Dashboard /> : <LandingPage />;
}
