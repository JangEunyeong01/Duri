import { describe, it, expect } from 'vitest';
import { unwrapResponse } from './response';

// 백엔드 응답은 { success, code, data, message } 봉투로 통일돼 있다.
// 이 함수가 그 봉투를 벗기는 유일한 지점이라, 여기가 틀리면
// 모든 API 호출이 함께 틀어진다.
describe('unwrapResponse — 공통 응답 봉투 처리', () => {
  it('성공 응답은 data 만 꺼내 돌려준다', () => {
    const response = {
      data: { success: true, code: 'SUCCESS', data: { userCardId: 3 }, message: null },
    };

    expect(unwrapResponse(response, '실패했습니다.')).toEqual({ userCardId: 3 });
  });

  it('실패 응답은 서버가 내려준 메시지로 에러를 던진다', () => {
    const response = {
      data: { success: false, code: 'CARD_NOT_FOUND', message: '카드를 찾을 수 없습니다.' },
    };

    expect(() => unwrapResponse(response, '실패했습니다.')).toThrow('카드를 찾을 수 없습니다.');
  });

  it('실패 응답에 메시지가 없으면 기본 메시지를 쓰고, code 는 에러에 담는다', () => {
    const response = {
      data: { success: false, code: 'SIMPLE_PASSWORD_NOT_SET', message: null },
    };

    // 화면에서는 문구가 아니라 code 로 분기하기 때문에 code 가 반드시 남아야 한다.
    expect.assertions(2);

    try {
      unwrapResponse(response, '요청 처리에 실패했습니다.');
    } catch (error) {
      expect(error.code).toBe('SIMPLE_PASSWORD_NOT_SET');
      expect(error.message).toBe('요청 처리에 실패했습니다.');
    }
  });

  it('data 필드가 없는 응답은 본문을 그대로 돌려준다', () => {
    const response = { data: { success: true, code: 'SUCCESS' } };

    expect(unwrapResponse(response, '실패했습니다.')).toEqual({
      success: true,
      code: 'SUCCESS',
    });
  });
});
