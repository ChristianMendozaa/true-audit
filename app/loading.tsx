export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span
          className="text-xs text-ink-muted uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Cargando
        </span>
      </div>
    </div>
  );
}
