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
  
  interface Message {
    type: string;
    [key: string]: any;
  }
  
  export function googleLogin(message: Message, sender: object, sendResponse: any) {
    if (message.type === 'GOOGLE_LOGIN') {
      console.log("hi 3");
      try {
        const redirectUri = chrome.identity.getRedirectURL();
        const CLIENT_ID = import.meta.env.WXT_GOOGLE_CLIENT_ID;
        console.log('Actual redirect URI:', redirectUri);
        console.log('Client ID being used:', CLIENT_ID);
  
        // Generate random state and nonce
        const state = Math.random().toString(36).substring(2);
        const nonce = Math.random().toString(36).substring(2);
  
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('response_type', 'token id_token');
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('scope', 'openid email profile');
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('nonce', nonce);
        authUrl.searchParams.append('prompt', 'consent'); // Add prompt parameter
  
        console.log('Full auth URL:', authUrl.toString());
        console.log('Extension ID:', chrome.runtime.id);  // Log extension ID
  
        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl.toString(),
            interactive: true
          },
          (redirectUrl) => {
            console.log('Redirect URL received:', redirectUrl);  // Log redirect URL
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError });
              return;
            }
  
            if (!redirectUrl) {
              sendResponse({ error: 'No redirect URL' });
              return;
            }
  
            const url = new URL(redirectUrl);
            const params = new URLSearchParams(url.hash.substring(1));
            const accessToken = params.get('access_token');
  
            console.log(url, params,accessToken);
  
            if (!accessToken) {
              sendResponse({ error: 'No access token' });
              return;
            }
  
            // Get user info
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })
            .then(async(response) => {
              let user = await response.json()
              chrome.storage.local.set({ user});
              return 
            })
            .catch(error => {
              sendResponse({ error: error.message });
            });
          }
        );

      } catch (error) {
        console.error('Auth error:', error);
        return
      }
  
      return true;
    }
  }