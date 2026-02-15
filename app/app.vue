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
    <NuxtErrorBoundary>
      <NuxtPage />
      <template #error="{ error, clearError }">
        <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
          <div class="max-w-md text-center">
            <h1 class="text-4xl font-bold text-[#fafafa] mb-4">Oops!</h1>
            <p class="text-[#d1d5db] mb-6">
              {{ error?.message || "Something went wrong. Please try refreshing the page." }}
            </p>
            <button
              class="rounded-lg bg-[#00d4aa] px-4 py-2 text-[#0a0a0a] hover:bg-[#00c299]"
              @click="clearError"
            >
              Try Again
            </button>
          </div>
        </div>
      </template>
    </NuxtErrorBoundary>
  </UApp>
</template>
