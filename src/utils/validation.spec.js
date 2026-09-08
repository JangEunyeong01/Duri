import { describe, it, expect } from 'vitest';
import { validatePassword } from './validation';
import { maskCardNumber } from './card';

describe('validatePassword — 비밀번호 조건 검사', () => {
  it('영문·숫자·특수문자를 모두 포함한 8~20자를 통과시킨다', () => {
    expect(validatePassword('duri1234!')).toBe(true);
  });

  it('특수문자가 없으면 통과시키지 않는다', () => {
    expect(validatePassword('duri12345')).toBe(false);
  });

  it('숫자가 없으면 통과시키지 않는다', () => {
    expect(validatePassword('duriduri!')).toBe(false);
  });

  it('8자 미만이면 통과시키지 않는다', () => {
    expect(validatePassword('du1!')).toBe(false);
  });

  it('아직 입력하지 않은 상태는 오류로 보지 않는다', () => {
    // 의도된 동작 — 입력을 시작하기도 전에 경고 문구가 뜨면
    // 사용자는 이미 틀린 줄 알고 위축된다.
    expect(validatePassword('')).toBe(true);
  });
});

describe('maskCardNumber — 카드번호 마스킹', () => {
  it('뒤 4자리 중 앞 3자리만 남기고 가린다', () => {
    expect(maskCardNumber('1234567890127034')).toBe('703*');
  });

  it('카드번호가 없으면 빈 문자열을 돌려준다', () => {
    // 카드 정보를 아직 못 받은 상태에서 'undefined' 가 화면에 뜨지 않도록 한다.
    expect(maskCardNumber('')).toBe('');
    expect(maskCardNumber(undefined)).toBe('');
  });
});
