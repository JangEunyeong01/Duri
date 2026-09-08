import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveTheme, saveTheme, getStoredTheme } from './useTheme';

// OS 다크 모드 설정을 흉내낸다.
// jsdom 에는 matchMedia 가 구현돼 있지 않아 직접 심어야 한다.
//
// 이 함수가 이 테스트의 핵심이다. 실제 OS 설정에 의존하면
// 테스트를 돌리는 사람의 환경에 따라 결과가 달라지기 때문에,
// 두 환경을 코드로 모두 만들어서 확인한다.
const mockOS = (prefersDark) => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: prefersDark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('resolveTheme — 고른 값을 실제 적용값으로 환산', () => {
  it('직접 고른 값은 OS 설정과 무관하게 그대로 쓴다', () => {
    mockOS(true); // OS 는 다크

    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  // 회귀 테스트 — 예전 코드는 '시스템 설정'을 고르면 OS 를 확인하지 않고
  // 무조건 라이트로 적용했다. 개발 환경이 대부분 라이트 모드였던 탓에
  // 결과가 우연히 맞아떨어져 아무도 발견하지 못했던 버그다.
  it("'시스템 설정'은 OS 가 다크면 dark 로 환산한다", () => {
    mockOS(true);

    expect(resolveTheme('system')).toBe('dark');
  });

  it("'시스템 설정'은 OS 가 라이트면 light 로 환산한다", () => {
    mockOS(false);

    expect(resolveTheme('system')).toBe('light');
  });
});

describe('saveTheme — 저장값과 적용값을 구분한다', () => {
  it("'시스템 설정'은 환산하지 않고 그대로 저장한다", () => {
    mockOS(true);

    saveTheme('system');

    // 저장은 고른 값 그대로여야 한다.
    // 여기서 'dark' 로 저장해버리면 OS 를 라이트로 바꿔도 따라가지 못하고,
    // 설정 화면의 라벨도 '다크 모드'로 바뀌어 버린다.
    expect(getStoredTheme()).toBe('system');

    // 적용은 환산된 값이어야 한다.
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('직접 고른 값은 저장값과 적용값이 같다', () => {
    mockOS(false);

    saveTheme('dark');

    expect(getStoredTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('getStoredTheme — 저장된 값이 없을 때', () => {
  it('처음 방문한 사용자는 light 로 시작한다', () => {
    expect(getStoredTheme()).toBe('light');
  });
});
