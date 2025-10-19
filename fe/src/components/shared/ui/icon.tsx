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
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
      {...props}
    />
  );
};

export default Icon;
