import { useEffect, useState } from "react";
import { type Design } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";
import { products } from "~/utils/products";

const orders = [
  {
    number: "4376",
    status: "Delivered on January 22, 2021",
    href: "#",
    invoiceHref: "#",
    products: [
      {
        id: 1,
        name: "Machined Brass Puzzle",
        href: "#",
        price: "$95.00",
        color: "Brass",
        size: '3" x 3" x 3"',
        imageSrc:
          "https://tailwindui.com/img/ecommerce-images/order-history-page-07-product-01.jpg",
        imageAlt:
          "Brass puzzle in the shape of a jack with overlapping rounded posts.",
      },
      // More products...
    ],
  },
  // More orders...
];

export default function DesignList() {
  const [allDesigns, setAllDesigns] = useState<Design[] | undefined>(undefined);

  const user = useSession().data?.user;

  const { data: designData } = api.design.getAll.useQuery({
    enabled: user !== undefined,
  });

  useEffect(() => {
    // Set activity data
    if (designData) {
      setAllDesigns(designData.designs);
    }
  }, [designData]);

  const deleteDesign = api.design.delete.useMutation();

  const handleDesignDeletion = async (design: Design) => {
    try {
      // Trigger the mutation and wait for the result
      const data = await deleteDesign.mutateAsync({
        id: design.id,
      });

      if (!data) {
        alert("Error deleting design");
        return;
      }

      if (data.status === "success" && allDesigns) {
        setAllDesigns(allDesigns.filter((item) => item.id !== design.id));
      }

      // Navigate based on product id

      // Set the active design (if design is available)
    } catch (error) {
      console.error("Error deleting design:", error);
      // Handle the error appropriately
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">
              Manage your Designs
            </span>
          </div>
        </div>

        <div className="mt-12 space-y-16 sm:mt-16">
          {orders.map((order) => (
            <section
              key={order.number}
              aria-labelledby={`${order.number}-heading`}
            >
              <div className="-mb-6 mt-6 flow-root divide-y divide-gray-200 border-t border-gray-200">
                {allDesigns?.map((design) => (
                  <div key={design.id} className="py-6 sm:flex">
                    <div className="flex space-x-4 sm:min-w-0 sm:flex-1 sm:space-x-6 lg:space-x-8">
                      <img
                        src={`data:image/svg+xml;base64,${design.previewSvg}`}
                        alt="Product image"
                        className="h-20 w-20 flex-none rounded-md object-contain object-center sm:h-48 sm:w-48"
                      />
                      <div className="min-w-0 flex-1 pt-1.5 sm:pt-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link
                            href={`${products.find(
                              (product) => product.name === design.productType,
                            )?.href}?designId=${design.id}`}
                          >
                            {design.name}
                          </Link>
                        </h3>
                        <p className="truncate text-sm text-gray-500">
                          <span>{design.productType}</span>{" "}
                          <span
                            className="mx-1 text-gray-400"
                            aria-hidden="true"
                          >
                            &middot;
                          </span>{" "}
                          <span>{"200x96mm"}</span>
                        </p>
                        <p className="mt-1 font-medium text-gray-900">{20}</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4 sm:ml-6 sm:mt-0 sm:w-40 sm:flex-none">
                      <Link
                        href={`${products.find(
                          (product) => product.name === design.productType,
                        )?.href}?designId=${design.id}`}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-2.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-full sm:flex-grow-0"
                      >
                        Edit Design
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDesignDeletion(design)}
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-full sm:flex-grow-0"
                      >
                        Delete Design
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
