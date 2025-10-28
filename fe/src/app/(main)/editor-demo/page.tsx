"use client";

import * as React from "react";
import TextEditor from "@/components/shared/text-editor";

const EditorDemoPage = () => {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const handleTitleChange = React.useCallback((value: string) => {
    setTitle(value);
  }, []);

  const handleContentChange = React.useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleImageUpload = React.useCallback((file: File) => {
    // 이미지 업로드 처리
    // 여기서 실제 업로드 로직 구현
    // 예: API 호출, Firebase Storage 등
    void file; // 데모용: 파일 사용 표시
  }, []);

  const handleFileUpload = React.useCallback((file: File) => {
    // 파일 업로드 처리
    // 여기서 실제 업로드 로직 구현
    void file; // 데모용: 파일 사용 표시
  }, []);

  return (
    <div className="space-y-6">
      <TextEditor
        className="min-h-[500px]"
        minHeight={400}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        onImageUpload={handleImageUpload}
        onFileUpload={handleFileUpload}
      />

      {/* Title Preview */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">제목 미리보기</h2>
        <div className="bg-muted/30 rounded-lg border p-4">
          <pre className="overflow-x-auto text-xs">
            <code>{title || "제목이 비어있습니다."}</code>
          </pre>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">내용 미리보기</h2>
        <div className="bg-muted/30 rounded-lg border p-4">
          <pre className="overflow-x-auto text-xs">
            <code>{content || "내용이 비어있습니다."}</code>
          </pre>
        </div>
      </div>

      {/* Rendered Content */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">렌더링 결과</h2>
        <div className="bg-background space-y-4 rounded-lg border p-4">
          <div
            className="text-2xl font-bold"
            dangerouslySetInnerHTML={{
              __html: title || "<p>제목이 비어있습니다.</p>",
            }}
          />
          <hr />
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: content || "<p>내용이 비어있습니다.</p>",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorDemoPage;
