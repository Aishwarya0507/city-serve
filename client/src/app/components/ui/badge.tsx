import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-primary/10 bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-destructive/10 bg-destructive/10 text-destructive hover:bg-destructive/20 backdrop-blur-md",
        outline:
          "text-foreground hover:bg-accent border-white/10",
        success: 
          "border-green-500/10 bg-green-500/10 text-green-500 hover:bg-green-500/20 backdrop-blur-md",
        warning:
          "border-amber-500/10 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 backdrop-blur-md",
        pulse:
          "border-transparent bg-primary/10 text-primary animate-pulse-soft",
        glass:
          "border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-glass",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
