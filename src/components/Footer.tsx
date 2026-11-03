// Reel-faithful footer: the website simply ends in a thin mustard-yellow strip.
export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-sun">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-3 px-6 py-4 text-center">
        <span className="font-display text-sm font-extrabold tracking-wide text-primary">
          DOUBLE GOOD
        </span>
        <span className="font-display text-sm font-extrabold text-foreground">· Better together.</span>
      </div>
    </footer>
  );
}
