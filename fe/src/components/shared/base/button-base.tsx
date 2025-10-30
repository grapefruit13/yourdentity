import { ComponentProps } from "react";
import { cn } from "@/utils/shared/cn";

const ButtonBase = ({ className, ...props }: ComponentProps<"button">) => {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center hover:cursor-pointer focus:outline-none",
        className
      )}
      {...props}
    />
  );
};

export default ButtonBase;
