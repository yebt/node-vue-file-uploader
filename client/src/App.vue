<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { formatFileSize } from './utils/format'

import type { ApiFile } from './types/apiFiles'
import FileUploader from './components/FileUploader.vue'

const files: Ref<ApiFile[]> = ref([])
const apiUrl = ref(`http://${window.location.hostname}:3000`)

const fetchFiles = async () => {
  try {
    const response = await fetch(`${apiUrl.value}/api/files/list`)
    const data = await response.json()
    console.log(data)
    files.value = data.files
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
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Share Files LAN</h1>
    </div>
    <FileUploader />

    <div class="mt-12">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Archivos Disponibles</h2>
      <div v-if="files.length === 0" class="text-center text-gray-500">
        No hay archivos disponibles para descargar.
      </div>
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <ul class="divide-y divide-gray-200">
          <li
            v-for="file in files"
            :key="file.id"
            class="p-4 flex justify-between items-center hover:bg-gray-50"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-500 mr-3"
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
              :href="`${apiUrl}/download/${file.id}`"
              class="text-blue-600 hover:text-blue-800 font-medium"
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
