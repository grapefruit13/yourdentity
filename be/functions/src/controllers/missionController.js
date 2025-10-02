const firestoreService = require("../services/firestoreService");

class MissionController {
  async createMission(req, res) {
    try {
      const {userId} = req.params;
      const {missionId, status = "ONGOING"} = req.body;

      if (!missionId) {
        return res.status(400).json({
          success: false,
          error: "missionId is required",
        });
      }

      const validStatuses = ["ONGOING", "COMPLETED", "EXPIRED", "RETRY"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        });
      }

      const result = await firestoreService.createMission(userId, missionId, status);

      res.json({
        success: true,
        data: {
          ...result,
          startedAt: new Date().toISOString(),
          completedAt: status === "COMPLETED" ? new Date().toISOString() : null,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getUserMissions(req, res) {
    try {
      const {userId} = req.params;
      const {status} = req.query;

      const missions = await firestoreService.getUserMissions(userId, status);

      res.json({
        success: true,
        data: missions,
        count: missions.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getMissionById(req, res) {
    try {
      const {userId, missionId} = req.params;

      const mission = await firestoreService.getMissionById(userId, missionId);

      if (!mission) {
        return res.status(404).json({
          success: false,
          error: "Mission not found",
        });
      }

      res.json({
        success: true,
        data: mission,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateMission(req, res) {
    try {
      const {userId, missionId} = req.params;
      const {status, certified, review} = req.body;

      const updateData = {};

      if (status) {
        const validStatuses = ["ONGOING", "COMPLETED", "EXPIRED", "RETRY"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: "Invalid status. Must be one of: " + validStatuses.join(", "),
          });
        }
        updateData.status = status;
      }

      if (certified !== undefined) updateData.certified = certified;
      if (review !== undefined) updateData.review = review;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields to update",
        });
      }

      const result = await firestoreService.updateMission(userId, missionId, updateData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteMission(req, res) {
    try {
      const {userId, missionId} = req.params;

      await firestoreService.deleteMission(userId, missionId);

      res.json({
        success: true,
        message: "Mission deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new MissionController();
