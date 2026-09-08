// 테마(라이트/다크) 적용을 한 곳에서 처리한다.
//
// 사용자가 고르는 값은 'system' | 'light' | 'dark' 세 가지지만,
// 실제로 화면에 적용되는 값은 'light' | 'dark' 두 가지뿐이다.
// 'system'은 고정된 색이 아니라 "OS 설정을 그때그때 따라간다"는 뜻이라,
// 적용 시점마다 둘 중 하나로 환산해야 한다.

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export const getStoredTheme = () =>
  localStorage.getItem(STORAGE_KEY) || 'light';

// 고른 값을 실제로 화면에 적용할 값('light' | 'dark')으로 환산한다.
// 단위 테스트에서 직접 검증하기 위해 내보낸다 — 이 함수가 이 파일에서
// 가장 틀리기 쉬운 부분이고, 실제로 한 번 틀렸던 곳이다.
export const resolveTheme = (setting) => {
  if (setting !== 'system') {
    return setting;
  }

  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
};

// data-theme 에는 반드시 'light' | 'dark' 만 넣는다.
// 'system' 을 그대로 넣으면 tokens.css 의 [data-theme="dark"] 에도 걸리지 않고
// :root(라이트) 를 쓰게 돼, 사용자가 고른 것과 다른 팔레트가 적용된다.
export const applyTheme = (setting) => {
  document.documentElement.setAttribute('data-theme', resolveTheme(setting));
};

// 고른 값은 환산하지 않고 그대로 저장한다.
// 'system' 을 'light' 로 바꿔 저장하면 OS 를 다크로 바꿔도 따라가지 못하고,
// 설정 화면의 라벨도 '라이트 모드' 로 바뀌어 버린다.
export const saveTheme = (setting) => {
  localStorage.setItem(STORAGE_KEY, setting);
  applyTheme(setting);
};

// 'system' 을 고른 사용자는 앱을 켜 둔 채로 OS 테마를 바꿀 수 있다.
// 그 경우에도 화면이 따라가도록 구독한다. 구독 해제 함수를 돌려준다.
export const watchSystemTheme = () => {
  const media = window.matchMedia(DARK_QUERY);

  const handleChange = () => {
    if (getStoredTheme() === 'system') {
      applyTheme('system');
    }
  };

  media.addEventListener('change', handleChange);

  return () => media.removeEventListener('change', handleChange);
};
