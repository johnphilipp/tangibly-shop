import Button from "../Button";
import { useState } from "react";
import { LoadingSpinner } from "~/components/Loading";
import { api } from "~/utils/api";

interface InterestedModalProps {
  onClose: () => void;
  svg: string;
}

export function InterestedModal({ onClose, svg }: InterestedModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  //const sendEmailRequest = api.token.token.useQuery({email: email});

  const register = api.mail.registerUserForMail.useMutation();
  //const sendEmail = api.token.token.useQuery({email: email});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const data = register.mutateAsync({ email: email, svg: svg });
    e.preventDefault();
    setIsLoading(true);

    void data.then((value) => {
      if (!emailRegex.test(email) || !email) {
        setError("Please use a valid e-mail address.");
        setIsLoading(false);
      } else {
        setError(null);
        setIsLoading(false);
        if (value.status === "success") {
          setSuccess(value.message);
          setError(null);
        } else if (value.status === error) {
          setError("Something went wrong ;(");
          setSuccess(null);
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setError(value.message);
          setSuccess(null);
        }
      }
    });
    //const result = data;
  };

  return (
    <div className="fixed left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-140 m-4 rounded-lg border bg-white p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="max-w-sm">
          <label
            htmlFor="email"
            className="text-base font-semibold text-gray-900"
          >
            Pre-order ❤️
          </label>
          <div className="mt-1 text-sm text-gray-500">
            <p>
              We&apos;ll send you an email with your design and let you know
              once orders are open. We&apos;d be delighted to have you on board!
            </p>
          </div>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={handleChange}
            className="mt-3 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="you@example.com"
            required
          />
          {error && <p className="mt-2 text-red-500">{error}</p>}
          {success && <p className="mt-2 text-green-600">{success}</p>}
          <div className="mt-3 flex items-center justify-between gap-4">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
            <Button
              type="submit"
              className="w-full bg-gray-900 text-white hover:bg-gray-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size={24} />
                </div>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
