import Image from "next/image";
import Link from "next/link";

/**
 * Wordmark de marca: panda + "B & W".
 * `variant="mark"` muestra solo el osito; `variant="full"` añade el wordmark.
 */
export function BrandLogo({
  variant = "full",
  className = "",
}: {
  variant?: "mark" | "full";
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="B & W — inicio"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/brand/logo-solo.png"
        alt=""
        width={40}
        height={40}
        priority
        className="h-9 w-9 object-contain"
      />
      {variant === "full" && (
        <span className="font-sans text-xl font-extrabold tracking-tight">
          B&nbsp;&amp;&nbsp;W
        </span>
      )}
    </Link>
  );
}
