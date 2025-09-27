export default function HeaderSwirlBackground(): JSX.Element {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 bg-white/5 dark:bg-black/5 backdrop-blur-xl"
      aria-hidden
    />
  );
}
