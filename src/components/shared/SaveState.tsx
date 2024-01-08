const statuses = {Completed: 'text-green-400 bg-green-400/10', Error: 'text-rose-400 bg-rose-400/10'}
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function SaveState() {

    return (
        <div className="flex items-center justify-end gap-x-2 sm:justify-start">
            <div className={classNames(statuses.Completed, 'flex-none rounded-full p-1')}>
                <div className="h-1.5 w-1.5 rounded-full bg-current"/>
            </div>
            <div className="hidden text-white sm:block">Saved</div>
        </div>
    )}