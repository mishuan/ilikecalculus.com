"use client";

import { ExternalTextLink } from "@/components/ui/text-action";
import type { PressItem } from "@/data/site-content";

type PressListProps = {
  items: readonly PressItem[];
};

function getFaviconUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(parsed.origin)}`;
  } catch {
    return null;
  }
}

export function PressList({ items }: PressListProps) {
  return (
    <div className="press-list">
      {items.map((item) => {
        const faviconUrl = getFaviconUrl(item.url);

        return (
          <article key={item.url} className="press-item interactive-lift">
            <div className="press-item__row">
              <div className="press-item__meta">
                {faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="press-item__favicon"
                    src={faviconUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="press-item__badge" aria-hidden="true" />
                )}
                <span className="press-item__outlet">{item.outlet}</span>
              </div>
              <span className="press-item__separator" aria-hidden="true">
                |
              </span>
              <ExternalTextLink href={item.url} className="press-item__link" title={item.url}>
                {item.title}
              </ExternalTextLink>
            </div>
          </article>
        );
      })}
    </div>
  );
}
