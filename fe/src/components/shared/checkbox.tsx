"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { cn } from "@/utils/shared/cn";
import Icon from "./ui/icon";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input focus-visible:border-ring aria-invalid:border-destructive data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 relative size-4 shrink-0 rounded-sm border border-neutral-200 shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="absolute inset-0 flex items-center justify-center text-current"
      >
        <Icon
          src={IMAGE_URL.ICON.check.url}
          width={12}
          height={12}
          className="text-white"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
