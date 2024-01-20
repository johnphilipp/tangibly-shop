import Link from "next/link";
import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl border-gray-900/10 py-4 sm:py-6">
      <div className="mb-4 border-t sm:mb-6" />
      <div className="flex justify-between px-4 sm:px-6">
        <p className="text-xs leading-5 text-gray-500">&copy; 2024 Tangibly</p>
        <div>
          <Logo />
        </div>
        <div className="z-10 space-x-4 text-xs leading-5 text-gray-500 sm:space-x-6">
          <Link href="/imprint" className="underline">
            Imprint
          </Link>
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
