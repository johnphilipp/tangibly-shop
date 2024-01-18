import Link from "next/link";
import { Logo } from "./Logo";

const navigation = {
  shop: [
    { name: "Collage Mug", href: "/mug/collage" },
    { name: "Collage Poster", href: "/collage/poster" },
    { name: "Heatmap Mug", href: "/mug/heatmap" },
    { name: "Heatmap Poster", href: "/heatmap/poster" },
  ],
  saved: [],
  gifting: [],
  legal: [
    { name: "Imprint", href: "/imprint" },
    { name: "Privacy Policy", href: "/privacy-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Logo />
            <p className="text-sm leading-6 text-gray-600">
              Your adventures. Made tangible.
            </p>
          </div>
          <div className="mt-16 grid-cols-2 gap-8 sm:grid xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mt-10 text-sm font-semibold leading-6 text-gray-900 md:mt-0">
                  Shop
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.shop.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="mt-10 md:mt-0">
                <Link
                  href="/saved"
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
                >
                  Saved
                </Link>
              </div>
              <div className="mt-10 md:mt-0">
                <Link
                  href="/gifting"
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
                >
                  Gifting
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex justify-between border-t border-gray-900/10 pt-4 sm:mt-10 lg:mt-12">
          <p className="text-xs leading-5 text-gray-500">
            &copy; 2024 Tangibly
          </p>
          <p className="text-xs leading-5 text-gray-500">
            Made with 💚 in St. Gallen
          </p>
        </div>
      </div>
    </footer>
  );
}
