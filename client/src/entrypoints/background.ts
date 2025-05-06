import {googleLogin,listenUpdated} from '../utils/backgroundFunctions'

export default defineBackground(async () => {
  console.log('Hello csb !', { id: browser.runtime.id });

  chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed!");
  });

  var isContentScriptReady: boolean = true;

  // Listen to new tab updation 
  chrome.tabs.onUpdated.addListener(listenUpdated);

  // Handle tab closure
  chrome.tabs.onRemoved.addListener((tabId) => {
    console.log(`Tab ${tabId} was closed.`);
  });

  chrome.runtime.onMessage.addListener(googleLogin);
});

