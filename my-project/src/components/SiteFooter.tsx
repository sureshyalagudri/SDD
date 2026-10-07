import { podcast } from "@/content/podcast";
import { NavLinks } from "./NavLinks";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.brand}>
          <strong>{podcast.name}</strong>
          <span className={styles.tagline}>{podcast.tagline}</span>
        </p>
        <nav aria-label="Footer">
          <NavLinks className={styles.links} linkClassName={styles.link} />
        </nav>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {podcast.name}. Sample content for demonstration.
        </p>
      </div>
    </footer>
  );
}
