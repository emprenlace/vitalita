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
  onClick,
}: Props) {
  const { openBooking } = useVitalita();
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        openBooking(origin);
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
