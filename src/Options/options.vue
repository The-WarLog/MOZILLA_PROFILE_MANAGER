<template>
  <div class="options-container">
    <h1>Firefox Profile Manager</h1>

    <!-- Create Profile Section -->
    <div class="create-profile">
      <h2>Create New Profile</h2>
      <form @submit.prevent="createProfile">
        <div class="form-group">
          <label for="profileName">Profile Name:</label>
          <input id="profileName" v-model="newProfile.name" type="text" placeholder="e.g., Work, Personal" required />
        </div>

        <div class="form-group">
          <label for="profilePath">Profile Path (optional):</label>
          <input id="profilePath" v-model="newProfile.path" type="text" placeholder="Will be auto-generated if empty" />
        </div>

        <button type="submit">Create Profile</button>
      </form>
    </div>

    <!-- Profiles List Section -->
    <div class="profiles-list">
      <h2>Your Profiles</h2>
      <button @click="loadingProfiles" class="refresh-btn">Refresh</button>

      <div v-if="profiles == null || profiles.length === 0" class="no-profiles">
        No profiles found. Create one above!
      </div>

      <div v-else class="profiles">
        <div v-for="profile in profiles" :key="profile.path" class="profile-card">
          <div class="profile-header">
            <span class="profile-name">{{ profile.name }}</span>
            <span v-if="profile.isDefault" class="default-badge">Default</span>
          </div>
          <p class="profile-path">Path: {{ profile.path }}</p>
          <p class="profile-date">Created: {{ new Date(profile.created).toLocaleDateString() }}</p>
          <div class="profile-actions">
            <button @click="startProfile(profile.path)" class="start-btn">Launch Profile</button>
            <button @click="deleteProfile(profile.path)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  profiles,
  newProfile,
  loadingProfiles,
  createProfile,
  deleteProfile,
  startProfile,
} from './options'

onMounted(() => {
  loadingProfiles()
})
</script>

<style scoped>
/* [Same CSS structure, with slight modifications for new layout] */
.default-badge {
  background: #07971d;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.profile-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.start-btn {
  flex: 1;
  background: #3050ba;
  color: white;
}

.start-btn:hover {
  background: #1f3a7a;
}

.delete-btn {
  flex: 1;
  background: #ff0000;
  color: white;
}

.delete-btn:hover {
  background: #cc0000;
}
</style>
