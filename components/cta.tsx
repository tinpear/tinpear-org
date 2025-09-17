import Image from "next/image";
import Stripes from "@/public/images/stripes-dark.svg";

export default function Cta() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-900"
          data-aos="zoom-y-out"
        >
          {/* Glow */}
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] border-green-500 blur-3xl" />
          </div>
          {/* Stripes illustration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
            aria-hidden="true"
          >
            <Image
              className="max-w-none"
              src={Stripes}
              width={768}
              height={432}
              alt="Stripes"
            />
          </div>

          {/* Content */}
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-6 border-y text-3xl font-bold text-gray-200 [border-image:linear-gradient(to_right,transparent,rgba(103,116,144,0.7),transparent)1] md:mb-12 md:text-4xl">
              Discover how AI can transform your business
            </h2>
            <p className="mx-auto max-w-2xl text-gray-400 md:text-lg mb-8">
              We help companies build custom AI tools, automations, and intelligence systems that actually move the needle.
            </p>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <a
                className="btn group mb-4 w-full bg-gradient-to-t from-green-600 to-green-500 text-white shadow-sm transition hover:brightness-110 sm:mb-0 sm:w-auto"
                href="/for-business"
              >
                <span className="relative inline-flex items-center">
                  Explore Solutions
                  <span className="ml-1 text-blue-300 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
