import { avatarPalette, cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const palette = avatarPalette(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-line", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold", className)}
      style={{ width: size, height: size, background: palette.background, color: palette.color }}
    >
      {initials(name)}
    </span>
  );
}
