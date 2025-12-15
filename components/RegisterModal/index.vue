<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">

    <!-- Modal Container -->
    <div class="bg-black border border-gray-800 w-full max-w-[480px] rounded-2xl p-8 relative shadow-2xl">

      <!-- Close Button -->
      <button
        @click="() => $emit('onClose')"
        class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
      >
        <X :size="20" />
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">Create your account</h2>
        <p class="text-gray-500 text-sm">Join Polywhaler to track whale trades</p>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleSubmit">

        <!-- Email Input -->
        <div class="space-y-2">
          <label class="block text-white font-semibold text-sm">Email</label>

          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full bg-[#050505] border border-blue-500 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
            autofocus
          />
        </div>

        <!-- Username Input -->
        <div class="space-y-2">
          <label class="block text-white font-semibold text-sm">Username</label>

          <input
            v-model="username"
            type="text"
            placeholder="whale_tracker"
            class="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <!-- Password Input -->
        <div class="space-y-2">
          <label class="block text-white font-semibold text-sm">Password</label>

          <input
            v-model="password"
            type="password"
            placeholder="........"
            class="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <!-- Confirm Password Input -->
        <div class="space-y-2">
          <label class="block text-white font-semibold text-sm">Confirm Password</label>

          <input
            v-model="confirmPassword"
            type="password"
            placeholder="........"
            class="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <p class="my-2 text-red-400 font-semibold" v-if="error">{{ error }}</p>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-[#639bfb] hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors text-sm"
        >
          {{ (loading) ? 'Creating...' : 'Create account' }}
        </button>

      </form>

      <!-- Footer -->
      <div class="mt-6 text-center text-sm flex justify-center text-gray-500">
        Already have an account?
        <span @click="() => $emit('signInClicked')" class="text-[#639bfb] ml-1 cursor-pointer hover:text-blue-400 font-medium">Sign in</span>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { register } from '~/api/auth'


const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const emit = defineEmits(['onClose'])
const error = ref("")
const loading = ref(false);


watch(() => email.value, () => error.value = '')
watch(() => username.value, () => error.value = '')
watch(() => confirmPassword.value, () => error.value = '')
watch(() => password.value, () => error.value = '')


const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSubmit = async () => {
  if (loading.value) return;
  error.value = ""

  if (!username.value || username.value.length < 4) {
    error.value = "Username must be at least 4 characters."
    return
  }

  if (!email.value) {
    error.value = "Email is required."
    return
  }

  if (!validateEmail(email.value)) {
    error.value = "Please enter a valid email address."
    return
  }

  if (!password.value || password.value.length < 6) {
    error.value = "Password must be at least 6 characters."
    return
  }

  if (!confirmPassword.value || confirmPassword.value !== password.value) {
    error.value = "Passwords do not match."
    return
  }

  loading.value = true;
  try {
    await register(username.value, email.value, password.value)
    emit("onClose")
    loading.value = false
  } catch (err) {
    console.error(err)
    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'This email is already in use.';
        break;
      case 'auth/invalid-email':
        error.value = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        error.value = 'Email/password accounts are not enabled.';
        break;
      case 'auth/weak-password':
        error.value = 'Password is too weak (min 6 characters).';
        break;
      default:
        error.value = err.message || 'There was an error registering.';
    }
    loading.value = false
  }
}

</script>

<style scoped></style>
