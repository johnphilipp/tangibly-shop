import Background from "~/components/Background";
import Layout from "~/components/Layout";
import Fabric from "~/components/fabric/Fabric";

export default function FabricPage() {
  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <Fabric />
        </div>
      </div>
    </Layout>
  );
}
