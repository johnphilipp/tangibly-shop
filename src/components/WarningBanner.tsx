import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export default function WarningBanner({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [showBanner, setShowBanner] = useState(true);
  if (!showBanner) return null;

  return (
    <div className="pointer-events-none my-4 sm:flex sm:justify-center">
      <div className="pointer-events-auto flex items-center justify-between gap-x-6 rounded-md border border-red-100 bg-red-50 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
        <p className="text-sm leading-6 text-red-800">
          <strong className="font-semibold">{title}</strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          {text}
        </p>
        <button
          type="button"
          className="-m-1.5 flex-none p-1.5"
          onClick={() => setShowBanner(false)}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon className="h-5 w-5 text-red-800" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
