import { readFile, writeFile } from "node:fs/promises";

// Keep this page URL (rather than the page source cached by a third party) as the
// source of truth.  The videos tab is ordered newest first.
const channelVideosUrl = "https://www.youtube.com/@%E3%82%AA%E3%82%B8%E3%82%B8-q3n/videos";
const pagePath = new URL("../index.html", import.meta.url);
const startMarker = "      <!-- YOUTUBE_VIDEOS_START -->";
const endMarker = "      <!-- YOUTUBE_VIDEOS_END -->";
const requestHeaders = { "User-Agent": "Mozilla/5.0 (compatible; MicrocosmoHealingBot/1.0)" };

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

async function fetchWithRetry(url, responseType) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status}): ${url}`);
      }
      return responseType === "json" ? response.json() : response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
      }
    }
  }
  throw lastError;
}

const channelHtml = await fetchWithRetry(channelVideosUrl, "text");
const videoIds = [...new Set([...channelHtml.matchAll(/"videoId":"([\w-]{11})"/g)].map((match) => match[1]))].slice(0, 3);

if (videoIds.length !== 3) {
  throw new Error("Could not identify the latest three YouTube videos.");
}

const videos = await Promise.all(videoIds.map(async (id) => {
  const data = await fetchWithRetry(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, "json");
  return { id, title: data.title.normalize("NFC") };
}));

const cards = videos.map(({ id, title }) => {
  const safeTitle = escapeHtml(title);
  return [
    `      <a class="latest-video-card" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer" aria-label="${safeTitle}をYouTubeで開く">`,
    `        <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${safeTitle}" loading="lazy">`,
    `        <span>${safeTitle}</span>`,
    "      </a>",
  ].join("\n");
}).join("\n");

const page = await readFile(pagePath, "utf8");
const start = page.indexOf(startMarker);
const end = page.indexOf(endMarker);
if (start === -1 || end === -1 || end <= start) {
  throw new Error("YouTube video markers were not found in index.html.");
}

const updatedPage = `${page.slice(0, start + startMarker.length)}\n${cards}\n${page.slice(end)}`;
if (updatedPage !== page) {
  await writeFile(pagePath, updatedPage);
  console.log(`Updated latest YouTube videos: ${videoIds.join(", ")}`);
} else {
  console.log("Latest YouTube videos are already up to date.");
}
