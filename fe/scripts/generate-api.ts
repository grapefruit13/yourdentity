/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @description Swagger JSON을 기반으로 API 코드를 자동 생성하는 스크립트
 * - TypeScript 타입 정의
 * - API 함수들
 * - Query Keys
 * - React Query Hooks
 */

import fs from "fs";
import path from "path";
// import { debug as debugUtil } from "@/utils/shared/debugger";

// 간단한 로그 함수
const debug = {
  log: (msg: string, ...args: any[]) => console.log(msg, ...args),
  error: (msg: string, ...args: any[]) => console.error(msg, ...args),
};

// 파일 경로 설정
const SWAGGER_FILE = path.join(__dirname, "../swagger.json");
const OUTPUT_DIR = path.join(__dirname, "../src");
const TYPES_DIR = path.join(OUTPUT_DIR, "types/generated");
const API_DIR = path.join(OUTPUT_DIR, "api/generated");
const HOOKS_DIR = path.join(OUTPUT_DIR, "hooks/generated");
const CONSTANTS_DIR = path.join(OUTPUT_DIR, "constants/generated");

// 디렉토리 생성
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 사용 가능한 스키마 이름 추적 (Swagger components.schemas의 키)
const availableSchemaNames = new Set<string>();

// Swagger 스펙 파싱
interface SwaggerSpec {
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, any>;
  };
  tags: Array<{ name: string; description: string }>;
}

// API 엔드포인트 정보
interface ApiEndpoint {
  path: string;
  method: string;
  operationId: string;
  summary: string;
  tags: string[];
  parameters: any[];
  requestBody?: any;
  responses: Record<string, any>;
}

