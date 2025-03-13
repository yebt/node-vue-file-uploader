<script setup lang="ts">
import { ref, type Ref } from 'vue'
import {formatFileSize} from '@/Utils/format'

const selectedFile: Ref<File | null> = ref(null) // File selected
const fileInput = ref(null)

const isDragging: Ref<boolean> = ref(false)
const isUploading: Ref<boolean> = ref(false)
const uploadProgress: Ref<number> = ref(0)
const uploadError: Ref<string> = ref('')
const uploadSuccess: Ref<boolean> = ref(false)

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}


const uploadFile = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  isUploading.value = true
  uploadProgress.value = 0
  uploadError.value = ''
  uploadSuccess.value = false

  try {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    })

    xhr.onload = function () {
      if (xhr.status === 200) {
        uploadSuccess.value = true
        selectedFile.value = null
        // Dispatch event to update the file list
        window.dispatchEvent(new CustomEvent('file-uploaded'))
      } else {
        uploadError.value = 'Error to try upload file. please try again'
      }
      isUploading.value = false
    }

    xhr.onerror = function () {
      uploadError.value = 'Error in the connection. Check your internet connection'
      isUploading.value = false
    }

    const apiURL = `http://${window.location.hostname}:3000`
    xhr.open('POST', `${apiURL}/api/files/upload`, true)
    xhr.send(formData)
  } catch (error) {
    uploadError.value = `Error uploading file: ${error}`
    isUploading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-700">Subir Nuevo Archivo</h2>

    <div class="mb-4">
      <div class="flex items-center justify-center w-full">
        <label
          class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100"
          :class="{ 'border-blue-500 bg-blue-50': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-12 h-12 mb-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="mb-2 text-sm text-gray-500">
              <span class="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
            </p>
            <p class="text-xs text-gray-500">PDF, DOC, XLS, JPG, PNG (Máx. 50MB)</p>
          </div>
          <input type="file" class="hidden" @change="onFileChange" ref="fileInput" />
        </label>
      </div>
    </div>

    <div
      v-if="selectedFile"
      class="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between"
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
        <div>
          <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
          <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
      </div>
      <button @click="selectedFile = null" class="text-red-500 hover:text-red-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div class="flex justify-end mt-4">
      <button
        @click="uploadFile"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        :disabled="!selectedFile || isUploading"
      >
        <span v-if="isUploading">
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Subiendo...
        </span>
        <span v-else>Subir Archivo</span>
      </button>
    </div>

    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-4">
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="text-sm text-gray-600 mt-1">{{ uploadProgress }}% Completado</p>
    </div>

    <div v-if="uploadError" class="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
      {{ uploadError }}
    </div>

    <div v-if="uploadSuccess" class="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
      ¡Archivo subido con éxito!
    </div>
  </div>
</template>

<style scoped></style>
