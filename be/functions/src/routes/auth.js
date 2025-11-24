const express = require("express");
const authController = require("../controllers/authController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API (Firebase Client SDK 기반)
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: |
 *       사용자의 모든 Refresh Token을 무효화하여 기존 토큰 사용 불가
 *       
 *       **작동 방식:**
 *       1. 프론트엔드에서 auth.signOut() 호출 (localStorage 토큰 삭제)
 *       2. 이 API 호출 (Refresh Token 무효화)
 *       3. authGuard에서 로그아웃된 토큰 자동 거부
 *       
 *       **효과:**
 *       - 모든 디바이스에서 강제 로그아웃
 *       - 토큰 탈취 방어
 *       - 이 시점 이전 발급된 모든 토큰 무효화
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 로그아웃 성공
 *                     revokedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Refresh Token이 무효화된 시간
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: |
 *                     인증 실패 사유에 따른 메시지:
 *                     - "Bearer 토큰이 필요합니다"
 *                     - "잘못된 인증 헤더 형식입니다"
 *                     - "토큰이 무효화되었습니다 (로그아웃됨)"
 *                     - "토큰이 만료되었습니다"
 *                     - "유효하지 않은 토큰입니다"
 *                     - "인증에 실패했습니다"
 *                   example: "토큰이 만료되었습니다"
 *       423:
 *         description: 계정 자격정지 (Locked)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSuspendedResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다
 */
router.post("/logout", authGuard, authController.logout);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: 토큰 검증 테스트
 *     description: 현재 토큰의 유효성을 확인하고 사용자 정보 반환 (개발/디버깅용)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 토큰 검증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 토큰이 유효합니다
 *                     user:
 *                       type: object
 *                       properties:
 *                         uid:
 *                           type: string
 *                           example: abc123def456
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         emailVerified:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: |
 *                     인증 실패 사유에 따른 메시지:
 *                     - "Bearer 토큰이 필요합니다"
 *                     - "잘못된 인증 헤더 형식입니다"
 *                     - "토큰이 무효화되었습니다 (로그아웃됨)"
 *                     - "토큰이 만료되었습니다"
 *                     - "유효하지 않은 토큰입니다"
 *                     - "인증에 실패했습니다"
 *                   example: "토큰이 만료되었습니다"
 *       423:
 *         description: 계정 자격정지 (Locked)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSuspendedResponse'
 */
router.get("/verify", authGuard, authController.verifyToken);

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: 회원 탈퇴
 *     description: |
 *       사용자 계정을 탈퇴하고 개인정보를 가명처리
 *       
 *       **작동 방식:**
 *       1. 카카오 로그인 사용자인 경우 카카오 연결 해제
 *       2. Firestore 개인정보 가명처리 (닉네임 삭제, 생년월일 월/일 마스킹, 모든 필드 null 처리)
 *       3. Firebase Auth 사용자 삭제
 *       
 *       **개인정보 처리:**
 *       - 닉네임 삭제: nicknames 컬렉션에서 해당 사용자의 닉네임 문서 삭제
 *       - 제거: 생년월일(가명처리), deletedAt, lastUpdatedAt을 제외한 모든 필드를 null로 처리
 *         (이름, 이메일, 전화번호, 닉네임, 주소, 프로필 이미지, 자기소개, rewards, profileImagePath 등 모든 필드)
 *       - 가명처리: 생년월일 (YYYY-**-** 형태)
 *       - 유지: 가명처리된 생년월일, 삭제일시(deletedAt), 마지막 업데이트 일자(lastUpdatedAt)만 유지
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kakaoAccessToken:
 *                 type: string
 *                 description: 카카오 액세스 토큰 (카카오 로그인 사용자만 필수)
 *                 example: "abc123xyz..."
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 회원 탈퇴가 완료되었습니다
 *       400:
 *         description: 잘못된 요청 (카카오 액세스 토큰 누락 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 카카오 액세스 토큰이 필요합니다
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: |
 *                     인증 실패 사유에 따른 메시지:
 *                     - "Bearer 토큰이 필요합니다"
 *                     - "잘못된 인증 헤더 형식입니다"
 *                     - "토큰이 무효화되었습니다 (로그아웃됨)"
 *                     - "토큰이 만료되었습니다"
 *                     - "유효하지 않은 토큰입니다"
 *                     - "인증에 실패했습니다"
 *                   example: "토큰이 만료되었습니다"
 *       423:
 *         description: 계정 자격정지 (Locked)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSuspendedResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다
 */
router.delete("/delete-account", authGuard, authController.deleteAccount);

module.exports = router;

