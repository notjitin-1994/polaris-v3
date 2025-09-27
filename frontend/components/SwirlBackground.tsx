export default function SwirlBackground(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute -inset-40 bg-white/5 dark:bg-black/5 backdrop-blur-3xl opacity-60"
        style={{
          filter: 'saturate(1.05)',
        }}
      />
    </div>
  );
}
