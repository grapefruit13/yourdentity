const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

// Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

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
}

module.exports = FirestoreService;
