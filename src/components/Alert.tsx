import Image from "next/image";
import Link from "next/link";

// TODO: Disable this if a local storage key is set (dunno how but somehow) or if user is in db and has been sent this alert before

export default function Alert({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const alertClassNames = show ? "fade-in" : "invisible";

  if (!show) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 shadow-2xl ${alertClassNames}`}
    >
      <div className="pointer-events-auto ml-auto max-w-md overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-900/10">
        <Image
          src="/gift.jpg"
          width={600}
          height={600}
          alt="strava gift ideas"
        />
        <div className="p-6">
          <p className="text-sm leading-6 text-gray-900">
            Birthday soon? Tangibly makes for amazing{" "}
            <Link href="#" className="font-semibold text-indigo-600">
              personalized gifts
            </Link>{" "}
            for your active friends & family.
          </p>
          <div className="mt-4 flex items-center gap-x-5">
            <Link
              type="button"
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              href="https://forms.gle/Ta16eF5WdmATjXXs6"
              target="_blank"
            >
              Request this feature :)
            </Link>
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              onClick={onClose}
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
