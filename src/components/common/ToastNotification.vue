<script setup>
import { computed, ref, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'success', // success, error, info, warning
  },
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 3000, // 3초 — 가벼운 피드백은 3초 후 자동으로 사라진다
  },
})

const emit = defineEmits(['close'])

const isVisible = ref(true)

const handleClose = () => {
  isVisible.value = false
  emit('close')
}

const iconMap = {
  success: 'check',
  error: 'close',
  info: 'info',
  warning: 'alert',
}

const colorMap = {
  success: 'var(--color-primary-dark)',
  error: 'var(--color-coral)',
  info: 'var(--color-primary-dark)',
  warning: 'var(--color-toast-warning)',
}

// Auto close on mount
onMounted(() => {
  if (props.duration) {
    setTimeout(handleClose, props.duration)
  }
})
</script>

<template>
  <transition name="toast-slide">
    <div
      v-if="isVisible"
      class="toast"
      :class="`toast-${type}`"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="toast-icon" :style="{ color: colorMap[type] }">
        <Icon :name="iconMap[type]" size="sm" />
      </div>
      <div class="toast-content">
        <p class="toast-message">{{ message }}</p>
      </div>
      <button
        class="toast-close"
        type="button"
        aria-label="알림 닫기"
        @click="handleClose"
      ><Icon name="close" size="xs" /></button>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 94px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 400px;
  width: 90%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  z-index: var(--z-toast);
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.toast-success {
  background: #F9FBF9;
}

.toast-error {
  background: #FBF9FA;
}

.toast-info {
  background: #F9FBF9;
}

.toast-warning {
  background: #FFFDF9;
}

.toast-icon {
  font-size: var(--font-lg);
  font-weight: bold;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  margin: 0;
  font-size: var(--typo-body-medium-size);
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

/* 아이콘은 24×24 지만 ::after 로 히트박스를 44×44 까지 넓힌다 (터치 영역 최소치) */
.toast-close::after {
  content: '';
  position: absolute;
  inset: -10px;
}

.toast-close {
  position: relative;
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-title);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.toast-close:hover {
  color: var(--color-text-primary);
}

/* Animations */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all var(--transition-slow);
}

.toast-slide-enter-from {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

/* Dark mode */
[data-theme="dark"] .toast {
  background: #2a2a2e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .toast-success {
  background: #272e2a;
}

[data-theme="dark"] .toast-error {
  background: #2e272a;
}

[data-theme="dark"] .toast-info {
  background: #272e2a;
}

[data-theme="dark"] .toast-warning {
  background: #2e2a27;
}

[data-theme="dark"] .toast-message {
  color: #f0f0f0;
}

[data-theme="dark"] .toast-close {
  color: #83868B;
}

[data-theme="dark"] .toast-close:hover {
  color: #f0f0f0;
}
</style>
