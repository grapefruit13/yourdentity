"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/shared/cn";
import { Button } from "../ui/button";

interface ToolbarButtonProps {
  onClick?: () => void;
  children: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function ToolbarButton({
  onClick,
  children,
  ariaLabel,
  disabled = false,
  onMouseDown,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "text-muted-foreground size-8",
        disabled && "cursor-not-allowed text-gray-300"
      )}
      disabled={disabled}
      onMouseDown={onMouseDown}
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {children}
    </Button>
  );
}
