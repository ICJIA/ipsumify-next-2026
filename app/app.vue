<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: "en",
    class: "dark",
  },
  bodyAttrs: {
    class: "antialiased",
  },
});
</script>

<template>
  <UApp :toaster="null">
    <NuxtPage />
  </UApp>
</template>
