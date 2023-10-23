import LandingPage from "~/components/LandingPage";
import { useSession } from "next-auth/react";
import EditorPage from "./editor";

export default function Home() {
  const { status } = useSession();

  return status === "authenticated" ? <EditorPage /> : <LandingPage />;
}
