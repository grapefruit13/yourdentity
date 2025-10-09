"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/utils/shared/cn";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  src: string;
  width?: number;
  height?: number;
}

const Icon = ({
  src,
  width = 28,
  height = 28,
  className,
  style,
  ...props
}: IconProps) => {
  return (
    <span
      className={cn("icon-mask", className)}
      style={{
        width,
        height,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        ...style,
      }}
      {...props}
    />
  );
};

export default Icon;