// 타입 생성
function generateTypes(spec: SwaggerSpec): string {
  const schemas = spec.components?.schemas || {};
  let types = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

/**
 * @description Swagger에서 자동 생성된 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */


`;

  // 기본 타입들
  types += `// 기본 응답 타입
export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

`;

  // 스키마 타입들 생성
  Object.entries(schemas).forEach(([name, schema]) => {
    if (schema && schema.type === "object" && schema.properties) {
      types += `export interface ${name} {\n`;
      Object.entries(schema.properties).forEach(
        ([propName, propSchema]: [string, any]) => {
          const type = getTypeScriptType(propSchema);
          const optional = schema.required?.includes(propName) ? "" : "?";
          types += `  ${propName}${optional}: ${type};\n`;
        }
      );
      types += `}\n\n`;
    }
  });

  return types;
}

// TypeScript 타입 변환
function getTypeScriptType(schema: any): string {
  if (!schema) return "any";

  if (schema.type === "string") {
    if (schema.enum) {
      return schema.enum.map((v: string) => `"${v}"`).join(" | ");
    }
    if (schema.format === "date-time") return "string";
    if (schema.format === "email") return "string";
    return "string";
  }
  if (schema.type === "number" || schema.type === "integer") return "number";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "array") {
    const itemType = getTypeScriptType(schema.items);
    return `${itemType}[]`;
  }
  if (schema.type === "object") {
    if (schema.properties) {
      let objType = "{\n";
      Object.entries(schema.properties).forEach(
        ([propName, propSchema]: [string, any]) => {
          const type = getTypeScriptType(propSchema);
          const optional = schema.required?.includes(propName) ? "" : "?";
          objType += `    ${propName}${optional}: ${type};\n`;
        }
      );
      objType += "  }";
      return objType;
    }
    return "Record<string, any>";
  }
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    return refName ? `Schema.${refName}` : "any";
  }
  return "any";
}

// 함수명 생성 (카멜케이스)
function generateFunctionName(method: string, path: string): string {
  const methodPrefix = method.toLowerCase();

  // 경로를 파싱하여 더 구체적인 함수명 생성
  const pathSegments = path
    .split("/")
    .filter((part) => part && !part.startsWith("{"));

  // 각 세그먼트를 적절히 변환
  const convertedSegments = pathSegments.map((part, index) => {
    // 하이픈을 제거하고 카멜케이스로 변환
    const camelCasePart = part.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    // 첫 번째 세그먼트는 소문자로, 나머지는 첫 글자만 대문자로
    if (index === 0) {
      return camelCasePart.toLowerCase();
    }

    // 특별한 경우 처리
    const specialCases: Record<string, string> = {
      posts: "Posts",
      members: "Members",
      comments: "Comments",
      like: "Like",
      sync: "Sync",
      delete: "Delete",
      communities: "Communities",
      users: "Users",
      missions: "Missions",
      routines: "Routines",
      gatherings: "Gatherings",
      announcements: "Announcements",
      faqs: "Faqs",
      fcm: "Fcm",
      images: "Images",
      tmi: "Tmi",
      store: "Store",
      auth: "Auth",
      uploadImage: "UploadImage",
    };

    return (
      specialCases[camelCasePart] ||
      camelCasePart.charAt(0).toUpperCase() + camelCasePart.slice(1)
    );
  });

  // 전체 경로를 조합
  const fullPath = convertedSegments.join("");

  // 경로 파라미터 개수에 따라 추가 식별자
  const paramCount = (path.match(/\{/g) || []).length;
  let suffix = "";
  if (paramCount === 1) suffix = "ById";
  else if (paramCount === 2) suffix = "ByTwoIds";
  else if (paramCount > 2) suffix = "ByMultipleIds";

  return `${methodPrefix}${fullPath.charAt(0).toUpperCase() + fullPath.slice(1)}${suffix}`;
}

// 타입명 생성
function generateTypeName(
  method: string,
  path: string,
  type: "Req" | "Res"
): string {
  const methodPrefix = method.toUpperCase();

  // 경로를 파싱하여 더 구체적인 타입명 생성
  const pathSegments = path
    .split("/")
    .filter((part) => part && !part.startsWith("{"));

  // 각 세그먼트를 적절히 변환
  const convertedSegments = pathSegments.map((part) => {
    // 하이픈을 제거하고 카멜케이스로 변환
    const camelCasePart = part.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    // 특별한 경우 처리
    const specialCases: Record<string, string> = {
      posts: "Posts",
      members: "Members",
      comments: "Comments",
      like: "Like",
      sync: "Sync",
      delete: "Delete",
      communities: "Communities",
      users: "Users",
      missions: "Missions",
      routines: "Routines",
      gatherings: "Gatherings",
      announcements: "Announcements",
      faqs: "Faqs",
      fcm: "Fcm",
      images: "Images",
      tmi: "Tmi",
      store: "Store",
      auth: "Auth",
      uploadImage: "UploadImage",
    };

    return (
      specialCases[camelCasePart] ||
      camelCasePart.charAt(0).toUpperCase() + camelCasePart.slice(1)
    );
  });

  // 전체 경로를 조합
  const fullPath = convertedSegments.join("");

  // 경로 파라미터 개수에 따라 추가 식별자
  const paramCount = (path.match(/\{/g) || []).length;
  let suffix = "";
  if (paramCount === 1) suffix = "ById";
  else if (paramCount === 2) suffix = "ByTwoIds";
  else if (paramCount > 2) suffix = "ByMultipleIds";

  return `T${methodPrefix}${fullPath}${suffix}${type}`;
}

// API 함수 생성
function generateApiFunctions(endpoints: ApiEndpoint[]): string {
  // 태그별로 그룹화
  const groupedEndpoints = endpoints.reduce(
    (acc, endpoint) => {
      const tag = endpoint.tags[0] || "default";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(endpoint);
      return acc;
    },
    {} as Record<string, ApiEndpoint[]>
  );

  Object.entries(groupedEndpoints).forEach(([tag, tagEndpoints]) => {
    const fileName = `${tag.toLowerCase()}-api.ts`;
    const filePath = path.join(API_DIR, fileName);

    let fileContent = `
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description ${tag} 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/${tag.toLowerCase()}-types";
import type { Result } from "@/types/shared/response";

`;

    tagEndpoints.forEach((endpoint) => {
      const {
        path: endpointPath,
        method,
        operationId,
        parameters = [],
        requestBody,
        responses,
      } = endpoint;

      // 함수명 생성 (카멜케이스)
      const funcName =
        operationId || generateFunctionName(method, endpointPath);

      // 타입명 생성
      const reqTypeName = generateTypeName(method, endpointPath, "Req");
      const resTypeName = generateTypeName(method, endpointPath, "Res");

      // 파라미터 타입 생성
      const pathParams = parameters.filter((p: any) => p.in === "path");
      const queryParams = parameters.filter((p: any) => p.in === "query");
      const hasRequestBody =
        requestBody && requestBody.content?.["application/json"]?.schema;

      // 응답 스키마 확인
      const successResponse =
        responses["200"] || responses["201"] || responses["204"];
      const hasResponseSchema =
        successResponse?.content?.["application/json"]?.schema;

      // URL 생성
      let url = endpointPath;
      if (pathParams.length > 0) {
        pathParams.forEach((p: any) => {
          url = url.replace(`{${p.name}}`, `\${request.${p.name}}`);
        });
      }

      // HTTP 메서드에 따른 함수 생성
      const httpMethod = method.toLowerCase();
      const axiosMethod = httpMethod === "delete" ? "del" : httpMethod;

      // 함수 생성
      const hasRequestParams =
        pathParams.length > 0 || queryParams.length > 0 || hasRequestBody;
      const hasResponseType = hasResponseSchema;

      if (hasRequestParams) {
        fileContent += `export const ${funcName} = (request: Types.${reqTypeName}) => {\n`;
      } else {
        fileContent += `export const ${funcName} = () => {\n`;
      }

      if (queryParams.length > 0 && !hasRequestBody) {
        // GET 요청의 경우 queryParams를 params로 전달
        const responseType = hasResponseType
          ? `Result<Types.${resTypeName}>`
          : "Result<any>";
        fileContent += `  return ${axiosMethod}<${responseType}>(\`${url}\`, { params: request });\n`;
      } else if (hasRequestBody && pathParams.length > 0) {
        // POST/PUT/PATCH 요청의 경우 pathParams와 data 분리
        const pathParamNames = pathParams.map((p: any) => p.name).join(", ");
        const responseType = hasResponseType
          ? `Result<Types.${resTypeName}>`
          : "Result<any>";
        fileContent += `  const { ${pathParamNames}, ...data } = request;\n`;
        fileContent += `  return ${axiosMethod}<${responseType}>(\`${url}\`, data);\n`;
      } else if (hasRequestBody) {
        // POST/PUT/PATCH 요청 (pathParams 없는 경우)
        const responseType = hasResponseType
          ? `Result<Types.${resTypeName}>`
          : "Result<any>";
        fileContent += `  return ${axiosMethod}<${responseType}>(\`${url}\`, request);\n`;
      } else {
        // GET 요청 (pathParams만 있는 경우 또는 파라미터 없는 경우)
        const responseType = hasResponseType
          ? `Result<Types.${resTypeName}>`
          : "Result<any>";
        fileContent += `  return ${axiosMethod}<${responseType}>(\`${url}\`);\n`;
      }

      fileContent += `};\n\n`;
    });

    fs.writeFileSync(filePath, fileContent);
    debug.log(`✅ ${fileName} 생성 완료`);
  });

  return "";
}

