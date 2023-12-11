import { PlusCircleIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { useState } from "react";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import Button from "../Button";

interface Gifting {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Gifting() {
  const [allGiftings, setAllGiftings] = useState<Gifting[]>([
    {
      id: 1,
      name: "Gift 1",
      description: "Description 1",
      price: 10,
      imageUrl: "/gift.jpg",
    },
    {
      id: 2,
      name: "Gift 2",
      description: "Description 2",
      price: 20,
      imageUrl: "/gift.jpg",
    },
    {
      id: 3,
      name: "Gift 3",
      description: "Description 3",
      price: 30,
      imageUrl: "/gift.jpg",
    },
  ]);

  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Gifting
            </h1>

            <div className="mt-12 flex justify-between space-x-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Coming soon!
              </h2>
              <Button className="flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-700">
                New gift
              </Button>
            </div>

            <div className="h-8" />

            {allGiftings.length === 0 && (
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PlusCircleIcon
                  className="mx-auto h-12 w-12 text-gray-400"
                  aria-hidden="true"
                />
                <span className="mt-2 block text-sm font-semibold text-gray-700">
                  New gift
                </span>
              </button>
            )}

            <div className="grid grid-cols-1 gap-4">
              {allGiftings.map((item) => (
                <div
                  key={item.id}
                  className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-gray-400"
                >
                  <div className="flex-shrink-0">
                    <Image
                      className="h-16 w-16 rounded-full"
                      src={item.imageUrl}
                      alt=""
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a href="#" className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {item.price}
                      </p>
                    </a>
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
