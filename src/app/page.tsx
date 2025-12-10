import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4 text-center">
      <div className="glass max-w-4xl rounded-3xl p-12">
        <h1 className="heading-gradient mb-4 text-6xl font-extrabold tracking-tight">
          Cricket Predictor Pro
        </h1>
        <p className="mb-8 text-xl text-[var(--secondary)] font-medium">
          by SBR.Co
        </p>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-300">
          Predict Toss, Match Winners, and Tournament Champions.
          Compete with friends in private rooms and climb the global leaderboard.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-full bg-[var(--primary)] px-8 py-4 text-lg font-bold text-black transition hover:bg-[var(--primary-variant)] hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[var(--primary)] px-8 py-4 text-lg font-bold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-black"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} SBR.Co. All rights reserved.
      </footer>
    </main>
  );
}
