import {useState} from "react";
import {api} from "~/utils/api";


export default function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  //const sendEmailRequest = api.token.token.useQuery({email: email});

  const { data, refetch } = api.mail.registerUserForMail.useQuery({email: email}, {enabled: false})
  //const sendEmail = api.token.token.useQuery({email: email});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailRegex.test(email) || !email) {
      setError("Please use a valid @student.unisg.ch e-mail address.")
    } else {
      setError(null);
      const res = refetch().then(r => {
        if (r.data?.status === "success") {
        setSuccess(r.data.message);
        setError(null)
      } else if (!result) {
        setError('Something went wrong ;(');
        setSuccess(null)
      } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
          setError(r.data.message);
        setSuccess(null)
      }
      });
      const result = data;

      console.log(result);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="pt-4 pb-2 space-y-8 max-w-sm ml-2">
      <label htmlFor="email" className="block text-lg">Email:</label>
      <input
        type="email"
        name="email"
        id="email"
        value={email}
        onChange={handleChange}
        className="block w-full rounded-md border-gray-200 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder="your@email.com"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <button type="submit" className="p-2 bg-blue-500 text-white rounded">
        Submit
      </button>
    </form>
  )
}