interface Props {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ label, type = "text", value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-300
                   focus:ring-2 focus:ring-black focus:outline-none
                   transition"
      />
    </div>
  );
}
