import { NextRequest, NextResponse } from "next/server";
import { NotionAPI } from "notion-client";

// Next.js의 revalidate 옵션 사용
export const revalidate = 3600; // 1시간 캐싱

/**
 * @description 프로그램 Notion 페이지 블록 조회 API Route
 * notion-client를 사용하여 외부 Notion API 서버(https://www.notion.so)로 직접 요청
 * react-notion-x를 위한 recordMap 형식 반환
 *
 * 참고:
 * - notion-client는 공식 Notion API(@notionhq/client)와 다른 내부 API를 사용합니다
 * - react-notion-x는 recordMap 형식이 필요하므로 notion-client를 사용합니다
 * - notion-client는 기본적으로 https://www.notion.so로 요청을 보냅니다
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params;

    if (!programId) {
      return NextResponse.json(
        { error: "프로그램 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Notion API 키 확인
    const notionApiKey = process.env.NOTION_API_KEY;
    if (!notionApiKey) {
      return NextResponse.json(
        { error: "Notion API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // notion-client를 사용하여 외부 Notion API 서버로 직접 요청
    // NotionAPI는 내부적으로 https://www.notion.so로 요청을 보냅니다
    // react-notion-x가 요구하는 recordMap 형식을 반환합니다
    const notion = new NotionAPI({
      authToken: notionApiKey,
    });

    // 외부 Notion API 서버에서 recordMap 가져오기
    const recordMap = await notion.getPage(programId);

    return NextResponse.json({
      status: 200,
      data: recordMap,
    });
  } catch (error) {
    console.error("[Notion API] 외부 Notion API 서버 요청 오류:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
