import { ChromeImpl } from "./chromeImpl.js";
import { FirefoxImpl } from "./firefoxImpl.js";

let browserImpl;

if (navigator.userAgent.includes("Chrome")) {
  browserImpl = ChromeImpl;
} else if (navigator.userAgent.includes("Firefox")) {
  browserImpl = FirefoxImpl;
} else {
  throw new Error("Unsupported browser");
}

function createElement(id, className, textContent = "") {
  let element = document.getElementById(id);

  if (!element) {
    element = document.createElement("div");
    element.id = id;
    element.className = className;
    element.textContent = textContent;
    document.body.appendChild(element);
  }

  return element;
}

function animateTitle() {
  const title = document.querySelector("h1");
  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    title.innerHTML = `Your document <a href="${url}">(link)</a> is being summarized${".".repeat(dots)}`;
  }, 500);
  return interval;
}

function createContentElement(data) {
  const container = document.createElement("div");

  // Title
  const title = document.createElement("h2");
  title.textContent = "Document Details";
  container.appendChild(title);

  // English Section
  const enSection = document.createElement("div");
  enSection.innerHTML = `
    <h3>English Version</h3>
    <p><strong>Title:</strong> ${data.en_title}</p>
    <p><strong>Description:</strong> ${data.en_description}</p>
  `;
  container.appendChild(enSection);

  // French Section
  const frSection = document.createElement("div");
  frSection.innerHTML = `
    <h3>French Version</h3>
    <p><strong>Title:</strong> ${data.fr_title}</p>
    <p><strong>Description:</strong> ${data.fr_description}</p>
  `;
  container.appendChild(frSection);

  // Author & Date
  const metaInfo = document.createElement("p");
  metaInfo.innerHTML = `
  <h3>General Informations</h3>
  <strong>Author:</strong> ${data.author} | <strong>Date:</strong> ${data.date}
  `;
  container.appendChild(metaInfo);

  // Classifiers - Wrapped in small "classifier" elements
  const classifierTitle = document.createElement("string");
  classifierTitle.textContent = "Classifiers:";
  container.appendChild(classifierTitle);

  if (data.classifiers.length) {
    const classifiersContainer = document.createElement("div");

    // margin 
    classifiersContainer.style.marginTop = "10px";
    classifiersContainer.style.marginBottom = "10px";

    data.classifiers.forEach((classifier) => {
      const classifierElement = document.createElement("span");
      classifierElement.className = "classifier";
      classifierElement.textContent = classifier;
      classifierElement.style.marginRight = "10px";
      classifierElement.style.marginBottom = "5px";
      classifierElement.style.padding = "5px 5px";
      classifierElement.style.borderRadius = "15px";
      classifierElement.style.backgroundColor = "#e0e0e0";
      classifierElement.style.fontSize = "12px";
      classifierElement.style.color = "#333";

      classifiersContainer.appendChild(classifierElement);
    });

    container.appendChild(classifiersContainer);
  }

  // Image Display - Horizontal Slots
  if (data.image_urls.length) {
    const imagesContainer = document.createElement("div");
    imagesContainer.style.display = "flex";
    imagesContainer.style.overflowX = "auto";
    imagesContainer.style.marginTop = "10px";

    data.image_urls.forEach((imageUrl) => {
      const imageSlot = document.createElement("div");
      imageSlot.style.width = "100px"; // fixed width for square image slots
      imageSlot.style.height = "100px"; // fixed height for square image slots
      imageSlot.style.marginRight = "10px"; // spacing between slots
      imageSlot.style.overflow = "hidden";
      imageSlot.style.borderRadius = "8px"; // rounded corners for slots

      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = "Article Image";
      image.style.width = "100%"; // fill the slot
      image.style.height = "100%"; // fill the slot
      image.style.objectFit = "cover"; // maintain aspect ratio within the square

      imageSlot.appendChild(image);
      imagesContainer.appendChild(imageSlot);
    });

    container.appendChild(imagesContainer);
  }

  // Source Link
  const link = document.createElement("p");
  link.innerHTML = `<a href="${data.url}" target="_blank">Read full article</a>`;
  container.appendChild(link);

  return container;
}

document.addEventListener("DOMContentLoaded", async function () {
  const errorText = createElement("errorText", "error", "An error occurred.");
  const successText = createElement(
    "successText",
    "success",
    "Page saved successfully!"
  );
  const loadingIcon = createElement("loadingIcon", "spinner");
  const urlDisplay = document.getElementById("urlDisplay");
  const title = document.querySelector("h1");

  const titleAnimation = animateTitle();

  const displayError = (message) => {
    clearInterval(titleAnimation);
    title.textContent = "An error occurred!";
    loadingIcon.style.display = "none";
    errorText.textContent = message;
    errorText.style.display = "block";
  };

  const handleSavePage = async () => {
    try {
      const data = await new Promise((resolve, reject) => {
        browserImpl.getFromStorage(["url", "body", "apiUrl"], (data) => {
          if (!data.apiUrl) {
            data.apiUrl = "http://localhost:8080"; // Default URL, should be replaced once we have the prod.
          }
          if (!data.url || !data.body) {
            reject("URL or body not found in storage.");
          } else {
            resolve(data);
          }
        });
      });

      const { url, body, apiUrl } = data;
      urlDisplay.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;

      const endpoint = "build";

      let encodedUrl = encodeURIComponent(window.location.href);
      const response = await fetch(`${apiUrl}/api/${endpoint}?url=${url}&redirect=${encodedUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        displayError("Failed to save the page.");
        const errorTextContent = await response.text();
        throw new Error("Failed to save the page: " + errorTextContent);
      }
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const responseData = await response.json();
      clearInterval(titleAnimation);
      title.textContent = "The summary is done!";
      successText.textContent = "Page saved successfully! About to redirect"; // The user should be redirected to the app page once the summary is ready.
      loadingIcon.style.display = "none";
      successText.style.display = "block";

      const contentContainer = createElement("content", "content");
      contentContainer.innerHTML = "";
      contentContainer.appendChild(createContentElement(responseData));
    } catch (error) {
      displayError(error.message);
    }
  };

  await handleSavePage();
});
