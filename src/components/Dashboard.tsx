import Image from "next/image";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import DesignList from "~/components/DesignList";
import type { Product } from "~/utils/products";
import { products } from "~/utils/products";

type ProductMapping = Record<string, Product[]>;

export default function Dashboard() {
  const router = useRouter();
  const mutation = api.design.create.useMutation();

  const handleDesignCreation = async (product: Product) => {
    try {
      // Trigger the mutation and wait for the result
      const data = await mutation.mutateAsync({
        designType: product.name,
      });

      if (!data) {
        alert("Error creating design");
        return;
      }

      void router.push(`${product.href}?designId=${data.id}`);
      // Navigate based on product id

      // Set the active design (if design is available)
    } catch (error) {
      console.error("Error creating design:", error);
      // Handle the error appropriately
    }
  };

  const getProductMapping = (products: Product[]): ProductMapping => {
    return products.reduce<ProductMapping>((acc, product) => {
      if (!acc[product.kind]) {
        acc[product.kind] = [];
      }

      acc[product.kind]!.push(product);
      return acc;
    }, {});
  };

  const productMapping = getProductMapping(products);

  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              One click away – Your personalized sports activities
            </h1>

            {Object.entries(productMapping).map(([kind, productsOfKind]) => (
              <div key={kind}>
                <h2 className="mt-12 text-2xl font-bold tracking-tight text-gray-900">
                  {kind[0]?.toUpperCase() + kind.slice(1)}s
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:gap-x-8">
                  {productsOfKind.map((product: Product) => (
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
                            <a onClick={() => handleDesignCreation(product)}>
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
            ))}
            <DesignList />
          </div>
        </div>
      </div>
    </Layout>
  );
}
