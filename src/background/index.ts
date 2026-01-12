import { sendMessages } from './messanging'
import browser from 'webextension-polyfill'

browser.runtime.onMessage.addListener((message: any): Promise<any> => {
  return sendMessages(message)
})
