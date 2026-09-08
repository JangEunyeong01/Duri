import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PaymentPasswordModal from './PaymentPasswordModal.vue';
import { verifySimplePassword } from '@/api/memberApi';

// 서버는 실제로 부르지 않는다.
// 이 테스트가 확인하려는 것은 "서버가 이렇게 답했을 때 화면이 어떻게 반응하는가" 이지,
// 서버가 제대로 동작하는가가 아니다. 그건 백엔드 테스트의 몫이다.
vi.mock('@/api/memberApi', () => ({
  verifySimplePassword: vi.fn(),
}));

// 숫자패드에서 1을 여섯 번 눌러 비밀번호를 채운다.
// 사용자가 실제로 하는 동작(버튼 클릭)을 그대로 흉내낸다 —
// 내부 상태를 직접 건드리면 "버튼이 함수에 연결되지 않은" 종류의 버그를 놓친다.
const enterSixDigits = async (wrapper) => {
  const oneKey = wrapper.findAll('.keypad button')[0];

  for (let i = 0; i < 6; i += 1) {
    await oneKey.trigger('click');
  }
};

// 6자리를 채우면 잠깐 뒤에 서버 검증이 시작된다. 그 시간을 건너뛴다.
const waitForVerification = async () => {
  await vi.advanceTimersByTimeAsync(300);
  await flushPromises();
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PaymentPasswordModal — 간편비밀번호 입력', () => {
  it('6자리를 다 채우면 입력한 값으로 서버에 검증을 요청한다', async () => {
    verifySimplePassword.mockResolvedValue({ matched: true });

    const wrapper = mount(PaymentPasswordModal);
    await enterSixDigits(wrapper);
    await waitForVerification();

    expect(verifySimplePassword).toHaveBeenCalledWith('111111');
  });

  it('6자리를 채우기 전에는 서버를 부르지 않는다', async () => {
    const wrapper = mount(PaymentPasswordModal);

    const oneKey = wrapper.findAll('.keypad button')[0];
    for (let i = 0; i < 5; i += 1) {
      await oneKey.trigger('click');
    }
    await waitForVerification();

    expect(verifySimplePassword).not.toHaveBeenCalled();
  });

  it('비밀번호가 맞으면 성공을 알린다', async () => {
    verifySimplePassword.mockResolvedValue({ matched: true });

    const wrapper = mount(PaymentPasswordModal);
    await enterSixDigits(wrapper);
    await waitForVerification();

    expect(wrapper.emitted('success')).toHaveLength(1);
  });

  it('비밀번호가 틀리면 성공을 알리지 않고 화면에 안내를 띄운다', async () => {
    verifySimplePassword.mockResolvedValue({ matched: false });

    const wrapper = mount(PaymentPasswordModal);
    await enterSixDigits(wrapper);
    await waitForVerification();

    expect(wrapper.emitted('success')).toBeUndefined();
    expect(wrapper.find('[role="alert"]').text()).toContain('일치하지 않습니다');
  });

  it('여러 번 틀려 잠기면 서버가 내려준 안내를 그대로 보여준다', async () => {
    // 5회 연속 실패 시 서버가 5분간 잠그고 429로 응답한다.
    // 잠금 사유는 서버만 알기 때문에 화면이 문구를 지어내면 안 된다.
    verifySimplePassword.mockRejectedValue({
      response: { status: 429, data: { message: '5분 후에 다시 시도해주세요.' } },
    });

    const wrapper = mount(PaymentPasswordModal);
    await enterSixDigits(wrapper);
    await waitForVerification();

    expect(wrapper.find('[role="alert"]').text()).toBe('5분 후에 다시 시도해주세요.');
  });

  it('간편비밀번호를 설정하지 않은 회원에게는 설정하러 가라고 안내한다', async () => {
    verifySimplePassword.mockRejectedValue({
      response: { data: { code: 'SIMPLE_PASSWORD_NOT_SET' } },
    });

    const wrapper = mount(PaymentPasswordModal);
    await enterSixDigits(wrapper);
    await waitForVerification();

    // 단순히 "실패했습니다"로 끝내면 사용자는 무엇을 해야 할지 알 수 없다.
    expect(wrapper.find('[role="alert"]').text()).toContain('설정');
  });

  it('취소를 누르면 닫기를 알린다', async () => {
    const wrapper = mount(PaymentPasswordModal);

    await wrapper.find('.cancel').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
