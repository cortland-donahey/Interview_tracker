<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header
      class="border-b border-slate-200 bg-white shadow-sm"
      role="banner"
    >
      <div
        class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-slate-900">
            Interview tracker
          </h1>
          <p class="text-sm text-slate-500">
            Jobs, candidates, and question bank — stored in your browser.
          </p>
        </div>
        <nav
          class="flex flex-wrap gap-2"
          aria-label="Main"
        >
          <RouterLink
            to="/jobs"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            active-class="bg-indigo-600 text-white"
            inactive-class="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Jobs
          </RouterLink>
          <RouterLink
            to="/candidates"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            active-class="bg-indigo-600 text-white"
            inactive-class="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Candidates
          </RouterLink>
          <RouterLink
            to="/questions"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            active-class="bg-indigo-600 text-white"
            inactive-class="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Questions
          </RouterLink>
        </nav>
      </div>
    </header>
    <main
      class="mx-auto max-w-6xl px-4 py-8"
      role="main"
    >
      <RouterView />
    </main>
  </div>
</template>
