/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description SGIS API 응답을 기반으로 korean-regions.ts fallback 데이터 업데이트 스크립트
 *
 * 사용법: pnpm tsx scripts/update-regions-fallback.ts
 *
 * @note SGIS 도메인
 * - sgisapi.mods.go.kr 사용 (2025-11-20부터 공식 도메인)
 * - 환경 변수 NEXT_PUBLIC_SGIS_API_DOMAIN으로 도메인을 설정할 수 있습니다.
 * - 주의: 현재 mods 도메인의 인증서가 아직 업데이트되지 않아 임시로 인증서 검증을 우회합니다.
 *   인증서가 업데이트되면 이 옵션을 제거해야 합니다.
 */

import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.join(__dirname, "..");
loadEnvConfig(projectDir);

// 임시: mods 도메인 인증서 미업데이트로 인한 검증 우회
// TODO: 인증서 업데이트 후 제거 필요
// 주의: 보안상 프로덕션에서는 사용하지 말 것
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn(
    "⚠️  임시로 TLS 인증서 검증을 비활성화했습니다. (mods 도메인 인증서 미업데이트)"
  );
}

// 환경 변수 가져오기
const SGIS_API_DOMAIN = process.env.NEXT_PUBLIC_SGIS_API_DOMAIN;

const SGIS_API_BASE_URL = `https://${SGIS_API_DOMAIN}/OpenAPI3`;
const SGIS_AUTH_URL = `${SGIS_API_BASE_URL}/auth/authentication.json`;
const SGIS_ADDR_STAGE_URL = `${SGIS_API_BASE_URL}/addr/stage.json`;

const SERVICE_ID = process.env.NEXT_PUBLIC_SGIS_SERVICE_ID;
const SECURE_KEY = process.env.NEXT_PUBLIC_SGIS_SECURE_KEY;
interface SidoItem {
  code: string;
  name: string;
  fullName: string;
}

interface SigunguItem {
  code: string;
  name: string;
  fullName: string;
}

interface Region {
  code: string;
  name: string;
  districts: District[];
}

interface District {
  code: string;
  name: string;
}

async function getAccessToken(): Promise<string> {
  const response = await fetch(
    `${SGIS_AUTH_URL}?consumer_key=${SERVICE_ID}&consumer_secret=${SECURE_KEY}`
  );

  if (!response.ok) {
    throw new Error(`SGIS 인증 실패: ${response.status}`);
  }

  const data = await response.json();

  if (data.errCd !== 0) {
    throw new Error(`SGIS 인증 오류: ${data.errMsg || "알 수 없는 오류"}`);
  }

  return data.result.accessToken;
}

async function getSidoList(accessToken: string): Promise<SidoItem[]> {
  const url = new URL(SGIS_ADDR_STAGE_URL);
  url.searchParams.append("accessToken", accessToken);
  url.searchParams.append("pg_yn", "0");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`SGIS 주소 조회 실패: ${response.status}`);
  }

  const data = await response.json();

  if (data.errCd !== 0) {
    throw new Error(`SGIS 주소 조회 오류: ${data.errMsg || "알 수 없는 오류"}`);
  }

  return (data.result || []).map((item: any) => ({
    code: item.cd,
    name: item.addr_name,
    fullName: item.full_addr,
  }));
}

async function getSigunguList(
  accessToken: string,
  sidoCode: string
): Promise<SigunguItem[]> {
  const url = new URL(SGIS_ADDR_STAGE_URL);
  url.searchParams.append("accessToken", accessToken);
  url.searchParams.append("cd", sidoCode);
  url.searchParams.append("pg_yn", "0");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`SGIS 주소 조회 실패: ${response.status}`);
  }

  const data = await response.json();

  if (data.errCd !== 0) {
    throw new Error(`SGIS 주소 조회 오류: ${data.errMsg || "알 수 없는 오류"}`);
  }

  return (data.result || []).map((item: any) => ({
    code: item.cd,
    name: item.addr_name,
    fullName: item.full_addr,
  }));
}

function generateRegionsFile(regions: Region[]): string {
  const regionsJson = JSON.stringify(regions, null, 2)
    .replace(/"code":/g, "code:")
    .replace(/"name":/g, "name:")
    .replace(/"districts":/g, "districts:")
    .replace(/"/g, '"')
    .replace(/^/gm, "    ");

  return `/**
 * @description 한국 지역 데이터 (시/도, 구/군)
 * @note 이 파일은 API 실패 시 fallback으로 사용됩니다.
 * API 응답이 있으면 API 데이터를 우선 사용하고, 이 파일의 데이터는 보조적으로 사용됩니다.
 * 
 * 이 파일은 scripts/update-regions-fallback.ts 스크립트로 자동 업데이트됩니다.
 * API 응답이 변경되면 해당 스크립트를 실행하여 fallback 데이터를 업데이트하세요.
 */

export interface Region {
  code: string;
  name: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
}

/**
 * @description Fallback 지역 데이터
 * API 실패 시 사용되며, API 응답이 있으면 API 데이터로 업데이트됩니다.
 */
export const KOREAN_REGIONS_FALLBACK: Region[] = ${regionsJson};
`;
}

async function main() {
  try {
    console.log("🔄 SGIS API에서 지역 데이터 가져오는 중...");

    const accessToken = await getAccessToken();
    console.log("✅ 인증 토큰 발급 완료");

    const sidoList = await getSidoList(accessToken);
    console.log(`✅ 시도 목록 조회 완료 (${sidoList.length}개)`);

    const regions: Region[] = [];

    for (const sido of sidoList) {
      console.log(`  📍 ${sido.name} (${sido.code}) 처리 중...`);

      const sigunguList = await getSigunguList(accessToken, sido.code);

      regions.push({
        code: sido.code,
        name: sido.name,
        districts: sigunguList.map((sigungu) => ({
          code: sigungu.code,
          name: sigungu.name,
        })),
      });

      // API 호출 제한을 고려한 딜레이
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n✅ 모든 지역 데이터 수집 완료 (${regions.length}개 시도)`);

    const fileContent = generateRegionsFile(regions);

    const filePath = path.join(
      process.cwd(),
      "src/constants/shared/korean-regions.ts"
    );
    await fsPromises.writeFile(filePath, fileContent, "utf-8");

    console.log(`\n✅ ${filePath} 파일 업데이트 완료`);
    console.log(`\n📊 통계:`);
    console.log(`   - 시도: ${regions.length}개`);
    console.log(
      `   - 총 구/군: ${regions.reduce((sum, r) => sum + r.districts.length, 0)}개`
    );
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

main();
