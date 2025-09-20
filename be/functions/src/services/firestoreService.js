const { db, admin } = require('../config/database');
const { FieldValue } = admin.firestore;

class FirestoreService {
  async createUser(nickname, profileImageUrl = '') {
    const userRef = db.collection('users').doc();
    const userData = {
      nickname,
      profileImageUrl,
      createdAt: FieldValue.serverTimestamp()
    };

    await userRef.set(userData);
    return { userId: userRef.id, ...userData };
  }

  async getAllUsers() {
    const snapshot = await db.collection('users').get();
    const users = [];

    snapshot.forEach(doc => {
      users.push({
        userId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString()
      });
    });

    return users;
  }

  async getUserById(userId) {
    const doc = await db.collection('users').doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }

    return {
      userId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    };
  }

  async updateUser(userId, updateData) {
    await db.collection('users').doc(userId).update(updateData);
    return { userId, ...updateData };
  }

  async deleteUser(userId) {
    const missionsSnapshot = await db.collection('users').doc(userId).collection('missions').get();
    const batch = db.batch();
    
    missionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    batch.delete(db.collection('users').doc(userId));
    await batch.commit();
  }

  async createMission(userId, missionId, status = 'ONGOING') {
    const missionData = {
      status,
      startedAt: FieldValue.serverTimestamp(),
      certified: false
    };

    if (status === 'COMPLETED') {
      missionData.completedAt = FieldValue.serverTimestamp();
      missionData.certified = true;
    }

    await db.collection('users').doc(userId).collection('missions').doc(missionId).set(missionData);
    return { userId, missionId, ...missionData };
  }

  async getUserMissions(userId, statusFilter = null) {
    let query = db.collection('users').doc(userId).collection('missions');
    
    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.get();
    const missions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      missions.push({
        missionId: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate().toISOString(),
        completedAt: data.completedAt?.toDate().toISOString()
      });
    });

    return missions;
  }

  async getMissionById(userId, missionId) {
    const doc = await db.collection('users').doc(userId).collection('missions').doc(missionId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      missionId: doc.id,
      ...data,
      startedAt: data.startedAt?.toDate().toISOString(),
      completedAt: data.completedAt?.toDate().toISOString()
    };
  }

  async updateMission(userId, missionId, updateData) {
    if (updateData.status === 'COMPLETED') {
      updateData.completedAt = FieldValue.serverTimestamp();
    }

    await db.collection('users').doc(userId).collection('missions').doc(missionId).update(updateData);
    return { userId, missionId, ...updateData };
  }

  async deleteMission(userId, missionId) {
    await db.collection('users').doc(userId).collection('missions').doc(missionId).delete();
  }

  async updateUserProfileImage(userId, profileImageUrl) {
    await db.collection('users').doc(userId).update({ profileImageUrl });
    return { userId, profileImageUrl };
  }
}

module.exports = new FirestoreService();