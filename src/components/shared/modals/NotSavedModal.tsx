import { useRouter } from "next/router";
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BookmarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { activeDesign } from "~/components/shared/utils/data";

export interface UnsavedChangesDialogProps {
  shouldConfirmLeave: boolean;
  handleSave: () => Promise<void>;
}

export const NotSavedModal = ({
  shouldConfirmLeave,
  handleSave,
}: UnsavedChangesDialogProps): ReactElement<UnsavedChangesDialogProps> => {
  const [shouldShowLeaveConfirmDialog, setShouldShowLeaveConfirmDialog] =
    useState(false);
  const [nextRouterPath, setNextRouterPath] = useState<string>("/");

  const router = useRouter();

  const cancelButtonRef = useRef(null);

  const onRouteChangeStart = useCallback(
    (nextPath: string) => {
      if (!shouldConfirmLeave) {
        return;
      }

      setShouldShowLeaveConfirmDialog(true);
      setNextRouterPath(nextPath);

      throw "cancelRouteChange";
    },
    [shouldConfirmLeave],
  );

  const onRejectRouteChange = () => {
    setNextRouterPath("/");
    setShouldShowLeaveConfirmDialog(false);
  };

  const onConfirmRouteChange = () => {
    setShouldShowLeaveConfirmDialog(false);
    // simply remove the listener here so that it doesn't get triggered when we push the new route.
    // This assumes that the component will be removed anyway as the route changes
    removeListener();
    void router.push(nextRouterPath);
  };

  const onConfirmSave = async () => {
    await handleSave();
    onConfirmRouteChange();
  };

  const removeListener = () => {
    router.events.off("routeChangeStart", onRouteChangeStart);
  };

  useEffect(() => {
    router.events.on("routeChangeStart", onRouteChangeStart);

    return removeListener;
  }, [onRouteChangeStart]);
  return (
    <Transition.Root show={shouldShowLeaveConfirmDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={onRejectRouteChange}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <button
                    className="absolute right-0 top-0 mr-2 mt-2 inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    onClick={() => onRejectRouteChange()}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">Close</span>
                  </button>

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-yellow-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Design &quot;
                      <span className="font-bold text-blue-900">
                        {activeDesign.value?.name}
                      </span>
                      &quot; not saved yet
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hey pal, you haven&apos;t saved your design yet. Are you
                        sure you want to leave?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={() => onConfirmSave()}
                  >
                    <BookmarkIcon className="mr-2 inline-block h-5 w-5" />
                    Save and leave
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => onConfirmRouteChange()}
                    ref={cancelButtonRef}
                  >
                    <TrashIcon className="mr-2 inline-block h-5 w-5" />I
                    don&apos;t care
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
