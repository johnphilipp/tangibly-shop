import humanFormat from "human-format";
import Button from "../Button";
import EmailInput from "~/components/EmailInput";

export const timeScale = new humanFormat.Scale({
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2592000,
});

export function InterestedModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-140 rounded-lg border bg-white p-8">
        <EmailInput />
        <Button onClick={onClose}>Close</Button>

    </div>
    </div>
  );
}
