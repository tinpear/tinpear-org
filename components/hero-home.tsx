import Image from "next/image";
import PageIllustration from "@/components/page-illustration";


export default function HeroHome() {
  return (
    <section className="relative">
      <PageIllustration />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            {/* Logo strip */}
            <div
              className="mb-6 border-y border-transparent [border-image:linear-gradient(to_right,transparent,rgba(203,213,225,0.8),transparent)1]"
              data-aos="zoom-y-out"
            >
              <div className="-mx-0.5 flex justify-center">
                <Image
                  src="/logok.png"
                  width={48}
                  height={48}
                  alt="Tinpear Logo"
                  className="rounded-full border-2 border-white shadow-md [image-rendering:crisp-edges]"
                />
              </div>
            </div>

            {/* Main heading */}
            <h1
              className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              Build Smart With <span className="text-green-600">Tinpear</span>
              <br className="max-lg:hidden" />
              — where ideas grow tech.
            </h1>

            {/* Sub text */}
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-lg text-gray-700"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                Tinpear is a fast, AI-enhanced platform to launch and manage smart products, dashboards, and automation workflows — without complexity.
              </p>

              {/* CTA Buttons */}
              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,rgba(203,213,225,0.8),transparent)1]">
                <div
                  className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  <a
                    className="btn group mb-4 w-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm transition-all hover:brightness-110 sm:mb-0 sm:w-auto"
                    href="#0"
                  >
                    <span className="relative inline-flex items-center">
                      Try Tinpear
                      <span className="ml-1 text-green-200 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </a>
                  <a
                    className="btn w-full bg-white text-gray-800 shadow-sm hover:bg-gray-50 sm:ml-4 sm:w-auto"
                    href="#0"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Hero terminal mockup */}
          <div
            className="mx-auto max-w-3xl"
            data-aos="zoom-y-out"
            data-aos-delay={600}
          >
            <div className="relative aspect-video rounded-2xl bg-gray-900 px-5 py-3 shadow-xl before:pointer-events-none before:absolute before:-inset-5 before:border-y before:[border-image:linear-gradient(to_right,transparent,rgba(203,213,225,0.8),transparent)1] after:absolute after:-inset-5 after:-z-10 after:border-x after:[border-image:linear-gradient(to_bottom,transparent,rgba(203,213,225,0.8),transparent)1]">
              <div className="relative mb-8 flex items-center justify-between before:block before:h-[9px] before:w-[41px] before:bg-[length:16px_9px] before:[background-image:radial-gradient(circle_at_4.5px_4.5px,var(--color-gray-600)_4.5px,transparent_0)] after:w-[41px]">
                <span className="text-[13px] font-medium text-white">tinpear.dev</span>
              </div>
              <div className="font-mono text-gray-500 [&_span]:opacity-0">
                <span className="animate-[code-1_10s_infinite] text-gray-200">
                  tinpear init --project
                </span>{" "}
                <span className="animate-[code-2_10s_infinite]">--with=ai-ui</span>
                <br />
                <span className="animate-[code-3_10s_infinite]">
                  🚀 Your workspace is ready.
                </span>{" "}
                <br />
                <br />
                <span className="animate-[code-5_10s_infinite] text-gray-200">
                  tinpear deploy --smart
                </span>
                <br />
                <span className="animate-[code-6_10s_infinite]">Done in 3.5s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
