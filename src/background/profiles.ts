import browser from 'webextension-polyfill'
export async function createProfiles(name: string) {
  return await browser.contextualIdentities.create({
    name: name,
    color: 'blue',
    icon: 'fingerprint',
  })
}

export async function listProfiles() {
  return await browser.contextualIdentities.query({})
}

export async function removeProfile(cookieStoreId: string) {
  return await browser.contextualIdentities.remove(cookieStoreId)
}
