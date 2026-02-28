import React from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className = '' }: { items: Crumb[]; className?: string }) {
  const visible = items.slice(-5); // max 5
  const collapsed = items.length > 5;

  return (
    <nav aria-label="Breadcrumb" className={["text-sm", className].join(' ')}>
      <ol className="flex items-center gap-2 py-2">
        <li>
          <Link to="/" className="text-secondary-700 hover:text-primary-700">Home</Link>
        </li>
        <li aria-hidden="true" className="text-secondary-500">›</li>
        {collapsed && (
          <>
            <li className="text-secondary-500">…</li>
            <li aria-hidden="true" className="text-secondary-500">›</li>
          </>
        )}
        {visible.map((c, idx) => {
          const isLast = idx === visible.length - 1;
          return (
            <React.Fragment key={`${c.label}-${idx}`}>
              <li aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-secondary-900' : 'text-secondary-700'}>
                {isLast || !c.href ? (
                  <span>{c.label}</span>
                ) : (
                  <Link to={c.href} className="hover:text-primary-700">{c.label}</Link>
                )}
              </li>
              {!isLast && <li aria-hidden="true" className="text-secondary-500">›</li>}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

