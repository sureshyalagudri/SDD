"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/episodes/", label: "Episodes" },
  { href: "/about/", label: "About" },
  { href: "/faq/", label: "FAQ" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export function NavLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className={className}>
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              prefetch={false}
              className={linkClassName}
              aria-current={active ? "page" : undefined}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
