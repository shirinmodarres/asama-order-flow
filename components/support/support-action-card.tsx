import { ActionLinkCard } from "@/components/shared/action-link-card";

interface SupportActionCardProps {
  title: string;
  description: string;
  href: string;
}

export function SupportActionCard({
  title,
  description,
  href,
}: SupportActionCardProps) {
  const icon =
    href === "/support/products/new"
      ? "plus-circle"
      : href === "/support/inventory"
        ? "package"
        : "pencil";

  return (
    <ActionLinkCard
      title={title}
      description={description}
      href={href}
      icon={icon}
    />
  );
}
