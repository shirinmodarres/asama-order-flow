import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AsamaLogoProps {
  compact?: boolean;
  href?: string;
  className?: string;
}

function LogoContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <div className="mt-1 flex items-center gap-2">
          <Image
            src="/logo-fn.png"
            alt="لوگوی آساما"
            width={124}
            height={34}
            className="h-auto w-[144px] object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export function AsamaLogo({
  compact = false,
  href,
  className,
}: AsamaLogoProps) {
  if (href) {
    return (
      <Link href={href} className={cn("inline-flex", className)}>
        <LogoContent compact={compact} />
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex", className)}>
      <LogoContent compact={compact} />
    </div>
  );
}
