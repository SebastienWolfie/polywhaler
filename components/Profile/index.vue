<template>
  <div class="min-h-screen bg-[#0A0C10] text-white">

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto px-6 py-10 space-y-10">

      <!-- Account Information -->
      <section class="bg-[#11151D] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h2 class="text-xl font-semibold mb-4">Account Information</h2>

        <div class="space-y-4">
          <div>
            <label class="text-sm text-white/50">User ID</label>
            <p class="text-sm font-medium mt-1 break-all">{{ user?.id }}</p>
          </div>

          <div>
            <label class="text-sm text-white/50">Username</label>
            <p class="text-sm font-medium mt-1">{{ user?.username }}</p>
          </div>

          <div>
            <label class="text-sm text-white/50">Email</label>
            <p class="text-sm font-medium mt-1">{{ user?.email }}</p>
          </div>


          <div>
            <p class="text-sm font-[18px]">{{ (user && user.emailVerified) ? 'Email verified' : 'Email not verified' }}</p>
            
            <button @click="() => sendVerificationClicked()"
              v-if="!(user && user.emailVerified)"
              class="w-fit bg-[#639bfb] hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl mt-1 transition-colors text-sm">
              Send verification mail
            </button>
          </div>

          <div>
            <label class="text-sm text-white/50">Password</label>
            <p class="text-sm font-medium mt-1">************ (hidden)</p>
          </div>


          <div>
            <label class="text-sm text-white/50">Wallet Address</label>
            <p class="text-sm font-medium mt-1">{{ useAuth().value?.walletAddress }}</p>
          </div>


          <div>
            <label class="text-sm text-white/50">Account Created</label>
            <p class="text-sm font-medium mt-1">
              {{ formatDate(user?.dateCreated) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Security Section -->
      <section class="bg-[#11151D] border border-white/5 rounded-2xl p-6 shadow-xl">
        <!-- <h2 class="text-xl font-semibold mb-4">Security</h2> -->

        <div class="space-y-4">
          <!-- <button
            class="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold w-full shadow-md shadow-blue-500/20 hover:opacity-90 transition"
            @click="changePassword"
          >
            Change Password
          </button> -->

          <button
            class="px-4 py-3 border border-red-500/60 text-red-400 rounded-xl text-sm font-bold w-full hover:bg-red-500/10 transition"
            @click="logoutClicked">
            Log Out
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import logout from '~/apiss/logout'
import Date from '../../utils/Date'

const auth = useAuth()
const user = ref()

onMounted(() => {
  if (auth.value.user) user.value = auth.value.user
})

watch(()=>auth.value.user, ()=> {
  if (auth.value.user) user.value = auth.value.user
})

const formatDate = (date) => {
  return new Date(date).format('MMMM dd, yyyy hh:mm a')
}

const sendVerificationClicked = async () => {
  const { sendConfirmAccountEmail } = useEmaiApi();
  const result = await sendConfirmAccountEmail(user.value.id, user.value.email, user.value.username, auth.value.walletAddress)
  auth.value.showEmailConfirmationSent = true
}

const logoutClicked = async () => {
  await logout()
  navigateTo('/')
}
</script>
