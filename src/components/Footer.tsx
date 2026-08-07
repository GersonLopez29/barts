export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 overflow-hidden rounded-t-3xl border-t border-zinc-200 bg-white">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="flex items-center justify-center gap-1.5 text-base font-extrabold text-zinc-900">
          <span aria-hidden="true">🍔</span>
          Bart&apos;s
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Hamburguesas, alitas BBQ y salchipapas — pide online y pasa a recoger o te lo llevamos.
        </p>
        <p className="mt-6 text-xs text-zinc-400">Bart&apos;s © {year}</p>
      </div>
    </footer>
  );
}
