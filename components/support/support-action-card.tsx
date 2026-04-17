import Link from "next/link";

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
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
    >
      <h3 className="text-base font-semibold text-[#1F3A5F]">{title}</h3>
      <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
    </Link>
  );
}
