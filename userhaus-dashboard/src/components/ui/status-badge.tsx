
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        available: "bg-success/15 text-success",
        "in-use": "bg-warning/15 text-warning",
        maintenance: "bg-error/15 text-error",
        online: "bg-success/15 text-success",
        offline: "bg-soil-200 text-soil-700",
        active: "bg-success/15 text-success",
        inactive: "bg-soil-200 text-soil-700",
        pending: "bg-warning/15 text-warning",
        rejected: "bg-error/15 text-error",
        error: "bg-error/15 text-error",
        warning: "bg-warning/15 text-warning",
      },
    },
    defaultVariants: {
      variant: "available",
    },
  }
);

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  children: React.ReactNode;
  withDot?: boolean;
}

export function StatusBadge({ 
  className, 
  variant, 
  children,
  withDot = true,
}: StatusBadgeProps) {
  return (
    <motion.span 
      className={cn(statusBadgeVariants({ variant }), className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {withDot && (
        <div className="mr-1 relative">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "available" || variant === "online" || variant === "active" ? "bg-success" : "",
            variant === "in-use" || variant === "pending" || variant === "warning" ? "bg-warning" : "",
            variant === "maintenance" || variant === "rejected" || variant === "error" ? "bg-error" : "",
            variant === "offline" || variant === "inactive" ? "bg-soil-500" : "",
          )}>
            {(variant === "available" || variant === "online" || variant === "active") && (
              <motion.div
                className="absolute inset-0 rounded-full bg-success"
                animate={{ opacity: [1, 0], scale: [1, 2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      )}
      {children}
    </motion.span>
  );
}
