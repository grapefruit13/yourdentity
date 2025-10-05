const missionService = require("../services/missionService");

class MissionController {
  async createMission(req, res) {
    try {
      const {userId} = req.params;
      const {missionId, status = "ONGOING"} = req.body;

      if (!missionId) {
        return res.status(400).json({
          status: 400,
          error: "missionId is required",
        });
      }

      const validStatuses = ["ONGOING", "COMPLETED", "EXPIRED", "RETRY"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 400,
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        });
      }

      const result = await missionService.createMission(userId, missionId, status);

      res.json({
        status: 200,
        data: {
          ...result,
          startedAt: new Date().toISOString(),
          completedAt: status === "COMPLETED" ? new Date().toISOString() : null,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  }

  async getUserMissions(req, res) {
    try {
      const {userId} = req.params;
      const {status} = req.query;

      const missions = await missionService.getUserMissions(userId, status);

      res.json({
        status: 200,
        data: missions,
        count: missions.length,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  }

  async getMissionById(req, res) {
    try {
      const {userId, missionId} = req.params;

      const mission = await missionService.getMissionById(userId, missionId);

      if (!mission) {
        return res.status(404).json({
          status: 404,
          error: "Mission not found",
        });
      }

      res.json({
        status: 200,
        data: mission,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
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
            status: 400,
            error: "Invalid status. Must be one of: " + validStatuses.join(", "),
          });
        }
        updateData.status = status;
      }

      if (certified !== undefined) updateData.certified = certified;
      if (review !== undefined) updateData.review = review;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          status: 400,
          error: "No valid fields to update",
        });
      }

      const result = await missionService.updateMission(userId, missionId, updateData);

      res.json({
        status: 200,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  }

  async deleteMission(req, res) {
    try {
      const {userId, missionId} = req.params;

      await missionService.deleteMission(userId, missionId);

      res.json({
        status: 200,
        message: "Mission deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  }
}

module.exports = new MissionController();