// 타입 파일 생성
function generateTypeFiles(endpoints: ApiEndpoint[]): void {
  // 태그별로 그룹화
  const groupedEndpoints = endpoints.reduce(
    (acc, endpoint) => {
      const tag = endpoint.tags[0] || "default";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(endpoint);
      return acc;
    },
    {} as Record<string, ApiEndpoint[]>
  );

  Object.entries(groupedEndpoints).forEach(([tag, tagEndpoints]) => {
    const fileName = `${tag.toLowerCase()}-types.ts`;
    const filePath = path.join(TYPES_DIR, fileName);

    let fileContent = `/**
 * @description ${tag} 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

`;

    tagEndpoints.forEach((endpoint) => {
      const {
        path: endpointPath,
        method,
        parameters = [],
        requestBody,
        responses,
      } = endpoint;

      // 타입명 생성
      const reqTypeName = generateTypeName(method, endpointPath, "Req");
      const resTypeName = generateTypeName(method, endpointPath, "Res");

      // Request 타입 생성 (파라미터가 있는 경우에만)
      const pathParams = parameters.filter((p: any) => p.in === "path");
      const queryParams = parameters.filter((p: any) => p.in === "query");
      const hasRequestBody =
        requestBody && requestBody.content?.["application/json"]?.schema;

      if (pathParams.length > 0 || queryParams.length > 0 || hasRequestBody) {
        fileContent += `export interface ${reqTypeName} {\n`;

        // Path parameters
        pathParams.forEach((p: any) => {
          fileContent += `  ${p.name}: string;\n`;
        });

        // Query parameters
        queryParams.forEach((p: any) => {
          const type = getTypeScriptType(p.schema);
          const optional = p.required ? "" : "?";
          fileContent += `  ${p.name}${optional}: ${type};\n`;
        });

        // Request body
        if (hasRequestBody) {
          const bodySchema = requestBody.content["application/json"].schema;
          if (bodySchema.$ref) {
            const refName = bodySchema.$ref.split("/").pop();
            if (refName && availableSchemaNames.has(refName)) {
              fileContent += `  data: Schema.${refName};\n`;
            } else {
              fileContent += `  data: any;\n`;
            }
          } else {
            // 인라인 스키마인 경우 직접 타입 생성
            const bodyType = getTypeScriptType(bodySchema);
            fileContent += `  data: ${bodyType};\n`;
          }
        }

        fileContent += `}\n\n`;
      }

      // Response 타입 생성 (응답 스키마가 있는 경우에만)
      const successResponse =
        responses["200"] || responses["201"] || responses["204"];
      const hasResponseSchema =
        successResponse?.content?.["application/json"]?.schema;

      if (hasResponseSchema) {
        fileContent += `export type ${resTypeName} = `;
        const responseSchema =
          successResponse.content["application/json"].schema;

        if (responseSchema.$ref) {
          const refName = responseSchema.$ref.split("/").pop();
          if (refName && availableSchemaNames.has(refName)) {
            fileContent += `Schema.${refName};\n\n`;
          } else {
            fileContent += `any;\n\n`;
          }
        } else if (responseSchema.properties?.data) {
          // 응답 스키마에 data 필드가 있는 경우, data 필드의 타입만 추출
          const dataType = getTypeScriptType(responseSchema.properties.data);
          fileContent += `${dataType};\n\n`;
        } else {
          // 인라인 스키마인 경우 직접 타입 생성
          const responseType = getTypeScriptType(responseSchema);
          fileContent += `${responseType};\n\n`;
        }
      }
    });

    fs.writeFileSync(filePath, fileContent);
    debug.log(`✅ ${fileName} 생성 완료`);
  });
}

