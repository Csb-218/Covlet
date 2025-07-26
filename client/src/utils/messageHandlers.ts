import { getMessageBox, getJobDetails, canInjectIcon } from "./DOM";
import { createUI, createMagicIcon, type JobData } from "./ui";
// @ts-ignore
import type { ContentScriptContext } from "wxt/client";

export const handleWellfoundUpdate = async (
  ctx: ContentScriptContext,
  sendResponse: (response: any) => void
) => {
  console.log("Handling Wellfound update");

  const magicIcon = createMagicIcon();
  let ui: any = null;

  const callback: MutationCallback = async (mutations: MutationRecord[]) => {
    const messageBox = getMessageBox();

    if (messageBox && canInjectIcon(messageBox)) {
      console.log("Injecting icon and setting up UI");
      
      messageBox.parentElement?.appendChild(magicIcon);
      
      const jobDetails = getJobDetails();
      
      const jobData: JobData = {
        ...jobDetails,
        messageBox
      };

      console.log("Job data extracted:", jobData);

      // Create UI
      ui = await createUI(ctx, jobData);

      // Set up icon click handler
      magicIcon.onclick = () => {
        ui?.mount();
      };

      // Disconnect observer after successful setup
      observer.disconnect();
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  sendResponse({
            status: "success",
            response: "message received",
  });
};