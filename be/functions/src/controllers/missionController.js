// 미션 관련 기능은 추후 구현 예정
// 현재는 사용자 관리에 집중

/**
 * 미션 생성 (더미 함수)
 */
const createMission = (req, res) => {
  res.status(501).json({
    success: false,
    error: "미션 기능은 추후 구현 예정입니다"
  });
};

/**
 * 사용자 미션 목록 조회 (더미 함수)
 */
const getUserMissions = (req, res) => {
  res.status(501).json({
    success: false,
    error: "미션 기능은 추후 구현 예정입니다"
  });
};

/**
 * 미션 상세 조회 (더미 함수)
 */
const getMissionById = (req, res) => {
  res.status(501).json({
    success: false,
    error: "미션 기능은 추후 구현 예정입니다"
  });
};

/**
 * 미션 업데이트 (더미 함수)
 */
const updateMission = (req, res) => {
  res.status(501).json({
    success: false,
    error: "미션 기능은 추후 구현 예정입니다"
  });
};

/**
 * 미션 삭제 (더미 함수)
 */
const deleteMission = (req, res) => {
  res.status(501).json({
    success: false,
    error: "미션 기능은 추후 구현 예정입니다"
  });
};

module.exports = {
  createMission,
  getUserMissions,
  getMissionById,
  updateMission,
  deleteMission
};