"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div role="alert" className="mx-auto max-w-md rounded-xl border border-line bg-card p-8 text-center"><h2 className="text-xl font-extrabold">Something went wrong.</h2><p className="my-3 text-mut">We couldn't load this page. Please check your connection and try again.</p><button onClick={reset} className="rounded-lg bg-acc px-4 py-2 font-semibold text-white">Retry</button></div>;
}
