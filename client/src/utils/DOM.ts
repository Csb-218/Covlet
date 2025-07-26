export const getMessageBox = (): HTMLElement | null => {
  return document.getElementsByTagName("textarea")[0] || null;
};

export const getJobDetails = () => {
  // Select the <h2> element that contains the text "About the job"
  const heading = Array.from(document.querySelectorAll("h2")).find(
    (el) => el.textContent?.trim() === "About the job"
  );

  const aboutTheJobSection = heading?.parentNode?.textContent || "";

  const jobRoleDiv = document.querySelector('div[data-test="JobListingSlideIn"]');
  const jobRole = jobRoleDiv?.querySelector("h1")?.textContent?.trim() || "";
  const company = document.querySelector("h3")?.textContent?.trim() || "";

  return {
    aboutTheJobSection,
    jobRole,
    company
  };
};

export const canInjectIcon = (messageBox: HTMLElement | null): boolean => {
  return messageBox?.parentElement?.childNodes?.length === 1;
};