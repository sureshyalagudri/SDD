import { platforms } from "@/content/platforms";
import styles from "./ListenOn.module.css";

export function ListenOn({ headingId = "listen-on" }: { headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        Listen on
      </h2>
      <ul className={styles.list}>
        {platforms.map((p) => (
          <li key={p.id}>
            <a href={p.homeUrl} target="_blank" rel="noopener" className={styles.badge}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.badgeSrc}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className={styles.icon}
              />
              <span>
                Listen on {p.name}
                <span className="visually-hidden"> (opens in new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
