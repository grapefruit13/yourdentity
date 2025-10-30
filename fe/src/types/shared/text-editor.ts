/**
 * @description 텍스트 에디터 관련 타입 정의
 */

export interface TextEditorProps {
  className?: string;
  minHeight?: number;
  /**
   * 이미지 선택 시, 업로드는 하지 않고 clientId를 발급/등록해 반환합니다.
   * 에디터는 받은 clientId를 img의 data-client-id 속성에 넣어 둡니다.
   * 실제 업로드는 제출 시 한 번에 수행하고, 그 응답의 fileUrl을 매칭시켜 src로 교체합니다.
   */
  onImageUpload?: (file: File) => Promise<string> | string;
  /**
   * 파일 선택 시, 업로드는 하지 않고 clientId를 발급/등록해 반환합니다.
   * 에디터는 받은 clientId를 a의 data-file-id 속성에 넣어 둡니다.
   * 실제 업로드는 제출 시 한 번에 수행하고, 그 응답의 fileUrl을 매칭시켜 href로 교체합니다.
   */
  onFileUpload?: (file: File) => Promise<string> | string;
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
