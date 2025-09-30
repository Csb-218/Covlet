import { test, expect } from "./fixtures";
import { openPopup } from "./pages/popup";
import type { IProfileSchema } from "../types";
import path from "path";



test.describe("User Sign-in Flow", () => {



  test.describe("Initial State", () => {

    test.beforeEach(async ({ page, extensionId }) => {

      // open popup
      await openPopup(page, extensionId);
    })

    test("should display landing page for unauthenticated user", async ({ page, extensionId }) => {

      // Check landing page elements
      await expect(page.getByText("Welcome!")).toBeVisible();
      await expect(page.getByText("Your AI-powered cover letter assistant")).toBeVisible();
      await expect(page.getByRole("button", { name: "Login with Google" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Learn More" })).toBeVisible();
    });

    test("should display brand elements correctly", async ({ page, extensionId }) => {

      // Check brand elements
      await expect(page.getByText("Covlet").first()).toBeVisible();
      await expect(page.getByAltText("Covlet Logo")).toBeVisible();
      await expect(page.getByText("Integrated with")).toBeVisible();

      // Check integration logos
      await expect(page.getByAltText("LinkedIn")).toBeVisible();
      await expect(page.getByAltText("Wellfound")).toBeVisible();
      await expect(page.getByAltText("Internshala")).toBeVisible();
      await expect(page.getByAltText("Gmail")).toBeVisible();
    });

    test("should handle 'Learn More' button click", async ({ page, extensionId }) => {

      const learnMoreBtn = page.getByRole("button", { name: "Learn More" });

      // Mock window.open to test external navigation
      await page.evaluate(() => {
        window.open = (url) => {
          // Store the URL that would be opened
          (window as any).__openedUrl = url;
          return null;
        };
      });

      await learnMoreBtn.click();

      const openedUrl = await page.evaluate(() => (window as any).__openedUrl);
      expect(openedUrl).toBe('https://www.covlet.in/');
    });
  });

  test.describe("Google Authentication", () => {
    test("should show loading state during login", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);
      // Mock chrome.runtime.sendMessage to simulate slow login
      await page.addInitScript(() => {
        (window as any).chrome = {
          runtime: {
            sendMessage: () => new Promise(resolve => setTimeout(resolve, 1000))
          }
        };
      });

      const loginBtn = page.getByTestId("login-button");
      loginBtn.click();

      // Should show spinner instead of Google icon and text
      await expect(page.getByTestId("spinner")).toBeVisible();
      await expect(page.getByText("Login with Google")).not.toBeVisible();
    });

    test("should handle successful login", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);
      const loginBtn = page.getByTestId("login-button");
      await loginBtn.click();

      // Should navigate to authenticated state
      // await expect(page.getByTestId("app")).toBeVisible();
      await expect(page.getByText("Hi!")).not.toBeVisible();
    });

    test("should handle login failure", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);
      
      // Mock failed authentication
      await page.addInitScript(() => {
        (window as any).chrome = {
          runtime: {
            sendMessage: () => Promise.reject(new Error('Authentication failed'))
          }
        };
      });

      const loginBtn = page.getByTestId("login-button");
      await loginBtn.click();

      // Should remain on landing page
      await expect(page.getByText("Welcome!")).toBeVisible();
      await expect(page.getByTestId("login-button")).toBeVisible();
    });

    test("should disable login button during authentication", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);

      // Mock slow authentication
      await page.addInitScript(() => {
        (window as any).chrome = {
          runtime: {
            sendMessage: () => new Promise(resolve => setTimeout(resolve, 2000))
          }
        };
      });

      const loginBtn = page.getByTestId("login-button");

      await loginBtn.click();

      // Button should be disabled during loading
      await expect(loginBtn).toBeDisabled();
    });
  });

  test.describe("Post-Authentication State", () => {
    test("should create initial resume data after login", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);

      const mockUser = {
        name: "John Doe",
        email: "john.doe@example.com"
      };

      // Mock successful login and storage
      await page.addInitScript(() => {
        const mockUser = {
          name: "John Doe",
          email: "john.doe@example.com"
        };

        let resumeDataCalled = false;

        (window as any).chrome = {
          runtime: {
            sendMessage: () => Promise.resolve({ success: true })
          },
          storage: {
            local: {
              get: (keys: string[], callback: (data: any) => void) => {
                callback({ user: mockUser });
              }
            }
          }
        };

        // Mock the addResumeDataToDB function
        (window as any).addResumeDataToDB = (resume: IProfileSchema) => {
          resumeDataCalled = true;
          (window as any).resume = resume;
          return Promise.resolve();
        };
      });

      const loginBtn = page.getByRole("button", { name: "Login with Google" });
      await loginBtn.click();

      // Wait for post-login processing
      await page.waitForTimeout(500);

      // Check if resume data was created
      const resumeCreated = await page.evaluate(() => (window as any).resume);
      expect(resumeCreated).toBeDefined();
      expect(resumeCreated.personal.name).toBe(mockUser.name);
      expect(resumeCreated.personal.email).toBe(mockUser.email);
    });

    test("should display authenticated app layout", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);

      // Mock existing authenticated user
      await page.addInitScript(() => {
        (window as any).chrome = {
          storage: {
            local: {
              get: (keys: string[], callback: (data: any) => void) => {
                callback({
                  user: {
                    name: "John Doe",
                    email: "john.doe@example.com"
                  }
                });
              }
            }
          }
        };
      });

      // Reload to trigger useEffect
      await page.reload();

      // Should show authenticated layout
      await expect(page.getByTestId("app")).toBeVisible();
      await expect(page.getByText("Welcome!")).not.toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should handle Chrome runtime errors gracefully", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);

      // Mock Chrome runtime error
      await page.addInitScript(() => {
        (window as any).chrome = {
          runtime: {
            sendMessage: () => {
              throw new Error('Chrome runtime not available');
            }
          }
        };
      });

      const loginBtn = page.getByTestId("login-button");

      // Should not crash the app
      expect(async () => {
        await loginBtn.click();
      }).not.toThrow();

      // Should remain on landing page
      await expect(page.getByText("Welcome!")).toBeVisible();
    });

    test("should handle storage access failures", async ({ page, extensionId }) => {
      await openPopup(page, extensionId);

      // Mock storage error
      await page.addInitScript(() => {
        (window as any).chrome = {
          storage: {
            local: {
              get: () => {
                throw new Error('Storage access denied');
              }
            }
          }
        };
      });

      // App should still load and show landing page
      await expect(page.getByText("Welcome!")).toBeVisible();
      await expect(page.getByTestId("login-button")).toBeVisible();
    });
  });
  // test.describe("UI Interactions", () => {
  //   test("should show hover effects on interactive elements", async ({ page, extensionId }) => {
  //     await openPopup(page, extensionId);

  //     const loginBtn = page.getByRole("button", { name: "Login with Google" });
  //     const learnMoreBtn = page.getByRole("button", { name: "Learn More" });

  //     // Test hover states (this might need adjustment based on your CSS)
  //     await loginBtn.hover();
  //     await learnMoreBtn.hover();

  //     // Test logo rotation on hover
  //     const logo = page.getByAltText("Covlet Logo");
  //     await logo.hover();

  //     // These tests would need specific assertions based on your hover effects
  //   });

  //   test("should display integration platform logos", async ({ page, extensionId }) => {
  //     await openPopup(page, extensionId);

  //     // Check all integration logos are present
  //     await expect(page.getByAltText("LinkedIn")).toBeVisible();
  //     await expect(page.getByAltText("Wellfound")).toBeVisible();

  //     // Test logo hover animations (adjust based on your implementation)
  //     const linkedinLogo = page.getByAltText("LinkedIn");
  //     await linkedinLogo.hover();
  //   });
  // });
});

