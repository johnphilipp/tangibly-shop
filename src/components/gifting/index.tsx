import Background from "~/components/Background";
import Layout from "~/components/Layout";

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
          </div>
        </div>
      </div>
    </Layout>
  );
}
