
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statsCardVariants = cva("", {
  variants: {
    variant: {
      default: "bg-white border-soil-200",
      primary: "bg-gradient-to-br from-primary/90 to-primary text-white border-primary/20",
      success: "bg-gradient-to-br from-success/90 to-success text-white border-success/20",
      warning: "bg-gradient-to-br from-warning/90 to-warning text-white border-warning/20",
      error: "bg-gradient-to-br from-error/90 to-error text-white border-error/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface StatsCardProps extends VariantProps<typeof statsCardVariants> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  description,
  variant, 
  className 
}: StatsCardProps) {
  const textColorClass = variant === "default" ? "text-soil-800" : "text-white";
  const subtextColorClass = variant === "default" ? "text-soil-600" : "text-white/80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("w-full", className)}
    >
      <Card className={cn(
        "border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300", 
        statsCardVariants({ variant })
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className={cn("text-sm font-medium mb-1", subtextColorClass)}>
                {title}
              </p>
              <h3 className={cn("text-2xl font-semibold tracking-tight", textColorClass)}>
                {value}
              </h3>
              {description && (
                <p className={cn("mt-1 text-xs", subtextColorClass)}>
                  {description}
                </p>
              )}
              {trend && (
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${
                    trend.isPositive 
                      ? (variant === "default" ? "text-success" : "text-white") 
                      : (variant === "default" ? "text-error" : "text-white")
                  }`}>
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                  <span className={cn("text-xs ml-1", subtextColorClass)}>vs last month</span>
                </div>
              )}
            </div>
            {icon && (
              <div className={cn(
                "p-2 rounded-full", 
                variant === "default" ? "bg-soil-100" : "bg-white/10"
              )}>
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
