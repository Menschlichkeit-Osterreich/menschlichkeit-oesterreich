import React from 'react';

export default function SkipLink() {
  return (
    <a
      className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1600] focus:bg-ink-deep focus:text-paper focus:px-4 focus:py-3 focus:text-base focus:font-semibold focus:rounded-sm focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-primary-300"
      href="#main"
      data-testid="a11y.skip"
    >
      Zum Inhalt springen
    </a>
  );
}
