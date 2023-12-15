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
              {/* <Button className="flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-700">
                New gift
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
