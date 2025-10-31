const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: 홈 화면 관리 API
 */

/**
 * @swagger
 * /home:
 *   get:
 *     summary: 홈 화면 데이터 조회
 *     description: 노션에서 관리되는 홈 화면 데이터를 운영 배포일자 기준으로 가장 최신 항목을 조회합니다.
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: 홈 화면 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "홈 화면 데이터를 성공적으로 조회했습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 홈 화면 페이지 ID
 *                     name:
 *                       type: string
 *                       description: 홈 화면 이름
 *                     backgroundImage:
 *                       type: array
 *                       description: 배경 이미지 파일 정보 목록
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           type:
 *                             type: string
 *                     activityReview:
 *                       type: boolean
 *                       description: 활동후기 표시 여부
 *                     nadaumExhibition:
 *                       type: boolean
 *                       description: 나다움전시 표시 여부
 *                     deployDate:
 *                       type: string
 *                       format: date
 *                       description: 운영 배포일자 (가장 최신 배포일자 기준으로 조회됨)
 *                     content:
 *                       type: array
 *                       description: 페이지 내부 블록 콘텐츠
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: 블록 타입 (paragraph, heading_1, image 등)
 *                           text:
 *                             type: string
 *                             description: 텍스트 내용
 *                           url:
 *                             type: string
 *                             description: 이미지/비디오/파일 URL (해당하는 경우)
 *                           links:
 *                             type: array
 *                             description: 블록에 포함된 링크 목록
 *                             items:
 *                               type: object
 *                               properties:
 *                                 text:
 *                                   type: string
 *                                   description: 링크 텍스트
 *                                 url:
 *                                   type: string
 *                                   description: 링크 URL
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     url:
 *                       type: string
 *                       description: 노션 페이지 URL
 *       404:
 *         description: 홈 화면 데이터가 존재하지 않음
 *       429:
 *         description: API 요청 한도 초과
 *       500:
 *         description: 서버 오류
 */
router.get("/", homeController.getHomeScreen);

module.exports = router;

