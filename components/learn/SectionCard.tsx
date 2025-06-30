type Props = {
  title: string;
  description: string;
};

export default function SectionCard({ title, description }: Props) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow hover:shadow-md transition bg-white">
      <h2 className="text-xl font-semibold mb-2 text-indigo-700">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
