"use client";

import * as React from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

const EditorDemoPage = () => {
  const [content, setContent] = React.useState(MOCK_CONTENT);

  const handleChange = React.useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleImageUpload = React.useCallback((file: File) => {
    console.log("이미지 업로드:", file.name);
    // 여기서 실제 업로드 로직 구현
    // 예: API 호출, Firebase Storage 등
  }, []);

  const handleFileUpload = React.useCallback((file: File) => {
    console.log("파일 업로드:", file.name);
    // 여기서 실제 업로드 로직 구현
  }, []);

  return (
    <div className="container mx-auto mb-[30vh] flex p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">스티키 툴바 에디터 데모</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            모바일에서 에디터를 스크롤해도 툴바가 상단에 고정됩니다.
          </p>
        </div>

        <RichTextEditor
          value={content}
          onChange={handleChange}
          placeholder="여기에 내용을 입력하세요..."
          className="min-h-[500px]"
          minHeight={400}
          onImageUpload={handleImageUpload}
          onFileUpload={handleFileUpload}
        />

        {/* Content Preview */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">HTML 미리보기</h2>
          <div className="bg-muted/30 rounded-lg border p-4">
            <pre className="overflow-x-auto text-xs">
              <code>{content || "내용이 비어있습니다."}</code>
            </pre>
          </div>
        </div>

        {/* Rendered Content */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">렌더링 결과</h2>
          <div
            className="prose prose-sm bg-background max-w-none rounded-lg border p-4"
            dangerouslySetInnerHTML={{
              __html: content || "<p>내용이 비어있습니다.</p>",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const MOCK_CONTENT = `
이것은 매우 긴 텍스트입니다. 에디터의 스크롤 동작을 테스트하기 위해 충분히 긴 내용을 입력하겠습니다. 

첫 번째 문단입니다. 여기에는 많은 텍스트가 들어갑니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

두 번째 문단입니다. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

세 번째 문단입니다. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

네 번째 문단입니다. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

다섯 번째 문단입니다. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

여섯 번째 문단입니다. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?

일곱 번째 문단입니다. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

여덟 번째 문단입니다. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

아홉 번째 문단입니다. Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

열 번째 문단입니다. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

이제 충분히 긴 내용이 입력되었습니다. 스크롤을 해서 툴바가 제대로 고정되는지 확인해보겠습니다.`;

export default EditorDemoPage;
