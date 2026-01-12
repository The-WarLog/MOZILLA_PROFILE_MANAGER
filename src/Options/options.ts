import { ref } from 'vue'
import browser from 'webextension-polyfill'

interface ProfileInfo {
  name: string
  path: string
  isDefault: boolean
  created: number
}

export const profiles = ref<Array<ProfileInfo>>([])

export const newProfile = ref({
  name: '',
  path: '',
})

export async function loadingProfiles() {
  try {
    profiles.value = await browser.runtime.sendMessage({
      type: 'LIST_PROFILES',
    })
  } catch (error) {
    console.error('Failed to load profiles:', error)
  }
}

export async function createProfile() {
  try {
    await browser.runtime.sendMessage({
      type: 'CREATE_PROFILE',
      name: newProfile.value.name,
      path: newProfile.value.path,
    })
    newProfile.value = { name: '', path: '' }
    await loadingProfiles()
  } catch (error) {
    console.error('Failed to create profile:', error)
  }
}

export async function deleteProfile(profilePath: string) {
  try {
    await browser.runtime.sendMessage({
      type: 'DELETE_PROFILE',
      profilePath: profilePath,
    })
    await loadingProfiles()
  } catch (error) {
    console.error('Failed to delete profile:', error)
  }
}

export async function startProfile(profilePath: string) {
  try {
    await browser.runtime.sendMessage({
      type: 'START_PROFILE',
      profilePath: profilePath,
    })
  } catch (error) {
    console.error('Failed to start profile:', error)
  }
}
