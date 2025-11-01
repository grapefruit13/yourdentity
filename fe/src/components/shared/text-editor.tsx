"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from "react";
import {
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  Paperclip,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
} from "lucide-react";
import { createPortal } from "react-dom";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { TEXT_EDITOR } from "@/constants/shared/_text-editor";

import type {
  TextEditorProps,
  FormatCommand,
  AlignCommand,
  EditorType,
  ActiveFormats,
  ColorPickerPosition,
} from "@/types/shared/text-editor";
import { cn } from "@/utils/shared/cn";
import {
  rgbToHex,
  isElementEmpty,
  setCursorPosition,
} from "@/utils/shared/text-editor";
import { Button } from "./ui/button";
import Icon from "./ui/icon";

// TODO: 링크 첨부 기능
/**
 * @description 텍스트 에디터 컴포넌트
 */
const TextEditor = ({
  className,
  minHeight = TEXT_EDITOR.DEFAULT_MIN_HEIGHT,
  onImageUpload,
  onFileUpload,
  onTitleChange,
  onContentChange,
}: TextEditorProps) => {
  // 참조 객체들
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const headingMenuRef = useRef<HTMLDivElement>(null);
  // 사용자가 방금 선택한 색상으로 툴바 스와치를 즉시 고정하기 위한 오버라이드 플래그
  const pendingSelectedColorRef = useRef<string | null>(null);

  // 상태 관리
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [isHeadingActive, setIsHeadingActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    TEXT_EDITOR.DEFAULT_COLOR
  );
  const [currentAlign, setCurrentAlign] = useState<AlignCommand>(
    TEXT_EDITOR.DEFAULT_ALIGN
  );
  const [activeEditor, setActiveEditor] = useState<EditorType>(null);
  const [colorPickerPosition, setColorPickerPosition] =
    useState<ColorPickerPosition>({
      top: 0,
      left: 0,
    });
  const [headingMenuPosition, setHeadingMenuPosition] =
    useState<ColorPickerPosition>({
      top: 0,
      left: 0,
    });
  // 모바일에 적절한 제목 크기(실제 태그는 span)
  const HEADING_CLASS_MAP = TEXT_EDITOR.HEADING_CLASS_MAP;
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [showTitlePlaceholder, setShowTitlePlaceholder] = useState(true);
  const [showContentPlaceholder, setShowContentPlaceholder] = useState(true);

  /**
   * 현재 선택 영역을 저장
   * 툴바 버튼 클릭 시 포커스가 이동해도 선택 영역을 유지하기 위함
   */
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  }, []);

  /**
   * 저장된 선택 영역을 복원
   * 툴바 버튼 클릭 후 원래 선택 영역으로 돌아가기 위함
   */
  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (savedSelectionRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  }, []);

  // 플레이스홀더 관리
  /**
   * 플레이스홀더 표시 여부를 확인하고 상태 업데이트
   * @param element - 확인할 HTML 요소
   * @param type - "title" 또는 "content"
   */
  const checkPlaceholder = useCallback(
    (element: HTMLElement | null, type: "title" | "content") => {
      if (!element) return;

      const isEmpty = isElementEmpty(element);
      // 논리적으로 비어있다면 실제 DOM도 비워 :empty를 충족시켜 placeholder가 항상 보이게 함
      if (isEmpty && element.innerHTML !== "") {
        element.innerHTML = "";
      }

      if (type === "title") {
        setShowTitlePlaceholder(isEmpty);
      } else {
        setShowContentPlaceholder(isEmpty);
      }
    },
    []
  );

  /**
   * 현재 활성화된 에디터의 ref 반환
   * @returns titleRef 또는 contentRef
   */
  const getActiveEditorRef = useCallback(() => {
    return activeEditor === "title" ? titleRef : contentRef;
  }, [activeEditor]);

  // 색상 감지
  const updateColorFromSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    let element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    while (element && element !== document.body) {
      const color = window.getComputedStyle(element).color;
      if (color && color !== "rgb(0, 0, 0)" && color !== "rgba(0, 0, 0, 0)") {
        setSelectedColor(rgbToHex(color, TEXT_EDITOR.DEFAULT_COLOR));
        return;
      }
      element = element.parentElement;
    }

    setSelectedColor(TEXT_EDITOR.DEFAULT_COLOR);
  }, []);

  // 서식 감지
  const updateFormatFromSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    let element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    const formats: ActiveFormats = {
      bold: false,
      italic: false,
      underline: false,
    };

    while (element && element !== document.body) {
      const el = element as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
      const tagName = el.tagName;

      const isHeadingSpan =
        typeof el.dataset?.heading !== "undefined" ||
        ["text-[22px]", "text-[18px]", "text-[16px]"].some((t) =>
          el.classList.contains(t)
        );

      if (isHeadingSpan) {
        // H1, H2에서는 B 비활성 처리 강제, H3는 허용
        const level = el.dataset?.heading ? parseInt(el.dataset.heading) : null;
        if (level === 1 || level === 2) {
          formats.bold = false;
          break;
        }
        // H3는 계속 진행하여 Bold 상태 감지 허용
      }

      if (
        computedStyle.fontWeight === "bold" ||
        computedStyle.fontWeight === "700" ||
        tagName === "B" ||
        tagName === "STRONG"
      ) {
        formats.bold = true;
      }

      if (
        computedStyle.fontStyle === "italic" ||
        tagName === "I" ||
        tagName === "EM"
      ) {
        formats.italic = true;
      }

      if (
        (computedStyle.textDecoration.includes("underline") ||
          tagName === "U") &&
        tagName !== "A" // 링크 요소의 밑줄은 무시
      ) {
        formats.underline = true;
      }

      element = element.parentElement;
    }

    setActiveFormats(formats);
  }, []);

  // 헤딩 상태 감지 (H1, H2만 활성화, H3는 비활성화)
  const updateHeadingFromSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsHeadingActive(false);
      return;
    }

    const node: Node | null = selection.anchorNode;
    let el: HTMLElement | null = null;
    if (!node) {
      setIsHeadingActive(false);
      return;
    }
    el = (
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : (node.parentElement as HTMLElement | null)
    ) as HTMLElement | null;

    const isHeadingSpan = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      if (target.dataset && typeof target.dataset.heading !== "undefined") {
        // H3는 헤딩 비활성화 (본문으로 취급)
        const level = parseInt(target.dataset.heading);
        return level === 1 || level === 2;
      }
      // 클래스 토큰 기반 체크 (H1/H2만 활성화)
      const activeTokens = ["text-[22px]", "text-[18px]"];
      return activeTokens.some((t) => target.classList.contains(t));
    };

    const container = contentRef.current || undefined;
    while (el && el !== container && el !== document.body) {
      if (isHeadingSpan(el)) {
        setIsHeadingActive(true);
        return;
      }
      el = el.parentElement;
    }
    setIsHeadingActive(false);
  }, []);

  /**
   * 제목 입력 처리
   * 제목 내용 변경 시 호출되며 플레이스홀더 상태도 업데이트
   */
  const handleTitleInput = useCallback(() => {
    if (titleRef.current && onTitleChange) {
      // 빈 링크 제거
      const anchors = titleRef.current.querySelectorAll("a");
      anchors.forEach((link) => {
        const text = (link.textContent || "").trim();
        const hasChildren = link.children.length > 0;
        if (!text && !hasChildren) {
          link.remove();
        }
      });

      onTitleChange(titleRef.current.innerHTML);
    }
    checkPlaceholder(titleRef.current, "title");
  }, [onTitleChange, checkPlaceholder]);

  /**
   * 내용 입력 처리
   * 내용 변경 시 호출되며 플레이스홀더 상태도 업데이트
   */
  const handleContentInput = useCallback(() => {
    if (contentRef.current && onContentChange) {
      // 빈 링크 제거
      const anchors = contentRef.current.querySelectorAll("a");
      anchors.forEach((link) => {
        const text = (link.textContent || "").trim();
        const hasChildren = link.children.length > 0;
        if (!text && !hasChildren) {
          link.remove();
        }
      });

      onContentChange(contentRef.current.innerHTML);
    }
    checkPlaceholder(contentRef.current, "content");
  }, [onContentChange, checkPlaceholder]);

  /**
   * 명령 실행 후 상태 업데이트를 통합 처리
   */
  const updateEditorState = useCallback(() => {
    updateFormatFromSelection();
    // 직전 사이클에 사용자 지정 색상 오버라이드가 있으면 그것을 우선 적용
    if (pendingSelectedColorRef.current) {
      setSelectedColor(pendingSelectedColorRef.current);
      pendingSelectedColorRef.current = null;
    } else {
      updateColorFromSelection();
    }
    updateHeadingFromSelection();
  }, [
    updateFormatFromSelection,
    updateColorFromSelection,
    updateHeadingFromSelection,
  ]);

  /**
   * 에디터 입력 이벤트 통합 처리
   */
  const handleEditorInput = useCallback(() => {
    if (activeEditor === "title") {
      handleTitleInput();
    } else if (activeEditor === "content") {
      handleContentInput();
    }
  }, [activeEditor, handleTitleInput, handleContentInput]);

  /**
   * 문서 명령 실행
   * @param command - 실행할 명령 (bold, italic, foreColor 등)
   * @param value - 명령에 필요한 값 (색상 코드 등)
   */
  const executeCommand = useCallback(
    (command: string, value?: string) => {
      // 제목 행에서는 모든 툴바 기능 비활성화
      if (activeEditor === "title") {
        return;
      }
      const editorRef = getActiveEditorRef();
      editorRef.current?.focus();
      restoreSelection();

      const success = document.execCommand(command, false, value);
      if (!success) {
        // 명령 실행 실패 - 브라우저 호환성 문제
      }

      // 명령 실행 후 UI 상태 업데이트
      setTimeout(updateEditorState, 0);

      // 입력 이벤트 트리거
      handleEditorInput();
    },
    [
      activeEditor,
      getActiveEditorRef,
      restoreSelection,
      updateEditorState,
      handleEditorInput,
    ]
  );

  /**
   * 텍스트 서식 적용
   * @param format - 적용할 서식 (bold, italic, underline)
   */
  const handleFormat = useCallback(
    (command: FormatCommand) => {
      executeCommand(command);
    },
    [executeCommand]
  );

  /**
   * 텍스트 정렬 적용
   * @param align - 적용할 정렬 (justifyLeft, justifyCenter, justifyRight)
   */
  const handleAlign = useCallback(
    (command: AlignCommand) => {
      executeCommand(command);
      setCurrentAlign(command);
    },
    [executeCommand]
  );

  /**
   * 텍스트 색상 변경
   * @param color - 적용할 색상 코드 (HEX 형식)
   */
  const handleColorChange = useCallback(
    (color: string) => {
      // 즉시 툴바 스와치 업데이트
      setSelectedColor(color);
      // 다음 executeCommand 후 상태 동기화에서 덮어쓰지 않도록 일시 고정
      pendingSelectedColorRef.current = color;
      setShowColorPicker(false);
      executeCommand("foreColor", color);
    },
    [executeCommand]
  );

  /**
   * 컬러 피커 토글
   * 컬러 피커 표시/숨김을 제어하고 위치를 계산
   */
  const handleColorPickerToggle = useCallback(() => {
    if (!showColorPicker) {
      const toolbar = containerRef.current?.querySelector('[class*="sticky"]');
      if (toolbar) {
        const rect = toolbar.getBoundingClientRect();
        setColorPickerPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX + 80,
        });
      }
    }
    setShowColorPicker(!showColorPicker);
  }, [showColorPicker]);

  // Heading 메뉴 관리
  const handleHeadingMenuToggle = useCallback(() => {
    if (!showHeadingMenu) {
      const toolbar = containerRef.current?.querySelector('[class*="sticky"]');
      if (toolbar) {
        const rect = toolbar.getBoundingClientRect();
        setHeadingMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX + 10,
        });
      }
    }
    setShowHeadingMenu(!showHeadingMenu);
  }, [showHeadingMenu]);

  const handleHeadingChange = useCallback(
    (level: 1 | 2 | 3 | 4) => {
      if (activeEditor === "title") {
        setShowHeadingMenu(false);
        return;
      }

      const editorRef = getActiveEditorRef();
      editorRef.current?.focus();
      restoreSelection();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowHeadingMenu(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const className = HEADING_CLASS_MAP[level];

      if (!range.collapsed) {
        // 선택 영역 래핑 (내부 마크업 보존)
        const fragment = range.extractContents();
        const span = document.createElement("span");
        span.setAttribute("class", className);
        span.setAttribute("data-heading", String(level));
        span.appendChild(fragment);
        range.insertNode(span);

        // 커서를 span 뒤로 이동 (삽입 노드 기준 결정적 위치)
        const after = document.createRange();
        after.setStartAfter(span);
        after.setEndAfter(span);
        selection.removeAllRanges();
        selection.addRange(after);
      } else {
        // 커서만 있을 때 비어있는 span 삽입 후 내부로 커서 이동
        const span = document.createElement("span");
        span.setAttribute("class", className);
        span.setAttribute("data-heading", String(level));
        span.textContent = "\u200B"; // zero-width space
        range.insertNode(span);

        const inside = document.createRange();
        inside.selectNodeContents(span);
        inside.collapse(true);
        selection.removeAllRanges();
        selection.addRange(inside);
      }

      setIsHeadingActive(true);

      if (activeEditor === "content") {
        handleContentInput();
      } else if (activeEditor === "title") {
        handleTitleInput();
      }

      setShowHeadingMenu(false);
    },
    [
      activeEditor,
      getActiveEditorRef,
      restoreSelection,
      handleContentInput,
      handleTitleInput,
      HEADING_CLASS_MAP,
    ]
  );

  /**
   * 이미지 업로드 버튼 클릭 처리
   */
  const handleImageClick = useCallback(() => {
    // 에디터가 비어있거나 포커스가 없을 수 있으므로 내용 시작 위치로 커서 설정 후 선택 영역 저장
    contentRef.current?.focus();
    if (contentRef.current) {
      setCursorPosition(contentRef.current, false);
      saveSelection();
    }
    imageInputRef.current?.click();
  }, []);

  /**
   * 파일 업로드 버튼 클릭 처리
   */
  const handleFileClick = useCallback(() => {
    contentRef.current?.focus();
    if (contentRef.current) {
      setCursorPosition(contentRef.current, false);
      saveSelection();
    }
    fileInputRef.current?.click();
  }, []);

  /**
   * 에디터에 이미지 삽입
   * @param imageUrl - 삽입할 이미지 URL
   */
  const insertImageToEditor = useCallback(
    (imageUrl: string, clientId?: string) => {
      contentRef.current?.focus();
      // 파일 선택 과정에서 선택영역이 사라진 경우 시작 위치로 커서 보정
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        if (contentRef.current) {
          setCursorPosition(contentRef.current, false);
        }
      }
      restoreSelection();
      const clientAttr = clientId ? ` data-client-id="${clientId}"` : "";
      const img = `<img src="${imageUrl}" alt="업로드된 이미지" class="max-w-full h-auto w-auto block mx-auto"${clientAttr} />`;
      const ok = document.execCommand("insertHTML", false, img);
      if (!ok && contentRef.current) {
        // execCommand 실패 시 직접 삽입 (빈 편집기 첫 삽입 등 브라우저 이슈 대비)
        contentRef.current.insertAdjacentHTML("beforeend", img);
      }
      handleContentInput();
    },
    [restoreSelection, handleContentInput]
  );

  /**
   * 에디터에 파일 링크 삽입
   * @param fileName - 파일명
   * @param fileUrl - 파일 URL
   */
  const insertFileToEditor = useCallback(
    (fileName: string, fileUrl: string, clientId?: string) => {
      contentRef.current?.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        if (contentRef.current) {
          setCursorPosition(contentRef.current, false);
        }
      }
      restoreSelection();

      // 파일 첨부 블록을 원자적으로 다루기 위해 컨테이너로 래핑하고 편집 불가 처리
      const fileAttr = clientId ? ` data-file-id="${clientId}"` : "";
      const attachment = `<span data-attachment="file" class="inline-flex items-center gap-1 select-none" contenteditable="false">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99A1AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/></svg>
        <a href="${fileUrl}" download="${fileName}"${fileAttr}><span class="text-blue-500 underline">${fileName}</span></a>
      </span>`;
      const ok = document.execCommand(
        "insertHTML",
        false,
        attachment + "&nbsp;"
      );
      if (!ok && contentRef.current) {
        contentRef.current.insertAdjacentHTML(
          "beforeend",
          attachment + "&nbsp;"
        );
      }
      handleContentInput();
    },
    [restoreSelection, handleContentInput]
  );

  const handleImageChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        // 즉시 업로드는 하지 않고, clientId만 발급 받아 data-client-id로 심어 둠
        const clientId = onImageUpload
          ? await Promise.resolve(onImageUpload(file))
          : undefined;

        // clientId가 빈 문자열이면 이미지 추가 실패 (예: 최대 개수 초과)
        if (clientId === "") return;

        const previewUrl = URL.createObjectURL(file);
        insertImageToEditor(previewUrl, clientId);
      } finally {
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      }
    },
    [onImageUpload, insertImageToEditor]
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const clientId = onFileUpload
        ? await Promise.resolve(onFileUpload(file))
        : undefined;

      // clientId가 빈 문자열이면 파일 추가 실패 (예: 최대 개수 초과)
      if (clientId === "") return;

      const fileUrl = URL.createObjectURL(file);
      insertFileToEditor(file.name, fileUrl, clientId);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFileUpload, insertFileToEditor]
  );

  /**
   * 제목 영역 포커스 처리
   * 활성 에디터를 제목으로 설정하고 현재 서식 상태 업데이트
   */
  const handleTitleFocus = useCallback(() => {
    setActiveEditor("title");
    setTimeout(() => {
      updateColorFromSelection();
      updateFormatFromSelection();
      checkPlaceholder(titleRef.current, "title");
    }, 0);
  }, [updateColorFromSelection, updateFormatFromSelection, checkPlaceholder]);

  /**
   * 내용 영역 포커스 처리
   * 활성 에디터를 내용으로 설정하고 현재 서식 상태 업데이트
   */
  const handleContentFocus = useCallback(() => {
    setActiveEditor("content");
    setTimeout(() => {
      updateColorFromSelection();
      updateFormatFromSelection();
      checkPlaceholder(contentRef.current, "content");
    }, 0);
  }, [updateColorFromSelection, updateFormatFromSelection, checkPlaceholder]);

  /**
   * 포커스를 내용 영역으로 이동
   * 내용 영역이 비어있으면 시작 위치에 커서 설정
   */
  const moveFocusToContent = useCallback(() => {
    setTimeout(() => {
      contentRef.current?.focus();
      if (contentRef.current && contentRef.current.innerHTML === "") {
        setCursorPosition(contentRef.current, false);
      }
    }, 0);
  }, []);

  /**
   * 포커스를 제목 영역으로 이동
   * 제목 영역의 끝 위치에 커서 설정
   */
  const moveFocusToTitle = useCallback(() => {
    setTimeout(() => {
      titleRef.current?.focus();
      setCursorPosition(titleRef.current!, true);
    }, 0);
  }, []);

  /**
   * 내용을 모두 지우고 내용 영역으로 포커스 이동
   * Ctrl+A + Delete 시 사용
   */
  const clearContentAndFocus = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = "";
    }
    moveFocusToContent();
  }, [moveFocusToContent]);

  // 키보드 핸들러들
  /**
   * 제목 영역 키보드 이벤트 처리
   * Enter, Tab, ArrowDown: 내용 영역으로 이동
   * Ctrl+A + Delete: 내용 지우고 내용 영역으로 이동
   */
  const handleTitleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+A + Delete: 내용 지우고 내용 영역으로 포커스 이동
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        e.ctrlKey &&
        titleRef.current
      ) {
        const selection = window.getSelection();
        const hasSelection =
          selection && selection.rangeCount > 0 && !selection.isCollapsed;

        if (hasSelection) {
          e.preventDefault();
          clearContentAndFocus();
          return;
        }
      }

      // Enter: 내용 영역으로 이동
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        moveFocusToContent();
      }

      // ArrowDown: 내용 영역으로 이동
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        moveFocusToContent();
      }

      // Tab: 내용 영역으로 이동
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        contentRef.current?.focus();
      }
    },
    [clearContentAndFocus, moveFocusToContent]
  );

  /**
   * 내용 영역 키보드 이벤트 처리
   * Delete/Backspace: 선택된 텍스트 삭제 또는 제목으로 이동
   * ArrowUp: 첫 번째 줄에서 제목으로 이동
   */
  const handleContentKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Delete/Backspace 처리
      if ((e.key === "Backspace" || e.key === "Delete") && contentRef.current) {
        const selection = window.getSelection();
        const hasSelection =
          selection && selection.rangeCount > 0 && !selection.isCollapsed;
        const textContent = contentRef.current.textContent?.trim() || "";

        if (hasSelection) {
          // 삭제 후 내용이 비어질지 확인
          const willBeEmpty = (() => {
            const selectedText = selection.toString();
            const remainingText = textContent.replace(selectedText, "").trim();
            return remainingText === "";
          })();

          if (willBeEmpty) {
            // 전체 선택 삭제: 수동으로 삭제하고 포커스 이동
            e.preventDefault();

            // 내용 수동으로 지우기
            if (contentRef.current) {
              contentRef.current.innerHTML = "";
            }

            // 지운 후 제목으로 포커스 이동
            setTimeout(() => {
              moveFocusToTitle();
            }, 0);
            return;
          }
          // 삭제 후 비어있지 않으면 일반 동작 허용
        } else if (textContent === "") {
          // 빈 내용: 제목으로 이동
          e.preventDefault();
          moveFocusToTitle();
          return;
        }
      }

      // 첫 번째 줄 시작에서 Backspace: 제목으로 이동
      if (e.key === "Backspace" && contentRef.current) {
        // 위의 선택 로직에서 이미 처리했으면 건너뛰기
        const selection = window.getSelection();
        const hasSelection =
          selection && selection.rangeCount > 0 && !selection.isCollapsed;
        if (hasSelection) {
          return; // 이미 위에서 처리됨
        }

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          // 더 정확한 체크: 커서가 내용 영역의 맨 처음에 있는지 확인
          const isAtStartOfContent = (() => {
            try {
              // contentRef 시작부터 현재 위치까지의 Range 생성
              const testRange = document.createRange();
              testRange.setStart(contentRef.current!, 0);
              testRange.setEnd(range.startContainer, range.startOffset);

              // Range가 접혀있고 위치가 0이면 시작점에 있음
              return testRange.collapsed && testRange.startOffset === 0;
            } catch {
              return false;
            }
          })();

          if (isAtStartOfContent) {
            e.preventDefault();
            moveFocusToTitle();
          }
        }
      }

      // 첫 번째 줄에서 ArrowUp: 제목으로 이동
      if (e.key === "ArrowUp" && contentRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const isAtFirstLine = (() => {
            try {
              const testRange = range.cloneRange();
              testRange.setStart(contentRef.current!, 0);
              testRange.collapse(true);
              return (
                range.compareBoundaryPoints(Range.START_TO_START, testRange) ===
                0
              );
            } catch {
              return false;
            }
          })();

          if (isAtFirstLine) {
            e.preventDefault();
            moveFocusToTitle();
          }
        }
      }
    },
    [moveFocusToTitle]
  );

  // 블러 처리
  /**
   * 에디터 블러 이벤트 처리
   * 툴바나 컬러 피커 클릭 시에는 블러 방지
   */
  const handleBlur = useCallback(
    (e: FocusEvent) => {
      saveSelection();

      // 툴바나 컬러 피커 클릭 시 블러 방지
      if (
        containerRef.current?.contains(e.relatedTarget as Node) ||
        colorPickerRef.current?.contains(e.relatedTarget as Node)
      ) {
        return;
      }

      // 포커스를 잃을 때도 placeholder 상태를 강제 동기화하여 항상 보이도록 유지
      checkPlaceholder(titleRef.current, "title");
      checkPlaceholder(contentRef.current, "content");
    },
    [saveSelection, checkPlaceholder]
  );

  // 정렬 관리
  /**
   * 현재 정렬 상태에 따른 아이콘 반환
   * @returns 정렬 아이콘 컴포넌트
   */
  const getAlignIcon = useCallback(() => {
    const iconMap = {
      justifyLeft: AlignLeft,
      justifyCenter: AlignCenter,
      justifyRight: AlignRight,
    };
    return iconMap[currentAlign] || AlignLeft;
  }, [currentAlign]);

  /**
   * 정렬 순환 처리
   * 정렬 버튼 클릭 시 다음 정렬로 순환
   */
  const cycleAlign = useCallback(() => {
    const alignments: AlignCommand[] = [
      "justifyLeft",
      "justifyCenter",
      "justifyRight",
    ];
    const currentIndex = alignments.indexOf(currentAlign);
    const nextAlign = alignments[(currentIndex + 1) % alignments.length];
    handleAlign(nextAlign);
  }, [currentAlign, handleAlign]);

  // 이펙트들
  useEffect(() => {
    checkPlaceholder(titleRef.current, "title");
    checkPlaceholder(contentRef.current, "content");
  }, [checkPlaceholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
      if (
        headingMenuRef.current &&
        !headingMenuRef.current.contains(event.target as Node)
      ) {
        setShowHeadingMenu(false);
      }
    };

    if (showColorPicker || showHeadingMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker, showHeadingMenu]);

  // 툴바 버튼 컴포넌트
  const ToolbarButton = useCallback(
    ({
      onClick,
      children,
      ariaLabel,
      disabled = false,
    }: {
      onClick?: () => void;
      children: ReactNode;
      ariaLabel: string;
      disabled?: boolean;
    }) => (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "text-muted-foreground size-8",
          disabled && "cursor-not-allowed text-gray-300"
        )}
        disabled={disabled}
        onMouseDown={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          saveSelection();
          e.preventDefault();
        }}
        onClick={disabled ? undefined : onClick}
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {children}
      </Button>
    ),
    [saveSelection]
  );

  const AlignIcon = getAlignIcon();

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-background border-gray-30 relative flex max-w-full flex-col bg-white",
        className
      )}
    >
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-40 flex w-full touch-manipulation items-center gap-2 overflow-x-auto border-b border-gray-300 bg-white px-5 pt-2 pb-2">
        {/* Heading (H1~H3) - Toolbar 가장 왼쪽 */}
        <div className="relative flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onMouseDown={(e) => {
              if (activeEditor !== "title") {
                saveSelection();
              }
              e.preventDefault();
            }}
            onClick={handleHeadingMenuToggle}
            aria-label="글자 크기"
            tabIndex={-1}
            disabled={activeEditor === "title"}
          >
            {/* '가' 아이콘 형태 */}
            <Icon
              src={IMAGE_URL.ICON.heading.url}
              width={16}
              height={16}
              className={cn(
                activeEditor === "title"
                  ? "text-gray-300"
                  : isHeadingActive
                    ? "text-black"
                    : "text-gray-400"
              )}
            />
          </Button>

          {showHeadingMenu &&
            createPortal(
              <div
                ref={headingMenuRef}
                className="fixed z-[9999] w-36 overflow-hidden rounded border border-gray-300 bg-white shadow-sm"
                style={{
                  top: `${headingMenuPosition.top}px`,
                  left: `${headingMenuPosition.left}px`,
                }}
              >
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-[22px] leading-snug font-bold hover:bg-gray-50"
                  onClick={() => handleHeadingChange(1)}
                >
                  제목1
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-[16px] leading-snug font-bold hover:bg-gray-50"
                  onClick={() => handleHeadingChange(2)}
                >
                  제목2
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-[16px] leading-snug font-medium hover:bg-gray-50"
                  onClick={() => handleHeadingChange(3)}
                >
                  본문1
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-[14px] leading-snug font-medium hover:bg-gray-50"
                  onClick={() => handleHeadingChange(4)}
                >
                  본문2
                </button>
              </div>,
              document.body
            )}
        </div>

        {/* Format buttons */}
        <ToolbarButton
          onClick={() => handleFormat("bold")}
          ariaLabel="굵게"
          disabled={activeEditor === "title"}
        >
          <Bold
            className={cn(
              "size-5",
              activeEditor === "title"
                ? "text-gray-300"
                : activeFormats.bold
                  ? "text-black"
                  : "text-gray-400"
            )}
          />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => handleFormat("underline")}
          ariaLabel="밑줄"
          disabled={activeEditor === "title"}
        >
          <Underline
            className={cn(
              "size-5",
              activeEditor === "title"
                ? "text-gray-300"
                : activeFormats.underline
                  ? "text-black"
                  : "text-gray-400"
            )}
          />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => handleFormat("italic")}
          ariaLabel="기울임"
          disabled={activeEditor === "title"}
        >
          <Italic
            className={cn(
              "size-5",
              activeEditor === "title"
                ? "text-gray-300"
                : activeFormats.italic
                  ? "text-black"
                  : "text-gray-400"
            )}
          />
        </ToolbarButton>

        {/* Color picker */}
        <div className="relative flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-[14px] rounded-[2px]"
            style={{ backgroundColor: selectedColor }}
            onMouseDown={(e) => {
              if (activeEditor !== "title") {
                saveSelection();
              }
              e.preventDefault();
            }}
            onClick={handleColorPickerToggle}
            aria-label="글자 색상"
            tabIndex={-1}
            disabled={activeEditor === "title"}
          />

          {/* Color palette modal */}
          {showColorPicker &&
            createPortal(
              <div
                ref={colorPickerRef}
                className="fixed z-[9999] flex items-center gap-2 rounded border border-gray-300 bg-white p-2 shadow-sm"
                style={{
                  top: `${colorPickerPosition.top}px`,
                  left: `${colorPickerPosition.left}px`,
                }}
              >
                {TEXT_EDITOR.COLOR_PALETTE.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="size-5 rounded-[2px] transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    aria-label={color.name}
                    title={color.name}
                  />
                ))}
              </div>,
              document.body
            )}
        </div>

        {/* Alignment button */}
        <ToolbarButton
          onClick={cycleAlign}
          ariaLabel="정렬"
          disabled={activeEditor === "title"}
        >
          <AlignIcon
            className={cn(
              "size-5",
              activeEditor === "title" ? "text-gray-300" : "text-gray-400"
            )}
          />
        </ToolbarButton>

        {/* Link button */}
        <ToolbarButton ariaLabel="링크" disabled>
          <Link className={cn("size-5", "text-gray-300")} />
        </ToolbarButton>

        {/* Image upload button */}
        <ToolbarButton
          onClick={handleImageClick}
          ariaLabel="이미지"
          disabled={activeEditor === "title"}
        >
          <ImageIcon
            className={cn(
              "size-5",
              activeEditor === "title" ? "text-gray-300" : "text-gray-400"
            )}
          />
        </ToolbarButton>

        {/* File upload button */}
        <ToolbarButton
          onClick={handleFileClick}
          ariaLabel="첨부파일"
          disabled={activeEditor === "title"}
        >
          <Paperclip
            className={cn(
              "size-5",
              activeEditor === "title" ? "text-gray-300" : "text-gray-400"
            )}
          />
        </ToolbarButton>
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
        {/* Title area */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "word-break-break-word overflow-wrap-break-word w-full p-4 pb-0 text-2xl font-bold break-words outline-none",
            showTitlePlaceholder &&
              "[&:empty]:before:text-base [&:empty]:before:leading-[150%] [&:empty]:before:font-bold [&:empty]:before:text-gray-400 [&:empty]:before:content-[attr(data-placeholder)]",
            "touch-manipulation",
            "[&_a]:cursor-pointer [&_a]:text-blue-500 [&_a]:underline"
          )}
          onInput={handleTitleInput}
          onFocus={handleTitleFocus}
          onBlur={handleBlur}
          onKeyDown={handleTitleKeyDown}
          onMouseUp={() => {
            saveSelection();
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          onKeyUp={() => {
            saveSelection();
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          onSelect={() => {
            saveSelection();
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          onClick={() => {
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          data-placeholder={TEXT_EDITOR.PLACEHOLDER.TITLE}
          role="textbox"
          aria-label="제목"
          tabIndex={0}
        />

        {/* Content area */}
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "prose prose-sm prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:block prose-img:mx-auto prose-a:text-blue-500 prose-a:underline prose-a:cursor-pointer prose-a:break-all prose-a:overflow-wrap-break-word w-full max-w-none overflow-x-hidden overflow-y-auto p-4 outline-none",
            showContentPlaceholder &&
              "[&:empty]:before:text-sm [&:empty]:before:leading-[150%] [&:empty]:before:font-normal [&:empty]:before:text-gray-400 [&:empty]:before:content-[attr(data-placeholder)]",
            "word-break-break-word overflow-wrap-break-word break-words whitespace-pre-wrap",
            "touch-manipulation",
            "overscroll-contain",
            "[&_*]:max-w-full [&_*]:overflow-hidden [&_*]:break-words",
            "[&_a]:cursor-pointer [&_a]:text-blue-500 [&_a]:underline"
          )}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${minHeight}px`,
          }}
          onInput={handleContentInput}
          onFocus={handleContentFocus}
          onBlur={handleBlur}
          onKeyDown={handleContentKeyDown}
          onMouseUp={() => {
            saveSelection();
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          onKeyUp={() => {
            saveSelection();
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          onSelect={() => {
            saveSelection();
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          onClick={() => {
            updateColorFromSelection();
            updateFormatFromSelection();
            updateHeadingFromSelection();
          }}
          data-placeholder={TEXT_EDITOR.PLACEHOLDER.CONTENT}
          role="textbox"
          aria-label="내용"
          aria-multiline="true"
          tabIndex={0}
        />
      </div>
    </div>
  );
};

export default TextEditor;
