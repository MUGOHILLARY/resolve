import { useState } from "react";

interface Props {
  onAdd: (website: string) => void;
}

export default function AddWebsiteForm({
  onAdd,
}: Props) {
  const [website, setWebsite] = useState("");

  function submit() {
    const value = website.trim();

    if (!value) return;

    onAdd(value);

    setWebsite("");
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold text-white">
        Add Website
      </h2>

      <div className="flex gap-4">

        <input
          value={website}
          onChange={(e) =>
            setWebsite(e.target.value)
          }
          placeholder="example.com"
          className="flex-1 rounded-lg bg-slate-800 p-3 text-white outline-none"
        />

        <button
          onClick={submit}
          className="rounded-lg bg-teal-600 px-6 text-white hover:bg-teal-700"
        >
          Add
        </button>

      </div>

    </div>
  );
}