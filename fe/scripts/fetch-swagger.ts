#!/usr/bin/env tsx

/**
 * @description 백엔드 서버에서 Swagger JSON 스펙을 다운로드하는 스크립트
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { loadEnvConfig } from "@next/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Next.js 공식 환경 변수 로더 사용
const projectDir = path.join(__dirname, "..");
loadEnvConfig(projectDir);

// 환경변수 디버깅
console.log("\n🔍 환경 변수 확인:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(
  `NEXT_PUBLIC_SWAGGER_URL 값: ${process.env.NEXT_PUBLIC_SWAGGER_URL || "(undefined)"}`
);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 환경변수 : 노션 env 참고
const SWAGGER_URL = process.env.NEXT_PUBLIC_SWAGGER_URL;

const OUTPUT_FILE = path.join(__dirname, "../swagger.json");

async function fetchSwaggerSpec() {
  try {
    if (!SWAGGER_URL) {
      throw new Error(
        "환경 변수 NEXT_PUBLIC_SWAGGER_URL이 설정되지 않았습니다.\n" +
          ".env.local 또는 .env 파일에 NEXT_PUBLIC_SWAGGER_URL을 설정해주세요."
      );
    }

    console.log("🔄 Swagger 스펙 다운로드 중...");
    console.log(`📍 URL: ${SWAGGER_URL}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30초 타임아웃

    console.log("📡 요청 중...");
    const response = await fetch(SWAGGER_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeout);

    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "응답 본문을 읽을 수 없음");
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}\n` +
          `URL: ${SWAGGER_URL}\n` +
          `응답: ${errorText.substring(0, 500)}`
      );
    }

    console.log("📦 JSON 파싱 중...");
    const swaggerSpec = await response.json();

    console.log("💾 파일 저장 중...");
    // swagger.json 파일로 저장
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(swaggerSpec, null, 2));

    console.log("✅ Swagger 스펙 다운로드 완료");
    console.log(`📁 저장 위치: ${OUTPUT_FILE}`);
    console.log(
      `📊 API 엔드포인트 수: ${Object.keys(swaggerSpec.paths || {}).length}`
    );

    return swaggerSpec;
  } catch (error) {
    console.error("\n❌ Swagger 스펙 다운로드 실패:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (error instanceof Error) {
      console.error(`에러 메시지: ${error.message}`);
      if (error.stack) {
        console.error(`\n스택 트레이스:\n${error.stack}`);
      }
    } else {
      console.error(`에러: ${JSON.stringify(error, null, 2)}`);
    }

    console.error(`\nURL: ${SWAGGER_URL || "(설정되지 않음)"}`);
    console.error(`환경 변수:`);
    console.error(
      `  NEXT_PUBLIC_SWAGGER_URL: ${process.env.NEXT_PUBLIC_SWAGGER_URL || "(없음)"}`
    );
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 기존 파일이 있다면 사용
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log("⚠️  기존 swagger.json 파일을 사용합니다.");
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    }

    throw error;
  }
}

// 스크립트가 직접 실행될 때만 실행 (ESM-safe)
const isMain = import.meta.url === pathToFileURL(process.argv[1]!).href;
if (isMain) {
  fetchSwaggerSpec()
    .then(() => {
      console.log("🎉 Swagger 스펙 가져오기 완료");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 스크립트 실행 실패:");
      if (error instanceof Error) {
        console.error(`에러: ${error.message}`);
        if (error.stack) {
          console.error(`\n스택 트레이스:\n${error.stack}`);
        }
      } else {
        console.error(`에러: ${JSON.stringify(error, null, 2)}`);
      }
      process.exit(1);
    });
}

export { fetchSwaggerSpec };
