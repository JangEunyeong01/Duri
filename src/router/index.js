import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Auth
import TermsView from '@/views/auth/TermsView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import PasswordChangeView from '@/views/auth/PasswordChangeView.vue'

// Onboarding
import OnboardingView from '@/views/onboarding/OnboardingView.vue'

// Main
import HomeView from '@/views/main/HomeView.vue'
import AIChatRoomView from '@/views/main/AIChatRoomView.vue'
import NotificationView from '@/views/main/NotificationView.vue'

// Card
import CardListView from '@/views/card/CardListView.vue'
import CardDetailView from '@/views/card/CardDetailView.vue'
import CardRegisterView from '@/views/card/CardRegisterView.vue'

// Payment
import PaymentView from '@/views/payment/PaymentView.vue'

// Transaction
import TransactionListView from '@/views/transaction/TransactionListView.vue'

// Point
import PointListView from '@/views/point/PointListView.vue'
import MembershipDetailView from '@/views/point/MembershipDetailView.vue'
import MembershipRegisterView from '@/views/point/MembershipRegisterView.vue'
// 혜택 상세는 views/card 쪽이 실제 화면이다 (views/point 쪽은 빈 껍데기).
import BenefitDetailView from '@/views/card/BenefitDetailView.vue'

// Settings
import SettingsView from '@/views/settings/SettingsView.vue'
import AccountInfoView from '@/views/settings/AccountInfoView.vue'
import NotificationSettingView from '@/views/settings/NotificationSettingView.vue'
import PersonalizationSettingView from '@/views/settings/PersonalizationSettingView.vue'
import WithdrawalView from '@/views/settings/WithdrawalView.vue'


const routes = [

    // Default
  {
    path: '/',
    redirect: '/home'
  },


  // Auth (public)
  { path: '/auth/terms', component: TermsView },
  { path: '/auth/signup', component: SignupView },
  { path: '/auth/login', component: LoginView },
  { path: '/auth/password-change', component: PasswordChangeView },

  // Onboarding (public)
  {path: '/onboarding', component: OnboardingView},

  // Main
  // 하단 탭 5개(/home · /cards · /payment · /points · /settings)는 비로그인도 들어올 수 있다.
  // 이 화면들은 전부 비로그인 상태를 전제로 만들어져 있다 — isLogin 분기를 두고,
  // 비로그인이면 API 호출을 건너뛴 뒤 "로그인이 필요합니다 / 로그인 후 이용할 수 있어요"
  // 안내를 대신 보여준다. requiresAuth 를 걸면 그 화면들에 영영 도달하지 못해
  // 비로그인 UI 가 죽은 코드가 되고, 로그인·회원가입의 "나중에 하기"도 막힌다.
  { path: '/home', component: HomeView },
  { path: '/ai/chat', component: AIChatRoomView, meta: { requiresAuth: true } },
  { path: '/notifications', component: NotificationView, meta: { requiresAuth: true } },

  // Card
  // 목록 화면은 비로그인 안내를 자체적으로 처리한다 (하단 탭). 등록·상세는 로그인 필요.
  { path: '/cards', component: CardListView },
  // 정적 경로를 동적 :id 경로보다 먼저 선언한다 (팀 라우팅 규약)
  { path: '/cards/register', component: CardRegisterView, meta: { requiresAuth: true } },
  { path: '/cards/:id', component: CardDetailView, meta: { requiresAuth: true } },
  // :id 는 userCardId (카드 상세의 '혜택 보기'가 여기로 보낸다)
  { path: '/benefits/:id', component: BenefitDetailView, meta: { requiresAuth: true } },

  // Payment
  // 결제 직전 AI 카드 추천 기능 포함이라 /card로 정의함
  { path: '/payment',  name: 'Payment', component: PaymentView },

  // Transaction
  { path: '/transactions', component: TransactionListView, meta: { requiresAuth: true } },

  // Point
  { path: '/points', component: PointListView },

  // Membership
  { path: '/memberships/register', component: MembershipRegisterView, meta: { requiresAuth: true } },
  { path: '/memberships/:id', component: MembershipDetailView, meta: { requiresAuth: true } },

  // Settings
  // 설정 메인은 비로그인 안내를 자체 처리한다 (하단 탭). 하위 상세 화면은 로그인 필요.
  { path: '/settings', component: SettingsView },
  { path: '/settings/account', component: AccountInfoView, meta: { requiresAuth: true } },
  { path: '/settings/notifications', component: NotificationSettingView, meta: { requiresAuth: true } },
  { path: '/settings/personalization', component: PersonalizationSettingView, meta: { requiresAuth: true } },
  { path: '/settings/withdrawal', component: WithdrawalView, meta: { requiresAuth: true } },

  
  
   // 404 처리
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().isLogin()) {
    return '/auth/login'
  }
})

export default router
// 07_25 연동 변경: 추가된 API 시연 화면의 프론트 라우트를 등록한다.
