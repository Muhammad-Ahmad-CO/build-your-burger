// ============= Full file contents =============

interface NavLike {
  state: { location: { pathname: string } };
  navigate: (opts: { to: string }) => unknown;
}

/** Navigate home if needed, then smooth-scroll to a section id. */
export function goToSection(nav: NavLike, target: string, smooth = true) {
  const scroll = () => {
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };
  if (nav.state.location.pathname !== "/") {
    nav.navigate({ to: "/" });
    window.setTimeout(scroll, 120);
  } else {
    scroll();
  }
}
