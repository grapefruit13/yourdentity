import { ComponentPropsWithoutRef, ElementType } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils/shared/cn";

const typographyVariants = cva("whitespace-pre-line text-wrap leading-[1.5]", {
  variants: {
    font: {
      noto: "font-noto",
      gill: "font-gill",
    },
    size: {
      "11": "text-[11px]",
      "12": "text-xs",
      "14": "text-sm",
      "16": "text-base",
      "18": "text-lg",
      "20": "text-xl",
      "22": "text-[22px]",
      "26": "text-[26px]",
      "30": "text-3xl",
      "32": "text-4xl",
      "34": "text-[34px]",
      "40": "text-[40px]",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    },
    color: {
      black: "text-black-100",
      white: "text-white-100",
    },
  },
});

export type TypographyProps = VariantProps<typeof typographyVariants> &
  ComponentPropsWithoutRef<ElementType>;

const customTypography = (
  element: ElementType,
  variants: VariantProps<typeof typographyVariants>
) => {
  const Typography = ({ children, className, ...props }: TypographyProps) => {
    const Tag = element;
    return (
      <Tag className={cn(typographyVariants(variants), className)} {...props}>
        {children}
      </Tag>
    );
  };
  return Typography;
};

export const NDisplay1 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "40",
  weight: "bold",
});

export const NDisplay2 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "32",
  weight: "bold",
});

export const NTitle1 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "34",
  weight: "bold",
});

export const NTitle2 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "30",
  weight: "bold",
});

export const NTitle3 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "26",
  weight: "bold",
});

export const NTitle4 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "22",
  weight: "bold",
});

export const NTitle5 = customTypography("span", {
  font: "noto",
  color: "black",
  size: "20",
  weight: "bold",
});

export const NHeading1B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "22",
  weight: "bold",
});

export const NHeading1M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "22",
  weight: "medium",
});

export const NHeading2B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "18",
  weight: "bold",
});

export const NHeading2M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "18",
  weight: "medium",
});

export const NHeading3B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "16",
  weight: "bold",
});

export const NHeading3M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "16",
  weight: "medium",
});

export const NBody1B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "16",
  weight: "bold",
});

export const NBody1M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "16",
  weight: "medium",
});

export const NBody1R = customTypography("span", {
  font: "noto",
  color: "black",
  size: "16",
  weight: "regular",
});

export const NBody2B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "14",
  weight: "bold",
});

export const NBody2M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "14",
  weight: "medium",
});

export const NBody2R = customTypography("span", {
  font: "noto",
  color: "black",
  size: "14",
  weight: "regular",
});

export const NLabel1B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "12",
  weight: "bold",
});

export const NLabel1M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "12",
  weight: "medium",
});

export const NLabel1R = customTypography("span", {
  font: "noto",
  color: "black",
  size: "12",
  weight: "regular",
});

export const NLabel2B = customTypography("span", {
  font: "noto",
  color: "black",
  size: "11",
  weight: "bold",
});

export const NLabel2M = customTypography("span", {
  font: "noto",
  color: "black",
  size: "11",
  weight: "medium",
});

export const NLabel2R = customTypography("span", {
  font: "noto",
  color: "black",
  size: "11",
  weight: "regular",
});

// --- gill sans

export const GDisplay1 = customTypography("span", {
  font: "gill",
  color: "black",
  size: "40",
  weight: "bold",
});

export const GDisplay2 = customTypography("span", {
  font: "gill",
  color: "black",
  size: "32",
  weight: "bold",
});

export const GTitle1 = customTypography("span", {
  font: "gill",
  color: "black",
  size: "34",
  weight: "bold",
});

export const GTitle2 = customTypography("span", {
  font: "gill",
  color: "black",
  size: "30",
  weight: "bold",
});

export const GTitle3 = customTypography("span", {
  font: "gill",
  color: "black",
  size: "26",
  weight: "bold",
});

export const GTitle4 = customTypography("span", {
  font: "gill",
  color: "black",
  size: "22",
  weight: "bold",
});

export const GHeading1B = customTypography("span", {
  font: "gill",
  color: "black",
  size: "22",
  weight: "bold",
});

export const GHeading1M = customTypography("span", {
  font: "gill",
  color: "black",
  size: "22",
  weight: "medium",
});

export const GHeading2B = customTypography("span", {
  font: "gill",
  color: "black",
  size: "18",
  weight: "bold",
});

export const GHeading2M = customTypography("span", {
  font: "gill",
  color: "black",
  size: "18",
  weight: "medium",
});

export const GBody1B = customTypography("span", {
  font: "gill",
  color: "black",
  size: "16",
  weight: "bold",
});

export const GBody1M = customTypography("span", {
  font: "gill",
  color: "black",
  size: "16",
  weight: "medium",
});

export const GBody1R = customTypography("span", {
  font: "gill",
  color: "black",
  size: "16",
  weight: "regular",
});

export const GBody2B = customTypography("span", {
  font: "gill",
  color: "black",
  size: "14",
  weight: "bold",
});

export const GBody2M = customTypography("span", {
  font: "gill",
  color: "black",
  size: "14",
  weight: "medium",
});

export const GBody2R = customTypography("span", {
  font: "gill",
  color: "black",
  size: "14",
  weight: "regular",
});

export const GLabel1B = customTypography("span", {
  font: "gill",
  color: "black",
  size: "12",
  weight: "bold",
});

export const GLabel1M = customTypography("span", {
  font: "gill",
  color: "black",
  size: "12",
  weight: "medium",
});

export const GLabel1R = customTypography("span", {
  font: "gill",
  color: "black",
  size: "12",
  weight: "regular",
});

export const GLabel2B = customTypography("span", {
  font: "gill",
  color: "black",
  size: "11",
  weight: "bold",
});

export const GLabel2M = customTypography("span", {
  font: "gill",
  color: "black",
  size: "11",
  weight: "medium",
});

export const GLabel2R = customTypography("span", {
  font: "gill",
  color: "black",
  size: "11",
  weight: "regular",
});
