/**
 * 애플리케이션 전역 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
  // 인증 관련
  AUTH: {
    INVALID_CREDENTIALS: '아이디 또는 비밀번호가 일치하지 않습니다.',
    EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
    USER_ID_ALREADY_EXISTS: '이미 사용 중인 아이디입니다.',
    UNAUTHORIZED: '인증이 필요합니다.',
    TOKEN_EXPIRED: '토큰이 만료되었습니다.',
    INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  },

  // 사용자 관련
  USER: {
    NOT_FOUND: (userNo: number) => `사용자 번호 ${userNo}를 찾을 수 없습니다.`,
    UPDATE_FAILED: '사용자 정보 수정에 실패했습니다.',
    DELETE_FAILED: '사용자 삭제에 실패했습니다.',
  },

  // 고양이 관련
  CAT: {
    NOT_FOUND: (catNo: number) => `고양이 번호 ${catNo}를 찾을 수 없습니다.`,
    UPDATE_FAILED: '고양이 정보 수정에 실패했습니다.',
    DELETE_FAILED: '고양이 삭제에 실패했습니다.',
    INVALID_GENDER: '고양이 성별은 male 또는 female이어야 합니다.',
  },

  // 데이터베이스 관련
  DATABASE: {
    CONNECTION_FAILED: '데이터베이스 연결에 실패했습니다.',
    QUERY_FAILED: '데이터베이스 쿼리 실행에 실패했습니다.',
  },

  // 공통
  COMMON: {
    INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
    BAD_REQUEST: '잘못된 요청입니다.',
    FORBIDDEN: '권한이 없습니다.',
  },
} as const;

/**
 * 성공 메시지 상수
 */
export const SUCCESS_MESSAGES = {
  AUTH: {
    JOIN_SUCCESS: '회원가입이 완료되었습니다.',
    LOGIN_SUCCESS: '로그인 성공',
    LOGOUT_SUCCESS: '로그아웃되었습니다.',
  },

  USER: {
    UPDATE_SUCCESS: '사용자 정보가 수정되었습니다.',
    DELETE_SUCCESS: '사용자가 삭제되었습니다.',
  },

  CAT: {
    CREATE_SUCCESS: '고양이가 성공적으로 등록되었습니다.',
    UPDATE_SUCCESS: '고양이 정보가 수정되었습니다.',
    DELETE_SUCCESS: '고양이가 삭제되었습니다.',
  },

  DATABASE: {
    CONNECTION_SUCCESS: 'Database connection is healthy',
  },
} as const;
