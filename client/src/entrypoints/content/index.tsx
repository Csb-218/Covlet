import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { magicIcon } from "@/assets/index.ts";
// import { wellfoundObserver } from "@/utils/observers.ts";
// @ts-ignore
import type { ContentScriptContext } from "wxt/client";
import "./styles.css";
import {handleWellfoundUpdate} from "../../utils/messageHandlers.ts"

export default defineContentScript({
  matches: ["*://*.linkedin.com/*", "*://*.wellfound.com/*"],
  cssInjectionMode: "ui",
  runAt: "document_end",

  async main(ctx: ContentScriptContext) {
    // Wellfound Listener
       chrome.runtime.onMessage.addListener(
      async (request, sender, sendResponse) => {
        console.log("Message received:", request.message);

        try {
          switch (request.message) {
            case "PageUpdatedWellFound":
              await handleWellfoundUpdate(ctx, sendResponse);
              break;
              
            default:
              sendResponse({
                status: "error",
                response: "Unknown message type",
              });
          }
        } catch (error) {
          console.error("Error handling message:", error);
          sendResponse({
            status: "error",
            response: error
          });
        }

        return true; // Keep message channel open for async response
      }
    )
  },
});
