"use client"
import Image from "next/image";
import PageIllustration from "@/components/page-illustration";

export default function HeroHome() {
  return (
    <section className="relative">
      <PageIllustration />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40 text-center">
          {/* Logo */}
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
                className="rounded-full border-2 border-white shadow-md"
              />
            </div>
          </div>

          {/* Main Title */}
          <h1
            className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl"
            data-aos="zoom-y-out"
            data-aos-delay={150}
          >
            <span className="text-green-600">Tinpear,</span>The AI Launchpad to{" "}
            <span className="inline-block h-[90px] w-[190px] overflow-hidden align-top">
              <span className="relative block h-[60px] animate-fadeWords text-green-600">
                <span className="absolute top-0 left-0 w-full text-center opacity-0 fade-word delay-[0s]">Learn.</span>
                <span className="absolute top-0 left-0 w-full text-center opacity-0 fade-word delay-[2s]">Build.</span>
                <span className="absolute top-0 left-0 w-full text-center opacity-0 fade-word delay-[4s]">Grow.</span>
              </span>
            </span>{" "}
           
          </h1>

          {/* Subtext */}
          <p
            className="mx-auto mb-8 max-w-2xl text-lg text-gray-700"
            data-aos="zoom-y-out"
            data-aos-delay={300}
          >
            Learn AI. Get certified. Launch smart apps. Stay updated. Tinpear is your all-in-one AI platform for personal and business growth.
          </p>

          {/* CTAs */}
          <div
            className="mx-auto flex max-w-xs flex-col items-center gap-4 sm:flex-row sm:max-w-none sm:justify-center"
            data-aos="zoom-y-out"
            data-aos-delay={450}
          >
            <a
              className="btn w-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm transition-all hover:brightness-110 sm:w-auto"
              href="/learn"
            >
              Start Learning
            </a>
            <a
              className="btn w-full bg-white text-gray-800 shadow-sm hover:bg-gray-50 sm:w-auto"
              href="/apps"
            >
              For Businesses
            </a>
          </div>

          {/* Hero Image */}
          <div
            className="mx-auto mt-12 max-w-3xl"
            data-aos="zoom-y-out"
            data-aos-delay={600}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gray-900 px-5 py-3 shadow-xl">
              <Image
                src="/hero-dashboard.jpg"
                alt="Tinpear AI Dashboard"
                width={1024}
                height={576}
                className="rounded-lg border border-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Smooth fade word rotation */}
      <style jsx>{`
        .fade-word {
          animation: fadeInOut 6s infinite;
        }

        .fade-word:nth-child(2) {
          animation-delay: 2s;
        }

        .fade-word:nth-child(3) {
          animation-delay: 4s;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(10%);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(0);
          }
          40% {
            opacity: 0;
            transform: translateY(-10%);
          }
          100% {
            opacity: 0;
          }
        }

        .animate-fadeWords {
          position: relative;
          height: 60px;
        }
      `}</style>
    </section>
  );
}
