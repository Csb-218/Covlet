import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import generateIcon from '~/assets/Frame.svg';
import type { ContentScriptContext } from "wxt/client";
import './styles.css'

let AboutTheJobSection: string;
let messageBox: HTMLElement;
let company: string;

export default defineContentScript({
  matches: ["*://*.linkedin.com/*", '*://*.wellfound.com/*'],
  cssInjectionMode: 'ui',
  runAt: 'document_start',

  async main(ctx) {
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      console.log(1);
      // message received
      if (request.message === "PageUpdated") {
        console.log(2);
        // icon initialization
        const img: HTMLImageElement = document.createElement('img');

        // img.className = 'w-10 h-10 float-right cursor-pointer'
        img.src = generateIcon;
        img.id = 'generateIcon';
        img.alt = 'generate icon';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.position = 'relative';
        img.style.bottom = '40px';
        img.style.cursor = 'pointer';

        img.onclick = () => {
          ui.mount();
        };

        // mutation observer
        const observer = new MutationObserver((mutations, observer) => {
          messageBox = document.getElementsByTagName("textarea")[0];

          if (messageBox?.parentElement?.childNodes?.length === 1) {
            // console.log(3)
            messageBox.parentElement?.appendChild(img);

            // Select the <h2> element that contains the text "About the job"
            const heading = Array.from(document.querySelectorAll('h2')).find(
              el => el.textContent?.trim() === "About the job"
            );

            AboutTheJobSection = heading?.parentNode?.textContent ? heading?.parentNode?.textContent : "";
            company = document.querySelector('h1')?.textContent?.trim() || "";

            // Stop observing once the element is found
            observer.disconnect();

            console.log('disconnected');
          }
        });

        observer.observe(document, {
          childList: true,
          subtree: true
        });

        // Send a response back
        sendResponse({
          status: "success",
          response: "message received"
        });

        return true;
      }
    });

    const ui = await createUi(ctx);
  }
});

function createUi(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "generative-text-editor-modal",
    position: "inline",
    anchor: "body",
    append: "first",
    onMount: (container) => {
      console.log('Mounting UI in shadow DOM');
      const wrapper = document.createElement("div");
      container.append(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(
        <App
          JD={AboutTheJobSection}
          messageBox={messageBox}
        />
      );
      return { root, wrapper };
    },
    onRemove: (elements) => {
      elements?.root.unmount();
      elements?.wrapper.remove();
    },
  });
}
