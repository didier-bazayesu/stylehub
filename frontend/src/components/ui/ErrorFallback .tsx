// src/components/ui/ErrorFallback.tsx
export function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Oops, something went wrong</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {error?.message || "Please try refreshing the page or going back home."}
        </p>
        <a
          href="/"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
