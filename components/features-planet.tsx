export default function FeaturesPlanet() {
  return (
    <section className="relative before:absolute before:inset-0 before:-z-20 before:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-20">
            <h2 className="text-3xl font-bold text-gray-200 md:text-4xl">
              Everything you need to explore and thrive in the AI era
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Tinpear helps you learn, build, and scale with AI—whether you're just starting or ready to implement AI into your business.
            </p>
          </div>

          {/* Grid */}
          <div className="grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-gray-800 *:before:[block-size:100vh] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] *:after:absolute *:after:bg-gray-800 *:after:[block-size:1px] *:after:[inline-size:100vw] *:after:[inset-block-start:-1px] *:after:[inset-inline-start:0] md:*:p-10">
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                <span>AI Education</span>
              </h3>
              <p className="text-[15px] text-gray-400">
                Master the foundations and advanced applications of artificial intelligence with structured learning paths and certification programs.
              </p>
            </article>
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                <span>Tinpear Labs</span>
              </h3>
              <p className="text-[15px] text-gray-400">
                Quickly prototype and deploy AI-powered solutions with Tinpear Labs—ideal for businesses and creators.
              </p>
            </article>
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                <span>AI News & Insights</span>
              </h3>
              <p className="text-[15px] text-gray-400">
                Stay ahead with real-time AI news, product reviews, and expert opinions on the latest tools, trends, and breakthroughs.
              </p>
            </article>
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                <span>Custom AI Solutions</span>
              </h3>
              <p className="text-[15px] text-gray-400">
                From automation to personalized recommendation engines—our team helps you integrate tailor-made AI into your operations.
              </p>
            </article>
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                <span>Industry Use Cases</span>
              </h3>
              <p className="text-[15px] text-gray-400">
                Explore how different industries—healthcare, finance, education, and more—are transforming with AI, and how you can too.
              </p>
            </article>
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                <span>Community & Support</span>
              </h3>
              <p className="text-[15px] text-gray-400">
                Join a global network of learners, developers, and businesses innovating with AI. Get help, share projects, and grow together.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
