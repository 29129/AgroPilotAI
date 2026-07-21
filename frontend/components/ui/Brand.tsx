import Link from "next/link";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link className="brand" href="/" aria-label="AgroPilot AI, inicio">
      <span className="brand-mark" aria-hidden="true" />
      {!compact && <span>AgroPilot AI</span>}
    </Link>
  );
}
