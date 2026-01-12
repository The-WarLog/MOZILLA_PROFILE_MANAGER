<template>
  <div class="popup-container">
    <h1>Firefox Profile Manager</h1>
    <div class="profiles-list">
      <button v-for="profile in profiles" :key="profile.path" @click="() => startProfile(profile.path)"
        class="profile-btn">
        <span class="profile-icon">→</span>
        {{ profile.name }}
        <span v-if="profile.isDefault" class="default-indicator">*</span>
      </button>
    </div>
    <button class="settings-btn" @click="openOptions">Manage Profiles</button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import browser from 'webextension-polyfill'
import { profiles, loadingProfiles, startProfile } from '../Options/options'

onMounted(async () => {
  console.log('Popup mounted, loading profiles...')
  await loadingProfiles()
  console.log('Profiles loaded:', profiles.value)
})

const openOptions = () => {
  browser.runtime.openOptionsPage()
}
</script>

<style scoped>
.default-indicator {
  font-size: 12px;
  margin-left: 4px;
  color: #07971d;
  font-weight: bold;
}

.popup-container {
  width: 300px;
  padding: 15px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h1 {
  font-size: 16px;
  margin: 0 0 15px 0;
}

.profiles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.profile-btn {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: left;
}

.profile-btn:hover {
  background: #e0e0e0;
  border-color: #3050ba;
}

.profile-icon {
  margin-right: 8px;
  font-weight: bold;
}

.settings-btn {
  width: 100%;
  padding: 10px;
  background: #3050ba;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.settings-btn:hover {
  background: #1f3a7a;
}
</style>
