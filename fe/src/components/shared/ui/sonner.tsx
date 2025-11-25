"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      position="bottom-center"
      theme={theme as ToasterProps["theme"]}
      className="toaster group custom-toaster"
      toastOptions={{
        className: "toast-custom",
        style: {
          background: "transparent",
          border: "none",
          padding: 0,
          boxShadow: "none",
        } as CSSProperties,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
