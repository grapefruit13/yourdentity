export const rgbToHex = (rgb: string, fallback: string): string => {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return fallback;

  return (
    "#" +
    match
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

export const isElementEmpty = (element: HTMLElement | null): boolean => {
  return !element || element.textContent?.trim() === "";
};

export const createRangeAtEnd = (element: HTMLElement): Range => {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  return range;
};

export const createRangeAtStart = (element: HTMLElement): Range => {
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);
  return range;
};

export const setCursorPosition = (
  element: HTMLElement,
  atEnd = false
): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = atEnd ? createRangeAtEnd(element) : createRangeAtStart(element);
  selection.removeAllRanges();
  selection.addRange(range);
};
