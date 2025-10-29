/**
 * @description 텍스트 에디터 관련 타입 정의
 */

export interface TextEditorProps {
  className?: string;
  minHeight?: number;
  onImageUpload?: (file: File) => void;
  onFileUpload?: (file: File) => void;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
}

export type FormatCommand = "bold" | "italic" | "underline";

export type AlignCommand = "justifyLeft" | "justifyCenter" | "justifyRight";

export type EditorType = "title" | "content" | null;

export interface ColorOption {
  name: string;
  value: string;
}

export interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface ColorPickerPosition {
  top: number;
  left: number;
}
