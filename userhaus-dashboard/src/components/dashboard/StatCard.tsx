
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-soil-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up",
      className
    )}>
      <div className="flex items-center justify-between">
        <Icon className="w-8 h-8 text-soil-600" />
        <span className="text-3xl font-semibold text-soil-900">{value}</span>
      </div>
      <h3 className="mt-4 text-sm font-medium text-soil-700">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-soil-600">{description}</p>
      )}
    </div>
  );
}
