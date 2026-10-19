import { useStoryblokApi } from "@storyblok/astro";
import { serverLog } from "./server/debug";

export const deployEnv = import.meta.env.PUBLIC_DEPLOY_ENV ?? "production";
export const isDraft = deployEnv !== "production";

export function storyblokVersion(): "draft" | "published" {
  return isDraft ? "draft" : "published";
}

export function getStorySEO(story) {
  return {
    title: story.content.page_title,
    description: story.content.meta_description,
    ogImage: story.content.og_image?.filename,
    metaRobots: story.content.noindex,
    customStructuredData: story.content.custom_structured_data,
  };
}

export async function getStory(slug, options = {}) {
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
    version: storyblokVersion(),
    resolve_links: "url",
    resolve_relations: ["featured_blogs.blogs"],
    ...options,
  });

  return { story: data.story, seo: getStorySEO(data.story) };
}

// Lets a hand-coded page host Storyblok bloks.
export function createBlokSlots(body, label = "page") {
  const bloks = Array.isArray(body) ? body : [];
  const claimed = new Set();

  const matches = (blok, ref) =>
    typeof ref === "function"
      ? ref(blok)
      : blok._uid === ref || blok.component === ref;

  const available = () => bloks.filter((blok) => !claimed.has(blok._uid));

  function take(ref) {
    const blok = available().find((candidate) => matches(candidate, ref));
    if (blok) claimed.add(blok._uid);
    return blok;
  }

  function takeAll(ref) {
    const found = available().filter((candidate) => matches(candidate, ref));
    found.forEach((blok) => claimed.add(blok._uid));
    return found;
  }

  function replaces(ref) {
    return takeAll(ref).length > 0;
  }

  function rest() {
    const remaining = available();
    serverLog(
      `${label}: storyblok bloks ->`,
      `placed/skipped ${claimed.size},`,
      `auto-rendered ${remaining.length}`,
      remaining.map((blok) => `${blok.component}#${blok._uid}`),
    );
    return remaining;
  }

  return { take, takeAll, replaces, rest };
}
