const {db, FieldValue} = require("../config/database");

/**
 * Firestore Service (데이터 접근 계층)
 * 컬렉션별 데이터 CRUD 작업 담당
 */
class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  /**
   * 문서 생성
   * @param {Object} data - 문서 데이터
   * @param {string} docId - 문서 ID (선택사항)
   * @return {Promise<Object>} 생성된 문서 데이터
   */
  async create(data, docId = null) {
    const collectionRef = db.collection(this.collectionName);
    const docRef = docId ? collectionRef.doc(docId) : collectionRef.doc();

    const newData = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(newData);
    return {id: docRef.id, ...newData};
  }

  /**
   * 모든 문서 조회
   * @return {Promise<Array>} 문서 목록
   */
  async getAll() {
    const snapshot = await db.collection(this.collectionName).get();
    const documents = [];

    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      });
    });

    return documents;
  }

  /**
   * 문서 ID로 조회
   * @param {string} docId - 문서 ID
   * @return {Promise<Object|null>} 문서 데이터
   */
  async getById(docId) {
    const doc = await db.collection(this.collectionName).doc(docId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    };
  }

  /**
   * 문서 업데이트
   * @param {string} docId - 문서 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @return {Promise<Object>} 업데이트된 문서 데이터
   */
  async update(docId, updateData) {
    await db.collection(this.collectionName).doc(docId).update(updateData);
    return {id: docId, ...updateData};
  }

  /**
   * 문서 삭제
   * @param {string} docId - 문서 ID
   * @return {Promise<void>}
   */
  async delete(docId) {
    await db.collection(this.collectionName).doc(docId).delete();
  }

  /**
   * 조건에 맞는 문서들 조회
   * @param {string} field - 필드명
   * @param {string} operator - 연산자
   * @param {any} value - 값
   * @return {Promise<Array>} 문서 목록
   */
  async getWhere(field, operator, value) {
    const snapshot = await db
        .collection(this.collectionName)
        .where(field, operator, value)
        .get();
    const items = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
      });
    });

    return items;
  }

  /**
   * 여러 값으로 WHERE IN 쿼리 수행 (N+1 쿼리 문제 해결용)
   * @param {string} field - 필드명
   * @param {Array} values - 값 배열
   * @return {Promise<Array>} 문서 목록
   */
  async getWhereIn(field, values) {
    if (!values || values.length === 0) return [];

    // Firestore의 'in' 쿼리는 최대 10개 값만 지원
    if (values.length > 10) {
      // 10개씩 나누어서 처리
      const chunks = [];
      for (let i = 0; i < values.length; i += 10) {
        chunks.push(values.slice(i, i + 10));
      }

      const allResults = [];
      for (const chunk of chunks) {
        const snapshot = await db
            .collection(this.collectionName)
            .where(field, "in", chunk)
            .get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          allResults.push({
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
          });
        });
      }
      return allResults;
    }

    const snapshot = await db
        .collection(this.collectionName)
        .where(field, "in", values)
        .get();

    const items = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
      });
    });

    return items;
  }

  /**
   * 페이지네이션을 지원하는 컬렉션 조회 (Spring Boot의 Pageable과 유사)
   * @param {Object} options - 페이지네이션 옵션
   * @return {Promise<Object>} 페이지네이션 결과
   */
  async getWithPagination(options = {}) {
    const {
      page = 0,
      size = 10,
      orderBy = "createdAt",
      orderDirection = "desc",
      where = [],
    } = options;

    let query = db.collection(this.collectionName);

    // 필터 조건 적용
    where.forEach((condition) => {
      query = query.where(condition.field, condition.operator, condition.value);
    });

    // 정렬 적용
    query = query.orderBy(orderBy, orderDirection);

    // 페이지네이션 적용
    const offset = page * size;
    query = query.offset(offset).limit(size);

    const snapshot = await query.get();
    const items = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
      });
    });

    // 전체 개수 조회 (총 페이지 수 계산을 위해) - count() 사용으로 성능 최적화
    let countQuery = db.collection(this.collectionName);
    where.forEach((condition) => {
      countQuery = countQuery.where(
          condition.field,
          condition.operator,
          condition.value,
      );
    });
    const countSnapshot = await countQuery.count().get();
    const totalCount = countSnapshot.data().count;

    const totalPages = Math.ceil(totalCount / size);
    const hasNext = page < totalPages - 1;
    const hasPrevious = page > 0;

    return {
      content: items,
      pageable: {
        pageNumber: page,
        pageSize: size,
        totalElements: totalCount,
        totalPages: totalPages,
        hasNext: hasNext,
        hasPrevious: hasPrevious,
        isFirst: page === 0,
        isLast: page === totalPages - 1,
      },
    };
  }

  // 여러 값으로 WHERE IN 쿼리를 수행하는 메서드 (N+1 쿼리 문제 해결용)
  async getCollectionWhereIn(collectionName, field, values) {
    if (!values || values.length === 0) return [];

    // Firestore의 'in' 쿼리는 최대 10개 값만 지원
    if (values.length > 10) {
      // 10개씩 나누어서 처리
      const chunks = [];
      for (let i = 0; i < values.length; i += 10) {
        chunks.push(values.slice(i, i + 10));
      }

      const allResults = [];
      for (const chunk of chunks) {
        const snapshot = await db
            .collection(collectionName)
            .where(field, "in", chunk)
            .get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          allResults.push({
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
          });
        });
      }
      return allResults;
    }

    const snapshot = await db
        .collection(collectionName)
        .where(field, "in", values)
        .get();

    const items = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
      });
    });

    return items;
  }
  // 일반적인 컬렉션 조회 메서드들
  async getCollection(collectionName) {
    const snapshot = await db.collection(collectionName).get();
    const items = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
      });
    });

    return items;
  }

  async getDocument(collectionName, docId) {
    const doc = await db.collection(collectionName).doc(docId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
    };
  }

  async addDocument(collectionName, data) {
    const now = new Date();
    const docRef = await db.collection(collectionName).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async updateDocument(collectionName, docId, data) {
    await db
        .collection(collectionName)
        .doc(docId)
        .update({
          ...data,
          updatedAt: new Date(),
        });
  }

  async deleteDocument(collectionName, docId) {
    await db.collection(collectionName).doc(docId).delete();
  }

  async getCollectionWhere(collectionName, field, operator, value) {
    const snapshot = await db
        .collection(collectionName)
        .where(field, operator, value)
        .get();
    const items = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
      });
    });

    return items;
  }
}

module.exports = FirestoreService;
