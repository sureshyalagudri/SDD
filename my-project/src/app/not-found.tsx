import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="stack" style={{ maxWidth: "48rem" }}>
      <p className="eyebrow">404</p>
      <h1>That episode isn&apos;t in the feed… or that page isn&apos;t on the site.</h1>
      <p className="lede">
        The link you followed may be out of date, or the address may have been typed incorrectly.
      </p>
      <p>
        <Link href="/" prefetch={false} className="btn">
          Back to the landing page
        </Link>
      </p>
    </div>
  );
}
