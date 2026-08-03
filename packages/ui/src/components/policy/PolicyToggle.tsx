interface Props {

  label: string;

  checked: boolean;

  onChange: () => void;

}

export default function PolicyToggle({

  label,

  checked,

  onChange

}: Props) {

  return (

    <label className="flex items-center justify-between rounded-lg border p-4">

      <span>{label}</span>

      <input

        type="checkbox"

        checked={checked}

        onChange={onChange}

      />

    </label>

  );

}