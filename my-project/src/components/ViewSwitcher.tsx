"use client";

import { useEffect, useState } from "react";
import { DEFAULT_VIEW, isEpisodeView, VIEW_STORAGE_KEY, type EpisodeView } from "@/lib/view";
import styles from "./ViewSwitcher.module.css";

const OPTIONS: { value: EpisodeView; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "list", label: "List" },
];

function readView(): EpisodeView {
  const attr = document.documentElement.getAttribute("data-view");
  return isEpisodeView(attr) ? attr : DEFAULT_VIEW;
}

function Icon({ view }: { view: EpisodeView }) {
  return view === "card" ? (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  ) : (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="14" height="2.5" rx="1.25" />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" />
    </svg>
  );
}

export function ViewSwitcher() {
  const [view, setView] = useState<EpisodeView>(DEFAULT_VIEW);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setView(readView());
  }, []);

  const select = (next: EpisodeView, label: string) => {
    if (next === view) return;
    document.documentElement.setAttribute("data-view", next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* storage unavailable: view still applies for this page */
    }
    setView(next);
    setAnnouncement(`${label} view selected`);
  };

  return (
    <div role="group" aria-label="Catalog view" className={`view-switcher ${styles.group}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className={styles.option}
          data-value={o.value}
          aria-pressed={view === o.value}
          onClick={() => select(o.value, o.label)}
        >
          <Icon view={o.value} />
          <span>{o.label}</span>
        </button>
      ))}
      <span className="visually-hidden" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
