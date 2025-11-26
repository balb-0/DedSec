import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";
import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function KpiCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-sm mt-1",
              changeType === "positive" && "text-emerald-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
