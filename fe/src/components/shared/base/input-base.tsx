import { ComponentProps } from "react";
import { cn } from "@/utils/shared/cn";

const InputBase = ({ className, ...props }: ComponentProps<"input">) => {
  return <input className={cn("focus:outline-none", className)} {...props} />;
};

export default InputBase;
