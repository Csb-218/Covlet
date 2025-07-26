import ReactDOM from "react-dom/client";
// @ts-ignore
import type { ContentScriptContext } from "wxt/client";
import App from "../entrypoints/content/App";

export interface JobData {
  aboutTheJobSection: string;
  jobRole: string;
  company: string;
  messageBox: HTMLElement;
}

export const createUI = (ctx: ContentScriptContext, jobData: JobData) => {
  return createShadowRootUi(ctx, {
    name: "generative-text-editor-modal",
    position: "inline",
    anchor: "body", 
    append: "first",
    onMount: (container) => {
      console.log("Mounting UI in shadow DOM");
      const wrapper = document.createElement("div");
      container.append(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(
        <App
          JD={jobData.aboutTheJobSection}
          jobRole={jobData.jobRole}
          company={jobData.company}
          messageBox={jobData.messageBox}
        />
      );
      return { root, wrapper };
    },
    onRemove: (elements) => {
      elements?.root.unmount();
      elements?.wrapper.remove();
    },
  });
};

export const createMagicIcon = (): HTMLElement => {
  const icon = document.createElement("div");
  icon.innerHTML = "🪄"; // or your custom icon
  icon.style.cursor = "pointer";
  icon.style.display = "inline-block";
  icon.style.marginLeft = "8px";
  return icon;
};