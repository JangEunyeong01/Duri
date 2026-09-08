<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  placeholder: {
    type: String,
    default: ''
  },

  type: {
    type: String,
    default: 'text'
  },

  label: {
    type: String,
    default: ''
  },

  message: {
    type: String,
    default: ''
  },

  error: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:modelValue'
])

// 오류 문구를 aria-describedby 로 입력칸에 연결하기 위한 고유 id
const messageId = `app-input-msg-${Math.random().toString(36).slice(2, 9)}`
</script>


<template>
  <div class="input-wrapper">

    <label v-if="label">
      {{ label }}
    </label>


    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="{ error }"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="message ? messageId : undefined"
      @input="
        $emit(
          'update:modelValue',
          $event.target.value
        )
      "
    />


    <p
      v-if="message"
      :id="messageId"
      class="message"
      :class="{ errorText: error }"
      :role="error ? 'alert' : undefined"
    >
      {{ message }}
    </p>

  </div>
</template>


<style scoped>
.input-wrapper {
  width: 100%;
  margin-bottom: var(--space-md);
}


label {
  display: block;

  margin-bottom: var(--space-xs);

  font-size: var(--font-sm);
  font-weight: var(--font-semibold);

  color: var(--color-text-primary);
}


input {
  width: 100%;
  height: 48px;

  padding: 0 var(--space-sm);

  box-sizing: border-box;

  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);

  background: var(--color-surface);

  color: var(--color-text-primary);

  font-size: var(--font-sm);

  transition: var(--transition-fast);
}


input::placeholder {
  color: var(--color-text-secondary);
}


/* outline 을 지우는 대신 반드시 보이는 링을 남긴다 (WCAG 2.4.7).
   테두리 색만 바꾸면 색 구분이 어려운 사용자에게 포커스가 전달되지 않음 */
input:focus {
  outline: none;

  border-color: var(--color-input-focus);
}


input:focus-visible {
  border-color: var(--color-input-focus);

  box-shadow: 0 0 0 3px var(--color-focus-ring);
}


input.error {
  border-color: var(--color-input-error);
}


.message {
  margin-top: var(--space-xxs);

  font-size: var(--font-xs);

  color: var(--color-text-secondary);
}


.errorText {
  color: var(--color-input-error);
}
</style>