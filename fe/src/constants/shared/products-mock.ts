import { ProductItem } from "@/types/shared/list-content";

/**
 * @description 나다움 상품 Mock 데이터
 * 베이크 사이트(https://youthvoice.vake.io/views/IRC5TTNAG) 기준
 */
export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: "product_1",
    title: "[모어포모레] 에브리 립밤",
    description: "입술 보습 케어를 위한 천연 성분 립밤",
    thumbnailUrl:
      "https://youthvoice.vake.io/processed?key=files/G0IZUDWCL/FZBAFAUIH/file&scale=xs&version=2",
    detailImageUrl: "",
    status: "판매중",
    price: 150,
    stock: 50,
    category: "뷰티",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-15",
    tags: ["립밤", "뷰티", "보습"],
    isActive: true,
  },
  {
    id: "product_2",
    title: "온라인 상품권 2만원 권",
    description: "온라인 쇼핑몰에서 사용 가능한 상품권",
    thumbnailUrl:
      "https://youthvoice.vake.io/processed?key=files/G0IZUDWCL/F6BNJAPSD/file&scale=xs&version=2",
    detailImageUrl: "",
    status: "판매중",
    price: 250,
    stock: 100,
    category: "상품권",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-15",
    tags: ["상품권", "온라인"],
    isActive: true,
  },
  {
    id: "product_3",
    title: "문화상품권 3만원 권",
    description: "문화생활 지원을 위한 문화상품권",
    thumbnailUrl:
      "https://youthvoice.vake.io/processed?key=files/G0IZUDWCL/FQFK1RY2R/file&scale=xs&version=2",
    detailImageUrl: "",
    status: "판매중",
    price: 350,
    stock: 50,
    category: "상품권",
    createdAt: "2024-12-15",
    updatedAt: "2025-01-20",
    tags: ["문화상품권", "상품권"],
    isActive: true,
  },
];
