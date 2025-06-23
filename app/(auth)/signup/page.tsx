export const metadata = {
  title: "Sign Up - TinPear",
  description: "Create your TinPear account",
};

import Link from "next/link";

export default function SignUp() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Create an account</h1>
      </div>

      {/* Form */}
      <form>
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <input
              id="name"
              className="form-input w-full py-2"
              type="text"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              className="form-input w-full py-2"
              type="email"
              placeholder="janedoe@email.com"
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              className="form-input w-full py-2"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="btn w-full bg-gradient-to-t from-blue-600 to-blue-500 text-white shadow-sm hover:bg-[length:100%_150%]">
            Sign Up
          </button>
        </div>
      </form>

      {/* Bottom link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-700">
          Already have an account?{" "}
          <Link
            className="text-blue-600 underline hover:no-underline"
            href="/sign-in"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
