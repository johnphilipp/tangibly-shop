import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="bottom-0 mx-auto max-w-7xl border-gray-900/10 py-4 sm:py-6">
      <div className="mb-4 border-t sm:mb-6" />
      <div className="flex justify-between px-4 sm:px-6">
        <p className="text-xs leading-5 text-gray-500">&copy; 2024 Tangibly</p>
        <div>
          <Logo />
        </div>
        <p className="text-xs leading-5 text-gray-500">
          Made with 💚 in St. Gallen
        </p>
      </div>
    </footer>
  );
}
