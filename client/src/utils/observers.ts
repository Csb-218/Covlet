import { magicIcon } from "@/assets/index.ts";
let AboutTheJobSection: string;
let messageBox: HTMLElement;
let company: string;

// Mutation callback
const callback: MutationCallback = (
  mutations: MutationRecord[],
  observer: MutationObserver
) => {
  // message box
  messageBox = document.getElementsByTagName("textarea")[0];

  if (messageBox?.parentElement?.childNodes?.length === 1) {
    // console.log(3)
    messageBox.parentElement?.appendChild(magicIcon);
    // Select the <h2> element that contains the text "About the job"
    const heading = Array.from(document.querySelectorAll("h2")).find(
      (el) => el.textContent?.trim() === "About the job"
    );

    AboutTheJobSection = heading?.parentNode?.textContent
      ? heading?.parentNode?.textContent
      : "";
    company = document.querySelector("h1")?.textContent?.trim() || "";

    // Stop observing once the element is found
    observer.disconnect();

    console.log("disconnected");
  }
};
// mutation observer
export const WellFoundObserver: MutationObserver = new MutationObserver(callback);

export function textAreaFinder(){
   messageBox = document.getElementsByTagName("textarea")[0];

  if (messageBox?.parentElement?.childNodes?.length === 1) {
    // console.log(3)
    messageBox.parentElement?.appendChild(magicIcon);
    // Select the <h2> element that contains the text "About the job"
    const heading = Array.from(document.querySelectorAll("h2")).find(
      (el) => el.textContent?.trim() === "About the job"
    );

    AboutTheJobSection = heading?.parentNode?.textContent
      ? heading?.parentNode?.textContent
      : "";
    company = document.querySelector("h1")?.textContent?.trim() || "";
  }
}
