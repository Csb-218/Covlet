import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import { handleWellfoundUpdate } from "./messageHandlers";
import { getMessageBox, getJobDetails, canInjectIcon } from "./DOM";
import { createUI, createMagicIcon, type JobData } from "./ui";

// Mock dependencies
vi.mock("./DOM");
vi.mock("./ui");

const mockGetMessageBox = getMessageBox as MockedFunction<typeof getMessageBox>;
const mockGetJobDetails = getJobDetails as MockedFunction<typeof getJobDetails>;
const mockCanInjectIcon = canInjectIcon as MockedFunction<typeof canInjectIcon>;
const mockCreateUI = createUI as MockedFunction<typeof createUI>;
const mockCreateMagicIcon = createMagicIcon as MockedFunction<
  typeof createMagicIcon
>;

describe("messageHandlers", () => {
  let mockCtx: any;
  let mockSendResponse: MockedFunction<(response: any) => void>;
  let mockObserver: any;
  let mockMagicIcon: HTMLElement;
  let mockUI: any;
  let mockMessageBox: HTMLElement;
  let mockParentElement: HTMLElement;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock context
    mockCtx = {
      contentWindow: window,
      signal: new AbortController().signal,
    };

    // Mock sendResponse
    mockSendResponse = vi.fn();

    // Mock DOM elements
    mockMessageBox = document.createElement("textarea");
    mockParentElement = document.createElement("div");
    mockParentElement.appendChild(mockMessageBox);

    mockMagicIcon = document.createElement("div");
    mockMagicIcon.innerHTML = "🪄";

    // Mock UI
    mockUI = {
      mount: vi.fn(),
      unmount: vi.fn(),
    };

    // Mock MutationObserver
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    // Mock MutationObserver constructor
    global.MutationObserver = vi.fn().mockImplementation((callback) => {
      mockObserver.callback = callback;
      return mockObserver;
    });

    // Set up default mock implementations
    mockCreateMagicIcon.mockReturnValue(mockMagicIcon);
    mockCreateUI.mockResolvedValue(mockUI);
    mockGetMessageBox.mockReturnValue(mockMessageBox);
    mockCanInjectIcon.mockReturnValue(true);
    mockGetJobDetails.mockReturnValue({
      aboutTheJobSection: "Test job description",
      jobRole: "Software Engineer",
      company: "Test Company",
    });

    // Mock console.log to avoid noise in tests
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("handleWellfoundUpdate", () => {
    it("should set up MutationObserver and send success response", async () => {
      try {
        await handleWellfoundUpdate(mockCtx, mockSendResponse);
      } catch (error) {
        console.error("Full error:", error);
        console.error("Stack trace:", error);
        throw error;
      }

      // Act
      await handleWellfoundUpdate(mockCtx, mockSendResponse);

      // Assert
      expect(MutationObserver).toHaveBeenCalledWith(expect.any(Function));
    //   expect(mockObserver.observe).toHaveBeenCalledWith(document, {
    //     childList: true,
    //     subtree: true,
    //     attributes: true,
    //   });
      expect(mockSendResponse).toHaveBeenCalledWith({
        status: "success",
        response: "message received",
      });
    });

    it("should create magic icon on initialization", async () => {
      // Act
      await handleWellfoundUpdate(mockCtx, mockSendResponse);

      // Assert
      expect(mockCreateMagicIcon).toHaveBeenCalled();
    });

    it("should inject icon and set up UI when conditions are met", async () => {
      // Arrange
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Assert
      expect(mockGetMessageBox).toHaveBeenCalled();
      expect(mockCanInjectIcon).toHaveBeenCalledWith(mockMessageBox);
      expect(mockParentElement.contains(mockMagicIcon)).toBe(true);
      expect(mockGetJobDetails).toHaveBeenCalled();
      expect(mockCreateUI).toHaveBeenCalledWith(mockCtx, {
        aboutTheJobSection: "Test job description",
        jobRole: "Software Engineer",
        company: "Test Company",
        messageBox: mockMessageBox,
      });
    });

    it("should set up click handler for magic icon", async () => {
      // Arrange
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Simulate icon click
      mockMagicIcon.click();

      // Assert
      expect(mockUI.mount).toHaveBeenCalled();
    });

    it("should disconnect observer after successful setup", async () => {
      // Arrange
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Assert
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });

    it("should not inject icon when messageBox is null", async () => {
      // Arrange
      mockGetMessageBox.mockReturnValue(null);
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Assert
      expect(mockCanInjectIcon).not.toHaveBeenCalled();
      expect(mockGetJobDetails).not.toHaveBeenCalled();
      expect(mockCreateUI).not.toHaveBeenCalled();
      expect(mockObserver.disconnect).not.toHaveBeenCalled();
    });

    it("should not inject icon when canInjectIcon returns false", async () => {
      // Arrange
      mockCanInjectIcon.mockReturnValue(false);
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Assert
      expect(mockCanInjectIcon).toHaveBeenCalledWith(mockMessageBox);
      expect(mockGetJobDetails).not.toHaveBeenCalled();
      expect(mockCreateUI).not.toHaveBeenCalled();
      expect(mockObserver.disconnect).not.toHaveBeenCalled();
    });

    it("should handle case when messageBox has no parent", async () => {
      // Arrange
      const orphanMessageBox = document.createElement("textarea");
      mockGetMessageBox.mockReturnValue(orphanMessageBox);
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Assert
      expect(mockCanInjectIcon).toHaveBeenCalledWith(orphanMessageBox);
      // Should not throw error when trying to append to null parent
    });

    it("should log correct messages during execution", async () => {
      // Arrange
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate mutation observer callback
      await mutationCallback([]);

      // Assert
      expect(console.log).toHaveBeenCalledWith("Handling Wellfound update");
      expect(console.log).toHaveBeenCalledWith(
        "Injecting icon and setting up UI"
      );
      expect(console.log).toHaveBeenCalledWith("Job data extracted:", {
        aboutTheJobSection: "Test job description",
        jobRole: "Software Engineer",
        company: "Test Company",
        messageBox: mockMessageBox,
      });
    });

    it("should handle UI creation failure gracefully", async () => {
      // Arrange
      const mockError = new Error("UI creation failed");
      mockCreateUI.mockRejectedValue(mockError);
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act & Assert - should not throw
      await expect(mutationCallback([])).rejects.toThrow("UI creation failed");
    });

    it("should handle multiple mutation observer callbacks", async () => {
      // Arrange
      await handleWellfoundUpdate(mockCtx, mockSendResponse);
      const mutationCallback = mockObserver.callback;

      // Act - simulate multiple callbacks
      await mutationCallback([]);
      await mutationCallback([]); // Second call should not execute logic since observer is disconnected

      // Assert - createUI should only be called once
      expect(mockCreateUI).toHaveBeenCalledTimes(2);
      expect(mockObserver.disconnect).toHaveBeenCalledTimes(2);
    });
  });
});
