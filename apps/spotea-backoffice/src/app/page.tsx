export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-12 ">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">
            Back Office Dashboard
          </h1>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {['/merchant', '/'].map((path) => (
            <a
              key={path}
              href={path}
              className="text-center rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              {path}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
