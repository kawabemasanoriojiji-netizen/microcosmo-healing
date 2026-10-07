import { readFile, writeFile } from "node:fs/promises";

const channelVideosUrl = "https://www.youtube.com/@%E3%82%AA%E3%82%B8%E3%82%B8-q3n/videos";
const pagePath = new URL("../index.html", import.meta.url);
const startMarker = "      <!-- YOUTUBE_VIDEOS_START -->";
const endMarker = "      <!-- YOUTUBE_VIDEOS_END -->";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
}

const channelPage = await fetch(channelVideosUrl, {
  headers: { "User-Agent": "Mozilla/5.0" },
});
if (!channelPage.ok) {
  throw new Error(`Could not load YouTube channel (${channelPage.status}).`);
}

const channelHtml = await channelPage.text();
const videoIds = [...new Set([...channelHtml.matchAll(/"videoId":"([\w-]{11})"/g)].map((match) => match[1]))].slice(0, 3);

if (videoIds.length !== 3) {
  throw new Error("Could not identify the latest three YouTube videos.");
}

const videos = await Promise.all(videoIds.map(async (id) => {
  const data = await fetchJson(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
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
await writeFile(pagePath, updatedPage);
