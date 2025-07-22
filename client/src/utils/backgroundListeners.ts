export function listenUpdatedWellfound(tabId: number, changeInfo: any, tab: any) {
   
    if (changeInfo.status === 'complete' && tab.url?.includes("wellfound.com/jobs")) {
      console.log("tab detected(onUpdated):", tab.url, tabId);
      // Send a message to the content script in the current tab
      chrome.tabs.sendMessage(tabId, { message: "PageUpdatedWellFound" }, async (response) => {
        console.log('Message sent to content script', response);
      });
    }
  }

export function listenUpdatedInternshala(tabId: number, changeInfo: any, tab: any) {
    if (changeInfo.status === 'complete' && tab.url?.includes("internshala.com/application/form")) {
      console.log("tab detected(onUpdated):", tab.url, tabId);
      // Send a message to the content script in the current tab
      chrome.tabs.sendMessage(tabId, { message: "PageUpdatedInternshala" }, async (response) => {
        console.log('Message sent to content script', response);
      });
    }
  }

  export function listenUpdatedLinkedIn(tabId: number, changeInfo: any, tab: any) {
    if (changeInfo.status === 'complete' && tab.url?.includes("https://www.linkedin.com")) {
      console.log("tab detected(onUpdated):", tab.url, tabId);
      // Send a message to the content script in the current tab
      chrome.tabs.sendMessage(tabId, { message: "PageUpdatedLinkedIn" }, async (response) => {
        console.log('Message sent to content script', response);
      });
    }
  }
