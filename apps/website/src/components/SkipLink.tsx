import React from 'react';

export default function SkipLink() {
  return (
    <a
      className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1600] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
      href="#main"
      data-testid="a11y.skip"
    >
      Zum Inhalt springen
    </a>
  );
}
