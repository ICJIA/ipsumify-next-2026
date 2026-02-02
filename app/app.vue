<script setup lang="ts">
/**
 * Root app component.
 *
 * Sets global HTML attributes (lang, dark class) and body styles (antialiased).
 * Renders NuxtPage with UApp wrapper (toaster disabled).
 */
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
