import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-black hover:cursor-pointer dark:text-white hover:bg-primary-light focus-visible:ring-primary dark:bg-primary dark:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-600 dark:text-white",
        outline:
          "text-black dark:text-white cursor-pointer",
        secondary:
          "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900 dark:bg-gray-800 dark:text-white",
        ghost: "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-700",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