// Query Keys 생성
function generateQueryKeys(endpoints: ApiEndpoint[]): string {
  let queryKeys = `
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @description Swagger에서 자동 생성된 Query Keys
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

`;

  // 태그별로 그룹화
  const groupedEndpoints = endpoints.reduce(
    (acc, endpoint) => {
      const tag = endpoint.tags[0] || "default";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(endpoint);
      return acc;
    },
    {} as Record<string, ApiEndpoint[]>
  );

  // 타입 임포트 추가 (요청 파라미터가 있는 태그에 한해)
  const tagNames = Object.keys(groupedEndpoints).map((t) => t.toLowerCase());
  const uniqueTagNames = Array.from(new Set(tagNames));
  if (uniqueTagNames.length > 0) {
    uniqueTagNames.forEach((name) => {
      queryKeys += `import type * as ${name}Types from "@/types/generated/${name}-types";\n`;
    });
    queryKeys += `\n`;
  }

  // 공용 헬퍼: 쿼리 정규화 및 키 빌더 (파일당 한 번만 선언)
  queryKeys += `function __normalizeQuery(obj: Record<string, unknown>) {\n`;
  queryKeys += `  const normalized: Record<string, unknown> = {};\n`;
  queryKeys += `  Object.keys(obj).forEach((k) => {\n`;
  queryKeys += `    const val = (obj as any)[k];\n`;
  queryKeys += `    if (val === undefined) return;\n`;
  queryKeys += `    normalized[k] = val instanceof Date ? val.toISOString() : val;\n`;
  queryKeys += `  });\n`;
  queryKeys += `  return normalized;\n`;
  queryKeys += `}\n\n`;

  queryKeys += `function __buildKey(tag: string, name: string, parts?: { path?: Record<string, unknown>; query?: Record<string, unknown> }) {\n`;
  queryKeys += `  if (!parts) return [tag, name] as const;\n`;
  queryKeys += `  const { path, query } = parts;\n`;
  queryKeys += `  return [tag, name, path ?? {}, __normalizeQuery(query ?? {})] as const;\n`;
  queryKeys += `}\n\n`;

  Object.entries(groupedEndpoints).forEach(([tag, tagEndpoints]) => {
    const tagName = tag.toLowerCase();
    queryKeys += `// ${tag} Query Keys\nexport const ${tagName}Keys = {\n`;

    tagEndpoints.forEach((endpoint) => {
      const {
        method,
        operationId,
        path,
        parameters = [],
        requestBody,
      } = endpoint;
      const keyName = operationId || generateFunctionName(method, path);

      // GET만 키 생성 (중복/불필요한 키 생성 방지)
      if (method.toLowerCase() !== "get") {
        return;
      }

      const pathParams = parameters.filter((p: any) => p.in === "path");
      const queryParams = parameters.filter((p: any) => p.in === "query");
      const hasRequestBody =
        requestBody && requestBody.content?.["application/json"]?.schema;
      const hasRequestParams =
        pathParams.length > 0 || queryParams.length > 0 || hasRequestBody;

      if (hasRequestParams) {
        const reqTypeName = generateTypeName(method, path, "Req");
        const pathKeysStr = pathParams
          .map((p: any) => `${p.name}: request.${p.name}`)
          .join(", ");
        const queryKeysStr = queryParams
          .map((p: any) => `${p.name}: request.${p.name}`)
          .join(", ");

        queryKeys += `  ${keyName}: (request: ${tagName}Types.${reqTypeName}) => __buildKey("${tagName}", "${keyName}", { path: { ${pathKeysStr} }, query: { ${queryKeysStr} } }),\n`;
      } else {
        // 요청 파라미터가 없는 경우 상수 키
        queryKeys += `  ${keyName}: __buildKey("${tagName}", "${keyName}"),\n`;
      }
    });

    queryKeys += `} as const;\n\n`;
  });

  return queryKeys;
}

