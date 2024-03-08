<script setup lang="ts">
defineProps<{
  errors?: string[]
}>()
</script>

<template>
  <span v-if="errors?.length" class="text-red-500 italic">
    {{ errors.join(', ') }}
  </span>
</template>
