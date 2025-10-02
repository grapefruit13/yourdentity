const {db, admin} = require("../config/database");
const {FieldValue} = admin.firestore;

class FirestoreService {
  async createUser(nickname, profileImageUrl = "") {
    const userRef = db.collection("users").doc();
    const userData = {
      nickname,
      profileImageUrl,
      createdAt: FieldValue.serverTimestamp(),
    };

    await userRef.set(userData);
    return {userId: userRef.id, ...userData};
  }

  async getAllUsers() {
    const snapshot = await db.collection("users").get();
    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        userId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      });
    });

    return users;
  }

  async getUserById(userId) {
    const doc = await db.collection("users").doc(userId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      userId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    };
  }

  async updateUser(userId, updateData) {
    await db.collection("users").doc(userId).update(updateData);
    return {userId, ...updateData};
  }

  async deleteUser(userId) {
    const missionsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .get();
    const batch = db.batch();

    missionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(db.collection("users").doc(userId));
    await batch.commit();
  }

  async createMission(userId, missionId, status = "ONGOING") {
    const missionData = {
      status,
      startedAt: FieldValue.serverTimestamp(),
      certified: false,
    };

    if (status === "COMPLETED") {
      missionData.completedAt = FieldValue.serverTimestamp();
      missionData.certified = true;
    }

    await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .doc(missionId)
        .set(missionData);
    return {userId, missionId, ...missionData};
  }

  async getUserMissions(userId, statusFilter = null) {
    let query = db.collection("users").doc(userId).collection("missions");

    if (statusFilter) {
      query = query.where("status", "==", statusFilter);
    }

    const snapshot = await query.get();
    const missions = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      missions.push({
        missionId: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate().toISOString(),
        completedAt: data.completedAt?.toDate().toISOString(),
      });
    });

    return missions;
  }

  async getMissionById(userId, missionId) {
    const doc = await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .doc(missionId)
        .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      missionId: doc.id,
      ...data,
      startedAt: data.startedAt?.toDate().toISOString(),
      completedAt: data.completedAt?.toDate().toISOString(),
    };
  }

  async updateMission(userId, missionId, updateData) {
    if (updateData.status === "COMPLETED") {
      updateData.completedAt = FieldValue.serverTimestamp();
    }

    await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .doc(missionId)
        .update(updateData);
    return {userId, missionId, ...updateData};
  }

  async deleteMission(userId, missionId) {
    await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .doc(missionId)
        .delete();
  }

  async updateUserProfileImage(userId, profileImageUrl) {
    await db.collection("users").doc(userId).update({profileImageUrl});
    return {userId, profileImageUrl};
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

  // 페이지네이션을 지원하는 컬렉션 조회 (Spring Boot의 Pageable과 유사)
  async getCollectionWithPagination(collectionName, options = {}) {
    const {
      page = 0,
      size = 10,
      orderBy = "createdAt",
      orderDirection = "desc",
      where = [],
    } = options;

    let query = db.collection(collectionName);

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

    // 전체 개수 조회 (총 페이지 수 계산을 위해)
    let totalCount = 0;
    if (where.length > 0) {
      let countQuery = db.collection(collectionName);
      where.forEach((condition) => {
        countQuery = countQuery.where(
            condition.field,
            condition.operator,
            condition.value,
        );
      });
      const countSnapshot = await countQuery.get();
      totalCount = countSnapshot.size;
    } else {
      const countSnapshot = await db.collection(collectionName).get();
      totalCount = countSnapshot.size;
    }

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
}

module.exports = new FirestoreService();
