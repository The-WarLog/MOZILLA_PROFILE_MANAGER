import browser from 'webextension-polyfill'

type Message =
  | { type: 'LIST_PROFILES' }
  | { type: 'CREATE_PROFILE'; name: string; path?: string }
  | { type: 'DELETE_PROFILE'; profilePath: string }
  | { type: 'START_PROFILE'; profilePath: string }
  | { type: 'GET_PROFILE_INFO'; profilePath: string }

interface ProfileInfo {
  name: string
  path: string
  isDefault: boolean
  created: number
}

export async function sendMessages(message: Message): Promise<any> {
  try {
    // Send message to native host
    const response = await browser.runtime.sendNativeMessage(
      'firefox_profile_manager', // Native host name
      message,
    )
    return response
  } catch (error) {
    console.error('Native messaging error:', error)
    // anage profiles in extension storage
    return handleStorageProfile(message)
  }
}

// Store profile configs in extension storage
async function handleStorageProfile(message: Message): Promise<any> {
  const storage = await browser.storage.sync.get('profiles')
  const profiles: Record<string, ProfileInfo> =
    (storage.profiles as Record<string, ProfileInfo>) || {}

  switch (message.type) {
    case 'LIST_PROFILES':
      return Object.values(profiles)

    case 'CREATE_PROFILE':
      const newProfile: ProfileInfo = {
        name: message.name,
        path: message.path || `user-${Date.now()}`,
        isDefault: false,
        created: Date.now(),
      }
      profiles[newProfile.path] = newProfile
      await browser.storage.sync.set({ profiles })
      return newProfile

    case 'DELETE_PROFILE':
      delete profiles[message.profilePath]
      await browser.storage.sync.set({ profiles })
      return { success: true }

    default:
      return { error: 'Unknown message type' }
  }
}
