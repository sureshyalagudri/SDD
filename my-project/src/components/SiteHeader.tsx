import Link from "next/link";
import { podcast } from "@/content/podcast";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <span>{podcast.name}</span>
        </Link>
        <nav aria-label="Primary" className={styles.nav}>
          <NavLinks className={styles.links} linkClassName={styles.link} />
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
