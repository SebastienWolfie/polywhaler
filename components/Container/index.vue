<template>
    <div>
        <Header :page="page" 
                class="sticky top-0 z-50"
                @signInClicked="()=>toggleLoginModal(true)"/>

        <slot></slot>

        <Footer />
        
        <RegisterModal v-if="isRegisterOpen" 
                       @onClose="()=>toggleRegisterModal(false)"
                       @signInClicked="() => toggleLoginModal(true)"/>
        <SignInModal v-if="isLoginOpen" 
                     @onClose="()=>toggleLoginModal(false)"
                     @registerClicked="() => toggleRegisterModal(true)"/>

        <NotAuthModal v-if="isNoAuthOpen" 
                       @onClose="()=>toggleNoAuthModal(false)"
                       @signInClicked="() => toggleLoginModal(true)"/>

        <PriceModal v-if="isPriceOpen" 
                       @onClose="()=>togglePriceModal(false)"
                       @noAuthClicked="() => toggleLoginModal(true)"/>
    </div>
</template>

<script setup>
    const props = defineProps(['page'])

    const auth = useAuth();
    const isRegisterOpen = ref(false);
    const isLoginOpen = ref(false);
    const isNoAuthOpen = ref(false);
    const isPriceOpen = ref(false);


    onMounted(() => {
        auth.value.showNoAuthModal = showNoAuthModal
        auth.value.showPriceModal = showPriceModal
    })

    function showNoAuthModal() {
        toggleNoAuthModal(true)
    }
    function showPriceModal() {
        togglePriceModal(true)
    }

  function toggleNoAuthModal(value) {
      scrollUp(value);
      if (value) {
        togglePriceModal(false)
        toggleRegisterModal(false)
        toggleLoginModal(false)
      }
      isNoAuthOpen.value = value;
  }

  function togglePriceModal(value) {
      scrollUp(value);
      if (value) {
        toggleNoAuthModal(false)
        toggleRegisterModal(false)
        toggleLoginModal(false)
      }
      isPriceOpen.value = value;
  }


  function toggleRegisterModal(value) {
      scrollUp(value);
      if (value) {
        toggleNoAuthModal(false)
        togglePriceModal(false)
        toggleLoginModal(false)
      }
      isRegisterOpen.value = value;
  }

  function toggleLoginModal(value) {
      scrollUp(value);
      if (value) {
        togglePriceModal(false)
        toggleRegisterModal(false)
        toggleNoAuthModal(false)
      }
      isLoginOpen.value = value;
  }

  function scrollUp(value) {
      if (value) {
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
  }
</script>