import Image from "next/image";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";
import { router } from "next/client";
import { useRouter } from "next/router";
import DesignList from "~/components/DesignList";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Design } from "@prisma/client";

type Product = {
  id: number;
  name: string;
  href: string;
  kind: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  color: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Collage",
    href: "/collage",
    kind: "mug",
    imageSrc: "/collage-2.png",
    imageAlt: "Your GPS tracks merged into a collage",
    price: "€15",
    color: "Your GPS tracks merged into a unique collage",
  },
  {
    id: 2,
    name: "Heatmap",
    kind: "mug",
    href: "/heatmap",
    imageSrc: "/bubbles-3.png",
    imageAlt: "Your activity time plotted as a heatmap",
    price: "€15",
    color: "Your activity time plotted as a unique heatmap",
  },
  {
    id: 3,
    name: "Coffee cup",
    kind: "mug",
    href: "/editor",
    imageSrc: "/collage-2.png",
    imageAlt: "Front of men's Basic Tee in black.",
    price: "€15",
    color: "Your GPS tracks merged into a unique collage",
  },
];

export default function Dashboard() {
  const router = useRouter();

  // Assuming useMutation is from a library like React Query
  // and you have already set it up correctly in your component
  const mutation = api.design.create.useMutation();

  const handleDesignCreation = async (product: Product) => {
    try {
      // Trigger the mutation and wait for the result
      const data = await mutation.mutateAsync({
        productType: product.kind,
        designType: product.name,
        collageType: product.name,
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
            <DesignList />
          </div>
        </div>
      </div>
    </Layout>
  );
}
