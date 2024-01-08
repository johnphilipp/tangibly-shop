import {ExclamationTriangleIcon, XMarkIcon} from '@heroicons/react/20/solid'
import {showNoDesignFoundBanner} from "~/components/shop/index";

export default function NoDesignFoundBanner() {
    return (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 pt">
            <div className="flex">
                <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true"/>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        No design found by the given Id. Please create one here first.
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={() => showNoDesignFoundBanner.value = false}
                            className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                        >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
