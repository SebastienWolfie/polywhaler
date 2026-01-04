
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">

    <!-- Modal Container -->
    <div v-if="!showLoadingModal" class="bg-black border border-gray-800 w-full max-w-[480px] rounded-2xl p-8 relative shadow-2xl">

      <!-- Close Button -->
      <button @click="() => $emit('onClose')"
        class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <X :size="20" />
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-1">Welcome to Polywhaler</h2>
        <p class="text-gray-500 text-sm">Sign in to access all features</p>
      </div>

      <!-- Form -->
      <div class="space-y-4">

        <!-- Email Input -->
        <div class="space-y-2">
          <label class="block text-white font-semibold text-sm">Email</label>
          <input type="email" placeholder="you@example.com" v-model="email" class="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
        </div>

        <!-- Password Input -->
        <div class="space-y-2">
          <label class="block text-white font-semibold text-sm">Password</label>
          <input type="password" placeholder="••••••••" v-model="password" class="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
        </div>


        <div class="space-y-2" v-if="auth.isWalletConnected">
          <label class="block text-white font-semibold text-sm">Wallet address</label>
          <input v-model="auth.walletAddress" disabled class="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
        </div>

        <p class="my-2 text-red-400 font-semibold" v-if="error">{{ error }}</p>

        <button class="w-full bg-[#639bfb] hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors text-sm"
                v-if="!showLoginButton"
                @click="() => connectClicked()">
          {{ (connectLoading) ? 'Connecting...' : 'Connect Wallet' }}
        </button>

        <!-- Sign In Button -->
        <button @click="() => handleSubmit()"
          class="w-full bg-[#639bfb] hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors text-sm"
          v-else>
          {{ (loading) ? 'Loading...' : 'Sign in' }}
        </button>
      </div>

      <!-- Divider -->
      <!-- <div class="flex items-center my-6">
        <hr class="flex-grow border-gray-800" />
        <span class="px-3 text-xs font-semibold uppercase text-gray-500">
          Or continue with
        </span>
        <hr class="flex-grow border-gray-800" />
      </div> -->

      <!-- Google Login Button -->
      <!-- <button type="button" @click="() => googleClicked()" class="w-full border border-gray-700 hover:border-white text-white font-semibold py-3.5 rounded-xl flex items-center justify-center 
        transition-colors text-sm bg-[#050505] hover:bg-gray-900">

        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5 mr-3">
          <path fill="#4285F4"
            d="M24 10.3c3.2 0 5.6 1.4 6.8 2.6l4.6-4.6c-2.9-2.7-6.9-4.3-11.4-4.3C14.7 4 7.8 10.9 7.8 20s6.9 16 16.2 16c4.6 0 8.7-1.6 11.6-4.3l-4.6-4.6c-1.3 1.2-3.7 2.6-7 2.6-4.7 0-8.6-3.9-8.6-8.8S19.3 11.2 24 11.2z" />
          <path fill="#34A853"
            d="M43.7 24c0-1.8-.1-3.6-.5-5.3H24v10.6h11.8c-.5 3.1-2.2 5.6-4.7 7.3l-7.1 7.1c-4.4-4.2-7.1-10.2-7.1-17.6 0-.8.1-1.5.2-2.3H4v8h6.1c1.2 2.7 3.2 5 5.6 6.6l7.1 7.1c4.5-4.2 7.3-10.2 7.3-17.6z" />
          <path fill="#FBBC05"
            d="M43.7 24h-19.7v-4.7h19.7c.3 1.6.5 3.3.5 5.3s-.2 3.7-.5 5.3H24v-10.6h19.7c.3 1.6.5 3.3.5 5.3z" />
          <path fill="#EA4335"
            d="M24 39.8c-4.6 0-8.6-1.6-11.4-4.3l-4.6 4.6c2.9 2.7 6.9 4.3 11.4 4.3 4.6 0 8.7-1.6 11.6-4.3l-4.6-4.6c-1.3 1.2-3.7 2.6-7 2.6z" />
        </svg>

        Continue with Google
      </button> -->

      <!-- Footer -->
      <div class="mt-8 text-center flex justify-center text-sm text-gray-500">
        Don't have an account?
        <span @click="() => $emit('registerClicked')"
          class="text-[#639bfb] ml-1 cursor-pointer hover:text-blue-400 font-medium">
          Sign up
        </span>
      </div>

    </div>

    <RegisterModalLoading :address-signature="auth.addressSignature"
                          :wallet-address="auth.walletAddress"
                          @close="() => {
                            showLoginButton=false
                            connectLoading=false
                            showLoadingModal=false
                            disconnectWallet()
                            auth.walletAddress=''
                            auth.isWalletConnected=false
                          }"
                          @onComplete="() => {
                            showLoginButton=true
                            connectLoading=false
                            showLoadingModal=false
                          }"
                          v-else/>
  </div>
</template>


<script setup>
import { X } from 'lucide-vue-next'
import { googleLogin, login } from '../../apiss/auth'
import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork, getProvider, getWalletETHBalance } from '../../apiss/web3/walletconnect';
import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../../apiss/walletSignature'



const emit = defineEmits(['onClose'])
const error = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const connectLoading = ref(false)
const showLoginButton = ref(false)
const showLoadingModal = ref(false)
const auth = useAuth();

watch(() => email.value, () => error.value = '')
watch(() => password.value, () => error.value = '')

async function googleClicked() {
  try {
    await googleLogin();
    emit('onClose')
  } catch (err) {
    error.value = 'There was an error'
    console.log(err)
  }
}

async function connectClicked() {
  openModal()
}


const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSubmit = async () => {
  if (loading.value) return;
  error.value = ""

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

  loading.value = true;
  try {
    await login(email.value, password.value);
    emit('onClose')
    loading.value = false
  } catch (err) {
    switch (err.code) {
      case 'auth/user-not-found':
        error.value = 'No user found with this email.';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-email':
      case 'auth/invalid-login-credentials':
        error.value = 'Invalid email address or password.';
        break;
      case 'auth/user-disabled':
        error.value = 'This user account has been disabled.';
        break;
      default:
        error.value = err.message || 'There was an error logging in.';
    }
    console.log(err.code)
    loading.value = false
  }
}




watch(() => auth.value.walletAddress, async() => {
        if (!auth.value.walletAddress) return;

        connectLoading.value = true;
        auth.value.addressSignature = await getAddressSignature(auth.value.walletAddress);
        

        if (!auth.value.isWalletConnected) {
            openModal()
            return;
        }


        if (getChainID() != 137){
            if (window.ethereum) await switchNetwork(137);
            else {
                await disconnectWallet();
                auth.value.isWalletConnected = false;
                auth.value.walletAddress = "";
                alert("Switch to Polygon Mainnet Network");  
            }
            return;
        }
        showLoginButton.value = true;
    })

    // onMounted(() => {

    //         disconnectWallet()
    //         auth.value.addressSignature = null
    //         auth.value.walletAddress = ''
    //         auth.value.isWalletConnected = false
    //         showLoginButton.value = false;
    // })




</script>
