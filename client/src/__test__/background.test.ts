import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fakeBrowser } from "wxt/testing";
import background from '@/entrypoints/background';

// Mock the dependencies at the top level
vi.mock('../utils/backgroundListeners', () => ({
  listenUpdatedWellfound: vi.fn(),
  listenUpdatedInternshala: vi.fn(),
  listenUpdatedLinkedIn: vi.fn(),
}))

vi.mock('@/services/authentication', () => ({
  googleLogin: vi.fn(),
}))

// Import the mocked functions
import { listenUpdatedWellfound } from '../utils/backgroundListeners'
import { googleLogin } from '@/services/authentication'

describe('background script', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    fakeBrowser.reset();
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(["install", "update", "browser_update"])(
    "should listen on Installed with reason: %s",
    async (reason) => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Start the background script
      background.main();
      
      // Trigger the onInstalled event
      await fakeBrowser.runtime.onInstalled.trigger({
        reason: reason as any,
        temporary: true,
      });
      
      expect(logSpy).toHaveBeenCalledWith("Extension Installed!");
      logSpy.mockRestore();
    },
  );

  it("should call listenUpdatedWellfound when a tab is updated", async () => {
    // Start the background script
    background.main();
    
    const tabId = 123;
    const changeInfo = { status: "complete" };
    const tab = { id: tabId, url: "https://example.com" };
    
    // Trigger the tab update event
    await fakeBrowser.tabs.onUpdated.trigger(tabId, changeInfo, tab);
    
    // Check if the mocked function was called
    expect(listenUpdatedWellfound).toHaveBeenCalledWith(tabId, changeInfo, tab);
  });

  it("should log when a tab is removed", async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Start the background script
    background.main();
    
    const tabId = 456;
    
    // Trigger the tab removal event
    await fakeBrowser.tabs.onRemoved.trigger(tabId, { windowId: 1, isWindowClosing: false });
    
    expect(logSpy).toHaveBeenCalledWith(`Tab ${tabId} was closed.`);
    logSpy.mockRestore();
  });

  it("should add googleLogin as a runtime message listener", async () => {
    const addListenerSpy = vi.spyOn(fakeBrowser.runtime.onMessage, 'addListener');
    
    // Start the background script
    background.main();
    
    expect(addListenerSpy).toHaveBeenCalledWith(googleLogin);
    addListenerSpy.mockRestore();
  });

  it("should log hello message on initialization", async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Start the background script
    background.main();
    
    expect(logSpy).toHaveBeenCalledWith(
      'Hello from background!', 
      { id: fakeBrowser.runtime.id }
    );
    logSpy.mockRestore();
  });

  it("should register all required listeners", async () => {
    const runtimeSpy = vi.spyOn(fakeBrowser.runtime.onInstalled, 'addListener');
    const tabUpdateSpy = vi.spyOn(fakeBrowser.tabs.onUpdated, 'addListener');
    const tabRemoveSpy = vi.spyOn(fakeBrowser.tabs.onRemoved, 'addListener');
    const messageSpy = vi.spyOn(fakeBrowser.runtime.onMessage, 'addListener');
    
    // Start the background script
    background.main();
    
    expect(runtimeSpy).toHaveBeenCalled();
    expect(tabUpdateSpy).toHaveBeenCalledWith(listenUpdatedWellfound);
    expect(tabRemoveSpy).toHaveBeenCalled();
    expect(messageSpy).toHaveBeenCalledWith(googleLogin);
    
    runtimeSpy.mockRestore();
    tabUpdateSpy.mockRestore();
    tabRemoveSpy.mockRestore();
    messageSpy.mockRestore();
  });
})



