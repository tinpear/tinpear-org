export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Samuel Johnson",
      role: "Student",
      quote:
        "Tinpear made learning AI feel like a fun weekend project. I finally understand how machine learning works — and I built my first AI project!",
    },
    {
      name: "Sailat Raheem",
      role: "Data Intern",
      quote:
        "The courses are clear, visual, and surprisingly motivating. I finished 'Prompt Engineering' in one night and used it to build a chatbot.",
    },
    {
      name: "Aisha Bello",
      role: "Product Designer",
      quote:
        "Even without a coding background, I grasped deep learning concepts for the first time. Tinpear breaks it down beautifully.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
          What Learners Are Saying
        </h2>

        <div className="space-y-10">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-lg shadow">
              <p className="text-lg md:text-xl italic text-gray-700 mb-4">
                “{t.quote}”
              </p>
              <div className="text-sm text-gray-600 font-medium">
                <span className="text-gray-800">{t.name}</span>{" "}
                <span className="text-gray-400">/</span>{" "}
                <span className="text-green-500">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
