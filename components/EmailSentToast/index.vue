<template>
  <transition name="toast">
    <div
      v-if="visible"
      class="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3"
    >
      <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-lg">
        ✉️
      </div>
      <div>
        <div class="font-semibold text-sm">Verification email sent</div>
        <div class="text-xs opacity-80">Check your inbox to continue</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const visible = ref(false)

const show = () => {
  visible.value = true
  setTimeout(() => {
    visible.value = false;
    useAuth().value.showEmailConfirmationSent = false
  }, 4000)
}


defineExpose({ show })
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
