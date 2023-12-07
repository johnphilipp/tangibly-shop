import Image from "next/image";
import Background from "~/components/Background";
import Layout from "~/components/Layout";

const products = [
  {
    id: 1,
    name: "Collage",
    href: "/collage",
    imageSrc: "/collage-2.png",
    imageAlt: "Your GPS tracks merged into a collage",
    price: "€15",
    color: "Your GPS tracks merged into a unique collage",
  },
  {
    id: 2,
    name: "Heatmap",
    href: "/heatmap",
    imageSrc: "/bubbles-3.png",
    imageAlt: "Your activity time plotted as a heatmap",
    price: "€15",
    color: "Your activity time plotted as a unique heatmap",
  },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              One click away – Your personalized sports activities
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:gap-x-8">
              {products.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                    <Image
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                      width={1000}
                      height={1000}
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-gray-700">
                        <a href={product.href}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {product.name}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.color}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
