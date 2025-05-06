import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { listenUpdated } from "@/src/entrypoints/background";

// Mock the `isContentScriptReady` variable
let isContentScriptReady = true;

// Mock the `listenUpdated` function
// function listenUpdated(tabId: number, changeInfo: any, tab: any) {
//   if (isContentScriptReady) {
//     if (changeInfo.status === "complete" && tab.url?.includes("wellfound.com/jobs?job_listing_id")) {
//       console.log("tab detected (onUpdated):", tab.url, tabId);

//       // Send a message to the content script in the current tab
//       chrome.tabs.sendMessage(tabId, { message: "PageUpdated" }, async (response) => {
//         console.log("Message sent to content script", response);
//       });
//     }
//   }
// }
const fakeListenUpdated = vi.fn(listenUpdated);

// Test suite for the `listenUpdated` function
describe("listenUpdated Function", () => {
  beforeEach(() => {
    // Reset the fake browser environment before each test
    fakeBrowser.reset();
    vi.clearAllMocks();
  });

  it("should send a message to the content script when the tab updates to the correct URL", async () => {
    const tabId = 123;
    const url = "https://wellfound.com/jobs?job_listing_id=*/*";
    const changeInfo = { status: "complete" };
    const tab = { id: tabId,url };

    // Mock chrome.tabs.sendMessage
    const sendMessageMock = vi.fn();
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    // Simulate the onUpdated event
    fakeListenUpdated(tabId, changeInfo, tab);

    // Assertions
    expect(sendMessageMock).toHaveBeenCalledWith(tabId, { message: "PageUpdated" }, expect.any(Function));
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });

  it("should not send a message if the URL does not match", async () => {
    const tabId = 124;
    const url = "https://wellfound.com/*";
    const changeInfo = { status: "complete" };
    const tab = { id: tabId, url };

    // Mock chrome.tabs.sendMessage
    const sendMessageMock = vi.fn();
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    // Simulate the onUpdated event
    listenUpdated(tabId, changeInfo, tab);

    // Assertions
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("should not send a message if the changeInfo status is not 'complete'", async () => {
    const tabId = 125;
    const url = "https://wellfound.com/jobs?job_listing_id=*/*";
    const changeInfo = { status: "loading" };
    const tab = { id: tabId, url };

    // Mock chrome.tabs.sendMessage
    const sendMessageMock = vi.fn();
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    // Simulate the onUpdated event
    fakeListenUpdated(tabId, changeInfo, tab);

    // Assertions
    expect(sendMessageMock).not.toHaveBeenCalled();
  });
});