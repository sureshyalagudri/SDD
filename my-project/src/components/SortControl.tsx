import { isEpisodeSort, SORT_OPTIONS, type EpisodeSort } from "@/lib/sort";
import styles from "./SortControl.module.css";

export function SortControl({
  value,
  onChange,
  announcement,
}: {
  value: EpisodeSort;
  onChange: (next: EpisodeSort) => void;
  announcement: string;
}) {
  return (
    <div className={`sort-control ${styles.control}`}>
      <label htmlFor="episode-sort" className={styles.label}>
        Sort by
      </label>
      <select
        id="episode-sort"
        className={styles.select}
        value={value}
        onChange={(e) => {
          const v = e.currentTarget.value;
          if (isEpisodeSort(v)) onChange(v);
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="visually-hidden" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
