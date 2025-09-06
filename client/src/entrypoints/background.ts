import {listenUpdatedWellfound} from '../utils/backgroundListeners'
import { googleLogin } from '@/services/authentication';

export default defineBackground(async () => {
  console.log('Hello from background!', { id: browser.runtime.id });

  chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed!");
  });
  // Listen to new tab updation 
  chrome.tabs.onUpdated.addListener(listenUpdatedWellfound);
  // chrome.tabs.onUpdated.addListener(listenUpdatedInternshala);
  // chrome.tabs.onUpdated.addListener(listenUpdatedLinkedIn);
  // Handle tab closure
  chrome.tabs.onRemoved.addListener((tabId) => {
    console.log(`Tab ${tabId} was closed.`);
  });

  chrome.runtime.onMessage.addListener(googleLogin);
});