// React Query Hooks 생성
function generateHooks(endpoints: ApiEndpoint[]): string {
  // 태그별로 그룹화
  const groupedEndpoints = endpoints.reduce(
    (acc, endpoint) => {
      const tag = endpoint.tags[0] || "default";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(endpoint);
      return acc;
    },
    {} as Record<string, ApiEndpoint[]>
  );

  Object.entries(groupedEndpoints).forEach(([tag, tagEndpoints]) => {
    const fileName = `${tag.toLowerCase()}-hooks.ts`;
    const filePath = path.join(HOOKS_DIR, fileName);

    let fileContent = `/**
 * @description ${tag} 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/${tag.toLowerCase()}-api";
import { ${tag.toLowerCase()}Keys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/${tag.toLowerCase()}-types";

`;

    tagEndpoints.forEach((endpoint) => {
      const {
        method,
        operationId,
        path,
        parameters = [],
        requestBody,
      } = endpoint;
      const funcName = operationId || generateFunctionName(method, path);
      const hookName = `use${funcName.charAt(0).toUpperCase() + funcName.slice(1)}`;

      // 파라미터가 있는지 확인
      const pathParams = parameters.filter((p: any) => p.in === "path");
      const queryParams = parameters.filter((p: any) => p.in === "query");
      const hasRequestBody =
        requestBody && requestBody.content?.["application/json"]?.schema;
      const hasRequestParams =
        pathParams.length > 0 || queryParams.length > 0 || hasRequestBody;

      if (method.toLowerCase() === "get") {
        // Query Hook
        if (hasRequestParams) {
          const reqTypeName = generateTypeName(method, path, "Req");
          fileContent += `export const ${hookName} = (request: Types.${reqTypeName}) => {\n`;
          fileContent += `  return useQuery({\n`;
          fileContent += `    queryKey: ${tag.toLowerCase()}Keys.${funcName}(request),\n`;
          fileContent += `    queryFn: () => Api.${funcName}(request),\n`;
          fileContent += `  });\n`;
          fileContent += `};\n\n`;
        } else {
          fileContent += `export const ${hookName} = () => {\n`;
          fileContent += `  return useQuery({\n`;
          fileContent += `    queryKey: ${tag.toLowerCase()}Keys.${funcName},\n`;
          fileContent += `    queryFn: () => Api.${funcName}(),\n`;
          fileContent += `  });\n`;
          fileContent += `};\n\n`;
        }
      } else {
        // Mutation Hook
        if (hasRequestParams) {
          const reqTypeName = generateTypeName(method, path, "Req");
          fileContent += `export const ${hookName} = () => {\n`;
          fileContent += `  return useMutation({\n`;
          fileContent += `    mutationFn: (request: Types.${reqTypeName}) => Api.${funcName}(request),\n`;
          fileContent += `  });\n`;
          fileContent += `};\n\n`;
        } else {
          fileContent += `export const ${hookName} = () => {\n`;
          fileContent += `  return useMutation({\n`;
          fileContent += `    mutationFn: () => Api.${funcName}(),\n`;
          fileContent += `  });\n`;
          fileContent += `};\n\n`;
        }
      }
    });

    fs.writeFileSync(filePath, fileContent);
    debug.log(`✅ ${fileName} 생성 완료`);
  });

  return "";
}

