"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function BackburnerLoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const [email, setEmail] = useState("mark.kairostech@gmail.com");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/backburner");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex justify-center border-b border-slate-200 px-6 py-6">
          <Image
            src="/backburner-logo.png"
            alt="Project Backburner"
            width={220}
            height={120}
            priority
            className="h-auto w-[190px]"
          />
        </div>

        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Sign in to Backburner
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Access your shared workspace and collaborate securely with your
            project partners.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 caret-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500">
          Shared by intent. Protected by design.
        </div>
      </div>
    </main>
  );
}