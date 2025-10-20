#!/usr/bin/env tsx

/**
 * @description 백엔드 서버에서 Swagger JSON 스펙을 다운로드하는 스크립트
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { debug } from "@/utils/shared/debugger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SWAGGER_URL =
  process.env.NEXT_PUBLIC_SWAGGER_URL ||
  "http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api/api-docs.json";
const OUTPUT_FILE = path.join(__dirname, "../swagger.json");

async function fetchSwaggerSpec() {
  try {
    debug.log("🔄 Swagger 스펙 다운로드 중...");
    debug.log(`📍 URL: ${SWAGGER_URL}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(SWAGGER_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const swaggerSpec = await response.json();

    // swagger.json 파일로 저장
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(swaggerSpec, null, 2));

    debug.log("✅ Swagger 스펙 다운로드 완료");
    debug.log(`📁 저장 위치: ${OUTPUT_FILE}`);
    debug.log(
      `📊 API 엔드포인트 수: ${Object.keys(swaggerSpec.paths || {}).length}`
    );

    return swaggerSpec;
  } catch (error) {
    debug.error("❌ Swagger 스펙 다운로드 실패:", error);

    // 기존 파일이 있다면 사용
    if (fs.existsSync(OUTPUT_FILE)) {
      debug.log("⚠️  기존 swagger.json 파일을 사용합니다.");
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
      debug.log("🎉 Swagger 스펙 가져오기 완료");
      process.exit(0);
    })
    .catch((error) => {
      debug.error("💥 오류 발생:", error.message);
      process.exit(1);
    });
}

export { fetchSwaggerSpec };