// 메인 실행 함수
function generateApiCode() {
  try {
    debug.log("🔄 API 코드 생성 시작...");

    // Swagger 파일 읽기
    if (!fs.existsSync(SWAGGER_FILE)) {
      throw new Error(`Swagger 파일을 찾을 수 없습니다: ${SWAGGER_FILE}`);
    }

    const swaggerSpec: SwaggerSpec = JSON.parse(
      fs.readFileSync(SWAGGER_FILE, "utf-8")
    );
    // 사용 가능한 스키마 이름들 기록
    Object.keys(swaggerSpec.components?.schemas || {}).forEach((name) =>
      availableSchemaNames.add(name)
    );
    debug.log(
      `📊 Swagger 스펙 로드 완료: ${Object.keys(swaggerSpec.paths || {}).length}개 엔드포인트`
    );

    // 출력 디렉토리 생성
    ensureDir(TYPES_DIR);
    ensureDir(API_DIR);
    ensureDir(HOOKS_DIR);
    ensureDir(CONSTANTS_DIR);

    // 엔드포인트 추출
    const endpoints: ApiEndpoint[] = [];
    Object.entries(swaggerSpec.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, spec]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: spec.operationId,
          summary: spec.summary || "",
          tags: spec.tags || ["default"],
          parameters: spec.parameters || [],
          requestBody: spec.requestBody,
          responses: spec.responses || {},
        });
      });
    });

    debug.log(`📋 ${endpoints.length}개 엔드포인트 처리 중...`);

    // 1. 타입 정의 생성
    debug.log("📝 타입 정의 생성 중...");
    const typesContent = generateTypes(swaggerSpec);
    fs.writeFileSync(path.join(TYPES_DIR, "api-schema.ts"), typesContent);
    debug.log("✅ api-schema.ts 생성 완료");

    // 2. 개별 타입 파일들 생성
    debug.log("📝 개별 타입 파일들 생성 중...");
    generateTypeFiles(endpoints);

    // 3. API 함수들 생성
    debug.log("🔧 API 함수들 생성 중...");
    generateApiFunctions(endpoints);

    // 3. Query Keys 생성
    debug.log("🔑 Query Keys 생성 중...");
    const queryKeysContent = generateQueryKeys(endpoints);
    fs.writeFileSync(
      path.join(CONSTANTS_DIR, "query-keys.ts"),
      queryKeysContent
    );
    debug.log("✅ query-keys.ts 생성 완료");

    // 4. React Query Hooks 생성
    debug.log("🎣 React Query Hooks 생성 중...");
    generateHooks(endpoints);

    debug.log("🎉 API 코드 생성 완료!");
    debug.log(`📁 생성된 파일들:`);
    debug.log(`  - ${path.join(TYPES_DIR, "api-schema.ts")}`);
    debug.log(`  - ${path.join(CONSTANTS_DIR, "query-keys.ts")}`);
    debug.log(`  - ${API_DIR}/*.ts`);
    debug.log(`  - ${HOOKS_DIR}/*.ts`);
  } catch (error) {
    debug.error("❌ API 코드 생성 실패:", error);
    throw error;
  }
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  try {
    generateApiCode();
    debug.log("🎉 API 코드 생성 완료");
  } catch (error) {
    debug.error("💥 오류 발생:", error);
    process.exit(1);
  }
}

export { generateApiCode };
