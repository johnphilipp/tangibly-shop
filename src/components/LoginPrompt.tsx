import Link from "next/link";
import Background from "./Background";
import Layout from "./Layout";
import { signIn } from "next-auth/react";
export const LoginPrompt = () => {
  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Howdy!
            </h1>
            <p className="mt-12">
              Please{" "}
              <button
                onClick={() => {
                  void signIn("strava");
                }}
                className="underline"
              >
                sign in
              </button>{" "}
              to access the shop. Or checkout out our{" "}
              <Link href="/demo" className="underline">
                interactive demo
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
