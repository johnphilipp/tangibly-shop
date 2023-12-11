import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Background from "~/components/Background";
import Layout from "~/components/Layout";

export default function Dashboard() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome, {user!.name!.split(" ")[0]}!
            </h1>

            <div className="sm:flex sm:items-baseline sm:justify-between">
              <h2 className="mt-12 text-2xl font-bold tracking-tight text-gray-900">
                Let&apos;s get started
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
              <div className="group aspect-h-1 aspect-w-2 overflow-hidden rounded-lg sm:aspect-h-1 sm:aspect-w-1 sm:row-span-2">
                <Image
                  src="/products/collage/mug.png"
                  alt="Two models wearing women's black cotton crewneck tee and off-white cotton crewneck tee."
                  className="object-cover object-center group-hover:opacity-75"
                  width={1000}
                  height={1000}
                />
                <div
                  aria-hidden="true"
                  className="bg-gradient-to-b from-transparent to-black opacity-50"
                />
                <div className="flex items-end p-6">
                  <div>
                    <h3 className="font-semibold text-white">
                      <Link href="/shop">
                        <span className="absolute inset-0" />
                        Shop
                      </Link>
                    </h3>
                    <p aria-hidden="true" className="mt-1 text-sm text-white">
                      Create and shop your personalized sports gear
                    </p>
                  </div>
                </div>
              </div>
              <div className="group aspect-h-1 aspect-w-2 overflow-hidden rounded-lg sm:aspect-none sm:relative sm:h-full">
                <Image
                  src="/products/heatmap/poster.png"
                  alt="Wooden shelf with gray and olive drab green baseball caps, next to wooden clothes hanger with sweaters."
                  className="object-cover object-center group-hover:opacity-75 sm:absolute sm:inset-0 sm:h-full sm:w-full"
                  width={1000}
                  height={1000}
                />
                <div
                  aria-hidden="true"
                  className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"
                />
                <div className="flex items-end p-6 sm:absolute sm:inset-0">
                  <div>
                    <h3 className="font-semibold text-white">
                      <Link href="/saved">
                        <span className="absolute inset-0" />
                        Saved
                      </Link>
                    </h3>
                    <p aria-hidden="true" className="mt-1 text-sm text-white">
                      Jump right back in where you left off
                    </p>
                  </div>
                </div>
              </div>
              <div className="group aspect-h-1 aspect-w-2 overflow-hidden rounded-lg sm:aspect-none sm:relative sm:h-full">
                <Image
                  src="/gift.jpg"
                  alt="Walnut desk organizer set with white modular trays, next to porcelain mug on wooden desk."
                  className="object-cover object-center group-hover:opacity-75 sm:absolute sm:inset-0 sm:h-full sm:w-full"
                  width={1000}
                  height={1000}
                />
                <div
                  aria-hidden="true"
                  className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"
                />
                <div className="flex items-end p-6 sm:absolute sm:inset-0">
                  <div>
                    <h3 className="font-semibold text-white">
                      <Link href="/gifting">
                        <span className="absolute inset-0" />
                        Gifting
                      </Link>
                    </h3>
                    <p aria-hidden="true" className="mt-1 text-sm text-white">
                      Send a personalized gift to your loved ones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
