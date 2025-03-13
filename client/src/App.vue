<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { formatFileSize } from './utils/format'

import type { ApiFile } from './types/apiFiles'
import FileUploader from './components/FileUploader.vue'
import { API_URL } from './services/files'

const files: Ref<ApiFile[]> = ref([])
const apiUrl = API_URL

const fetchFiles = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/files/list`)
    const data = await response.json()
    files.value = data
  } catch (error) {
    console.log(`Error fetchng files: ${error}`)
  }
}

onMounted(() => {
  fetchFiles()
  setInterval(fetchFiles, 20000)
})
</script>

<template>
  <section class="min-h-screen bg-gray-100 p-2">
    <div class="container mx-auto px-4 py-8">
      <h1 class="mb-8 text-center text-3xl font-bold text-gray-800">Share Files LAN</h1>
    </div>
    <FileUploader @file-uploaded="fetchFiles"/>

    <div class="mt-12">
      <div class="flex justify-between">
        <h2 class="mb-4 text-xl font-semibold text-gray-700">Archivos Disponibles</h2>
        <button
          @click="fetchFiles"
          class="me-2 mb-2 flex rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none"
        >
          <span>Actualizar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="ms-2 h-3 text-blue-800 flex justify-center items-center m-auto stroke-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>
      <div v-if="files.length === 0" class="text-center text-gray-500">
        No hay archivos disponibles para descargar.
      </div>
      <div v-else class="overflow-hidden rounded-lg bg-white shadow">
        <ul class="divide-y divide-gray-200">
          <li
            v-for="file in files"
            :key="file.id"
            class="flex items-center justify-between p-4 hover:bg-gray-50 flex-wrap"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mr-3 h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span class="text-gray-800">{{ file.originalName }}</span>
              <span class="ml-2 text-sm text-gray-500">{{ formatFileSize(file.size) }}</span>
            </div>
            <a
              :href="`${apiUrl}/api/files/download/${file.id}`"
              class="font-medium text-blue-600 hover:text-blue-800"
              download
            >
              Descargar
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
