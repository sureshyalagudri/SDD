import type { Metadata } from "next";
import { FaqList } from "@/components/FaqList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions listeners ask most.",
};

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="eyebrow">Help</p>
        <h1>Frequently asked questions</h1>
        <p className="lede">
          Everything listeners ask us most often. Select a question to reveal the answer.
        </p>
      </header>
      <FaqList />
    </div>
  );
}
