import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl",
        outline: "border border-white/20 bg-transparent text-foreground  hover:drop-shadow-xl hover:bg-white/10 hover:text-foreground shadow-lg hover:shadow-xl hover:scale-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:drop-shadow-xl hover:shadow-xl hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "gradient-primary text-white hover:opacity-90 shadow-glow hover:shadow-accent hover:scale-105 font-semibold",
        hero: "gradient-primary text-white hover:opacity-90 shadow-glow hover:shadow-accent hover:scale-105 font-bold text-lg border-0",
        cta: "gradient-secondary text-white hover:opacity-90 shadow-elegant hover:shadow-glow hover:scale-105 font-semibold",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-xl px-10",
        xl: "h-16 rounded-xl px-12 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, asChild = false, variant, size, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";
