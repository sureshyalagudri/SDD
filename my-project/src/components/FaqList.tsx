import { faq } from "@/content/faq";
import styles from "./FaqList.module.css";

export function FaqList() {
  const items = [...faq].sort((a, b) => a.order - b.order);
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.id} id={item.id} className={styles.item}>
          <summary className={styles.summary}>
            <span>{item.question}</span>
            <span className={styles.marker} aria-hidden="true" />
          </summary>
          <div className={styles.answer}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
