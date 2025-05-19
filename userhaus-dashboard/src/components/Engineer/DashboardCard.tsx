import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const DashboardCard = ({
  title,
  subtitle,
  children,
  className,
  ...props
}: DashboardCardProps) => {
  return (
    <div className={cn("glass-card p-6", className)} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-soil-800">{title}</h3>}
          {subtitle && <p className="text-sm text-soil-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};