test.describe("User sign-out Flow", () => {

  test("should be on home page to logout", async ({ page, extensionId }) => {
    await openPopup(page, extensionId);

    // Mock existing authenticated user
    await page.addInitScript(() => {
      (window as any).chrome = {
        storage: {
          local: {
            get: (keys: string[], callback: (data: any) => void) => {
              callback({
                user: {
                  name: "John Doe",
                  email: "john.doe@example.com"
                }
              });
            }
          }
        }
      };
    });

    // Reload to trigger useEffect
    await page.reload();

    const logoutBtn = page.getByTestId("logout-button")
    await logoutBtn.click();

    // Mock existing authenticated user
    await page.addInitScript(() => {
      (window as any).chrome = {
        storage: {
          local: {
            get: (keys: string[], callback: (data: any) => void) => {
              callback({
                user: null
              });
            }
          }
        }
      };
    });

    await page.reload();


    await expect(page.getByText("Welcome!")).toBeVisible();
  })
})

test.describe("Authenticated Navigations", async () => {

  test("from home page go to profile page", async ({ page, extensionId }) => {
    await openPopup(page, extensionId);

    // Mock existing authenticated user
    await page.addInitScript(() => {
      (window as any).chrome = {
        storage: {
          local: {
            get: (keys: string[], callback: (data: any) => void) => {
              callback({
                user: {
                  name: "John Doe",
                  email: "john.doe@example.com"
                }
              });
            }
          }
        }
      };
    });

    // Reload to trigger useEffect
    await page.reload();

    await expect(page.getByTestId("greeting")).toBeVisible()

    const profileNav = page.getByTestId("profile-navlink")
    await profileNav.click()

    expect(page.getByText("Edit Your Profile"))

  })

  // test("simulate uploading a pdf in the home page", async ({ page, extensionId }) => {

  //   await openPopup(page, extensionId);

  //   // Mock existing authenticated user
  //   await page.addInitScript(() => {
  //     (window as any).chrome = {
  //       storage: {
  //         local: {
  //           get: (keys: string[], callback: (data: any) => void) => {
  //             callback({
  //               user: {
  //                 name: "John Doe",
  //                 email: "john.doe@example.com"
  //               }
  //             });
  //           }
  //         }
  //       }
  //     };
  //   });

  //   // Reload to trigger useEffect
  //   await page.reload();

  //   const resume_input = page.getByTestId("resume-input")
  //   // upload a pdf file in the resume_input 
  //   await resume_input.setInputFiles({
  //     name: 'file.pdf',
  //     mimeType: 'application/pdf',
  //     buffer: Buffer.from('this is test')
  //   });
  //   // expect a spinner
  //   // await expect(page.getByTestId("spinner")).toBeVisible();
  //   // create a mock response for the uploadResume function
  //   await page.addInitScript(() => {
  //     (window as any).uploadResume = (file: File) => {
  //       return new Promise((resolve) => {
  //         setTimeout(() => {
  //           resolve({ success: true });
  //         }, 2000);
  //       });
  //     };
  //   });

  //   // wait for the page to navigate to profile
  //   await page.waitForTimeout(30000);

  //   //await page.reload();
  //   expect(page.getByText("Edit Your Profile")).toBeVisible();


  // })

})