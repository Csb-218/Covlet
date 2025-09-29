import { Page } from "@playwright/test";

const EXTENSION_ID = "cjllclokhemclejfphmjbajkmoececmm"

export interface MockUser {
  name: string;
  email: string;
  picture?: string;
}

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

//await page.waitForSelector("div[data-testid='app']")
  const app = page.getByTestId("app")

  return app
}

export async function mockSuccessfulAuth(page: Page, user: MockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  picture: "https://example.com/avatar.jpg"
}) {
  await page.addInitScript((mockUser) => {
    (window as any).chrome = {
      runtime: {
        sendMessage: ({ type }:{type:string}) => {
          if (type === 'GOOGLE_LOGIN') {
            return Promise.resolve({ success: true, user: mockUser });
          }
        }
      },
      storage: {
        local: {
          get: (keys: string[], callback: (data: any) => void) => {
            callback({ user: mockUser });
          },
          set: (keys: string[], callback: (data: any) => void) => {
            if (callback) callback({ user: mockUser });
          }
        }
      }
    };
  }, user);
}

export async function mockFailedAuth(page: Page, error: string = 'Authentication failed') {
  await page.addInitScript((errorMsg) => {
    (window as any).chrome = {
      runtime: {
        sendMessage: () => Promise.reject(new Error(errorMsg))
      }
    };
  }, error);
}

export async function mockSlowAuth(page: Page, delay: number = 2000) {
  await page.addInitScript((delayMs) => {
    (window as any).chrome = {
      runtime: {
        sendMessage: () => new Promise(resolve => 
          setTimeout(() => resolve({ success: true }), delayMs)
        )
      }
    };
  }, delay);
}

export async function mockExistingUser(page: Page, user: MockUser) {
  await page.addInitScript((mockUser) => {
    (window as any).chrome = {
      storage: {
        local: {
          get: (keys: string[], callback: (data: any) => void) => {
            callback({ user: mockUser });
          }
        }
      }
    };
  }, user);
}