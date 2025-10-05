import { ComponentProps } from "react";
import { cn } from "@/utils/shared/cn";

/**
 * @description 디자인 시스템 input
 */
const Input = ({ className, ...props }: ComponentProps<"input">) => {
  return (
    <input
      className={cn(
        "font-noto focus:ring-primary-400 focus:outline-primary-400 focus:border-primary-600 w-full rounded-md border border-gray-200 px-3 py-2 pr-10 text-base leading-1.5 font-normal shadow-xs focus:outline-3",
        className
      )}
      {...props}
    />
  );
};

export default Input;
