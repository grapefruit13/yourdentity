"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { cn } from "@/utils/shared/cn";
import { Button } from "./ui/button";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  onImageUpload?: (file: File) => void;
  onFileUpload?: (file: File) => void;
}

type FormatCommand = "bold" | "italic" | "underline" | "strikeThrough";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "내용을 입력하세요...",
  className,
  minHeight = 300,
  onImageUpload,
  onFileUpload,
}: RichTextEditorProps) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const savedSelectionRef = React.useRef<Range | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Selection 저장
  const saveSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  }, []);

  // Selection 복원
  const restoreSelection = React.useCallback(() => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelectionRef.current);
    }
  }, []);

  const handleInput = React.useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleFormat = React.useCallback(
    (command: FormatCommand) => {
      // 에디터 포커스 및 selection 복원
      editorRef.current?.focus();
      restoreSelection();

      // execCommand 실행
      const success = document.execCommand(command, false, undefined);

      if (!success) {
        // execCommand 실패 시 무시 (브라우저 호환성 문제)
      }

      // 입력 이벤트 트리거하여 onChange 호출
      handleInput();
    },
    [restoreSelection, handleInput]
  );

  const handleImageClick = React.useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleFileClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const insertImageToEditor = React.useCallback(
    (imageUrl: string) => {
      editorRef.current?.focus();
      restoreSelection();

      // 이미지를 에디터에 삽입 (반응형 및 overflow 방지)
      const img = `<img src="${imageUrl}" alt="업로드된 이미지" style="max-width: 100%; height: auto; width: auto; display: block; margin: 0 auto;" />`;
      document.execCommand("insertHTML", false, img);

      handleInput();
    },
    [restoreSelection, handleInput]
  );

  const insertFileToEditor = React.useCallback(
    (fileName: string, fileUrl: string) => {
      editorRef.current?.focus();
      restoreSelection();

      // 파일을 다운로드 가능한 링크로 에디터에 삽입 (긴 파일명 처리)
      const link = `<a href="${fileUrl}" download="${fileName}" style="color: #3b82f6; text-decoration: underline; word-break: break-all; overflow-wrap: break-word;">📎 ${fileName}</a>`;
      document.execCommand("insertHTML", false, link + "&nbsp;");

      handleInput();
    },
    [restoreSelection, handleInput]
  );

  const handleImageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // 이미지 미리보기를 위한 Object URL 생성
        const imageUrl = URL.createObjectURL(file);

        // 에디터에 즉시 삽입
        insertImageToEditor(imageUrl);

        // 사용자 정의 업로드 핸들러 호출 (서버 업로드 등)
        if (onImageUpload) {
          onImageUpload(file);
        }
      }
      // Reset input
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [onImageUpload, insertImageToEditor]
  );

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // 파일 다운로드를 위한 Blob URL 생성
        const fileUrl = URL.createObjectURL(file);

        // 파일을 다운로드 가능한 링크로 에디터에 즉시 삽입
        insertFileToEditor(file.name, fileUrl);

        // 사용자 정의 업로드 핸들러 호출 (서버 업로드 등)
        if (onFileUpload) {
          onFileUpload(file);
        }
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFileUpload, insertFileToEditor]
  );

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = React.useCallback(
    (e: React.FocusEvent) => {
      // Selection 저장
      saveSelection();

      // 툴바 버튼 클릭 시 blur 방지
      if (containerRef.current?.contains(e.relatedTarget as Node)) {
        return;
      }
      setIsFocused(false);
    },
    [saveSelection]
  );

  // 초기 값 설정
  React.useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const toolbarButtons = [
    {
      icon: Bold,
      command: "bold" as FormatCommand,
      label: "굵게",
    },
    {
      icon: Underline,
      command: "underline" as FormatCommand,
      label: "밑줄",
    },
    {
      icon: Italic,
      command: "italic" as FormatCommand,
      label: "기울임",
    },
    {
      icon: Strikethrough,
      command: "strikeThrough" as FormatCommand,
      label: "취소선",
    },
    {
      icon: ImageIcon,
      onClick: handleImageClick,
      label: "이미지",
    },
    {
      icon: Paperclip,
      onClick: handleFileClick,
      label: "첨부파일",
    },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-background relative flex max-w-[calc(90vw-1rem)] flex-col rounded-lg border border-gray-300",
        className
      )}
    >
      {/* Sticky Toolbar */}
      <div
        className={cn(
          "sticky top-12 z-40 flex w-full items-center gap-2 overflow-x-auto rounded-t-lg border-b border-gray-300 bg-white px-4 py-3 transition-shadow dark:bg-gray-950",
          isFocused ? "shadow-md" : "shadow-sm",
          // 모바일에서 최적화된 터치 영역
          "touch-manipulation"
        )}
      >
        {toolbarButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-9"
              onMouseDown={(e) => {
                // Selection 저장 (버튼 클릭 전)
                saveSelection();
                // 기본 동작 방지하여 포커스 변경 막기
                e.preventDefault();
              }}
              onClick={() => {
                if (button.onClick) {
                  button.onClick();
                } else if (button.command) {
                  handleFormat(button.command);
                }
              }}
              aria-label={button.label}
              tabIndex={-1}
            >
              <Icon className="size-5" />
            </Button>
          );
        })}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        aria-label="이미지 업로드"
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        aria-label="파일 업로드"
      />

      {/* Editor Content Container */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "prose prose-sm w-full max-w-none overflow-x-hidden overflow-y-auto p-4 outline-none",
            "prose-headings:mt-4 prose-headings:mb-2",
            "prose-p:my-2",
            "prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:block prose-img:mx-auto",
            "prose-a:text-blue-500 prose-a:underline prose-a:cursor-pointer prose-a:break-all prose-a:overflow-wrap-break-word",
            "[&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)]",
            // 가로 너비 제한 및 자동 줄바꿈
            "word-break-break-word overflow-wrap-break-word break-words whitespace-pre-wrap",
            // 모바일 최적화
            "touch-manipulation",
            // 스크롤 성능 최적화
            "overscroll-contain",
            // 긴 URL이나 텍스트 처리
            "[&_*]:max-w-full [&_*]:overflow-hidden [&_*]:break-words"
          )}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${minHeight}px`,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            boxSizing: "border-box",
          }}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onSelect={saveSelection}
          data-placeholder={placeholder}
          role="textbox"
          aria-label="텍스트 에디터"
          aria-multiline="true"
          tabIndex={0}
        />
      </div>
    </div>
  );
};

export { RichTextEditor };
export type { RichTextEditorProps };
