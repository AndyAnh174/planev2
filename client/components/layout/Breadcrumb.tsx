"use client";

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-foreground">
              {item.label}
            </a>
          ) : (
            <span className={index === items.length - 1 ? "text-foreground" : ""}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

