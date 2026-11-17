import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
  className?: string;
}

export default function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span className={cn("brand-wordmark", className)}>
      <span className="brand-wordmark__colored">Colored</span>{" "}
      <span className="brand-wordmark__kitchen">Kitchen</span>
    </span>
  );
}
