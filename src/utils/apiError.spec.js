import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './apiError';

// 사용자에게 보여줄 오류 문구를 고르는 규칙.
// 서버가 이유를 알려줬으면 그것을 쓰고, 연결 자체가 실패한 경우처럼
// 서버 응답이 없으면 그 다음 후보로 내려간다.
describe('getErrorMessage — 보여줄 오류 문구 고르기', () => {
  it('서버가 내려준 메시지를 가장 먼저 쓴다', () => {
    const error = {
      response: { data: { message: '이미 등록된 카드입니다.' } },
      message: 'Request failed with status code 409',
    };

    // 사용자에게는 'Request failed...' 가 아니라 서버 문구가 보여야 한다.
    expect(getErrorMessage(error, '카드 등록에 실패했습니다.')).toBe('이미 등록된 카드입니다.');
  });

  it('서버 응답이 없으면 (네트워크 오류 등) 예외 메시지를 쓴다', () => {
    const error = { message: 'Network Error' };

    expect(getErrorMessage(error, '카드 등록에 실패했습니다.')).toBe('Network Error');
  });

  it('둘 다 없으면 화면이 정한 기본 메시지를 쓴다', () => {
    expect(getErrorMessage({}, '카드 등록에 실패했습니다.')).toBe('카드 등록에 실패했습니다.');
  });

  it('에러 객체 자체가 없어도 화면이 빈 문구를 띄우지 않는다', () => {
    expect(getErrorMessage(undefined, '카드 등록에 실패했습니다.')).toBe('카드 등록에 실패했습니다.');
  });
});
