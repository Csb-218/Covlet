import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { listenUpdatedWellfound } from "@/utils/backgroundListeners";

const fakeListenUpdated = vi.fn(listenUpdatedWellfound);

// Test suite for the `listenUpdated` function
describe("listenUpdated Function", () => {
  beforeEach(() => {
    // Reset the fake browser environment before each test
    fakeBrowser.reset();
    vi.clearAllMocks();
  }); 

  it("should send PageUpdatedWellFound message for Wellfound jobs URL", async () => {
    const tabId = 123;
    const url = "https://wellfound.com/jobs";
    const changeInfo = { status: "complete" };
    const tab = { id: tabId, url };

    const sendMessageMock = vi.fn();
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    fakeListenUpdated(tabId, changeInfo, tab);

    expect(sendMessageMock).toHaveBeenCalledWith(
      tabId, 
      { message: "PageUpdatedWellFound" },
      expect.any(Function)
    );
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });

  it("should send PageUpdatedInternshala message for Internshala URL", async () => {
    const tabId = 124;
    const url = "https://internshala.com/application/form";
    const changeInfo = { status: "complete" };
    const tab = { id: tabId, url };

    const sendMessageMock = vi.fn();
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    listenUpdatedInternshala(tabId, changeInfo, tab);

    expect(sendMessageMock).toHaveBeenCalledWith(
      tabId,
      { message: "PageUpdatedInternshala" }, 
      expect.any(Function)
    );
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });

  it("should send PageUpdatedLinkedIn message for LinkedIn URL", async () => {
    const tabId = 125;
    const url = "https://www.linkedin.com/jobs";
    const changeInfo = { status: "complete" };
    const tab = { id: tabId, url };

    const sendMessageMock = vi.fn();
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    listenUpdatedLinkedIn(tabId, changeInfo, tab);

    expect(sendMessageMock).toHaveBeenCalledWith(
      tabId,
      { message: "PageUpdatedLinkedIn" },
      expect.any(Function)
    );
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
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

  

