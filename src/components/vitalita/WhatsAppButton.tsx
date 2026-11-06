import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ButtonOrigin } from "@/lib/whatsapp";
import { useVitalita } from "./AnalyticsProvider";

const cta = cva(
  "whatsapp-button group inline-flex items-center justify-center gap-2 rounded-full bg-forest font-semibold text-white transition-[background-color,transform,box-shadow] duration-200 hover:bg-forest-deep active:scale-[0.98] select-none",
  {
    variants: {
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { size: "md" },
  },
);

type Props = VariantProps<typeof cta> & {
  origin: ButtonOrigin;
  children?: ReactNode;
  className?: string;
  hideIcon?: boolean;
  ariaLabel?: string;
  /** Zones written into the WhatsApp message only (never sent to analytics). */
  zones?: string[];
  onClick?: () => void;
};

export function WhatsAppButton({
  origin,
  children = "Agenda mi sesión",
  size,
  block,
  className,
  hideIcon,
  ariaLabel,
  zones,
  onClick,
}: Props) {
  const { openBooking } = useVitalita();
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        openBooking(origin, zones);
      }}
      className={cn(cta({ size, block }), className)}
      aria-label={
        ariaLabel ??
        `${typeof children === "string" ? children : "Agenda mi sesión"}. Abre opciones para agendar.`
      }
    >
      <span>{children}</span>
      {!hideIcon && (
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      )}
    </button>
  );
}

/** WhatsApp logo, sized by CSS (inherits the text color). */
export function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.5 11.8a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.3-5a8.4 8.4 0 1 1 16.2-3.7Zm-8.4-6.7a6.8 6.8 0 0 0-5.8 10.4l.2.4-.8 2.9 3-.8.4.2a6.8 6.8 0 1 0 3-13.1Zm3.8 9.7c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.5-1-1.2-1.2-1.4-.1-.2 0-.3.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.4.5.2.9.3 1.2.4.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.2-.3-.3-.5-.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
