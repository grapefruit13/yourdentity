"use client";

import Link from "next/link";
import { MOCK_PRODUCTS } from "@/constants/shared/products-mock";

/**
 * @description 나다움 상품 목록 페이지
 * TODO: Notion에서 데이터 가져오기
 */
const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-white p-4">
      <p className="mb-4 text-sm text-gray-600">
        여러분의 나다움을 원하는 선물로 교환해요!
      </p>

      <div className="grid grid-cols-2 gap-4">
        {MOCK_PRODUCTS.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block rounded-lg border border-gray-200 p-3 hover:shadow-lg"
          >
            <div className="mb-3 h-40 w-full">
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="h-40 w-full rounded-lg object-cover"
                loading="lazy"
              />
            </div>
            <h3 className="mb-1 text-sm font-semibold">{product.title}</h3>
            <p className="mb-2 line-clamp-2 text-xs text-gray-600">
              {product.description}
            </p>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                {product.price} 나다움
              </span>
              <span
                className={`rounded px-2 py-1 text-xs ${
                  product.status === "판매중"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.status}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {product.stock > 0 ? `재고 ${product.stock}개` : "품절"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
