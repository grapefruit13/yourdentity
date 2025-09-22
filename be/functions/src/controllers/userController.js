const firestoreService = require('../services/firestoreService');

class UserController {
  async createUser(req, res) {
    try {
      const { nickname, profileImageUrl } = req.body;
      
      if (!nickname) {
        return res.status(400).json({ 
          success: false, 
          error: 'nickname is required' 
        });
      }

      const result = await firestoreService.createUser(nickname, profileImageUrl);

      res.json({
        success: true,
        data: {
          ...result,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await firestoreService.getAllUsers();

      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await firestoreService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { nickname, profileImageUrl } = req.body;

      const updateData = {};
      if (nickname) updateData.nickname = nickname;
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No valid fields to update' 
        });
      }

      const result = await firestoreService.updateUser(userId, updateData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      
      await firestoreService.deleteUser(userId);

      res.json({
        success: true,
        message: 'User and all missions deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new UserController();