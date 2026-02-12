import { storyblok } from "@storyblok/astro";
import { loadEnv } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";
import { serverLog } from "./src/lib/server/debug";

// PUBLIC_DEPLOY_ENV should be one of: development, preview, production.
const mode = process.env.NODE_ENV ?? (process.argv.includes("dev") ? "development" : "production");
const env = loadEnv(mode, process.cwd(), ["STORYBLOK", "PUBLIC"]);

const deployEnv =
  env.PUBLIC_DEPLOY_ENV ??
  mode;

const siteUrl =
  env.PUBLIC_SITE_URL ??
  (deployEnv === "development"
    ? "https://dev.thegray.company"
    : "https://thegray.company");


serverLog('PUBLIC_DEPLOY_ENV:', env.PUBLIC_DEPLOY_ENV);
serverLog('deployEnv:', deployEnv);

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [storyblok({
    accessToken: env.STORYBLOK_TOKEN,
    apiOptions: {
      region: "us",
    },
    bridge: deployEnv !== "production",
    resolveLinks: "url",
    components: {
      author: "storyblok/Author",
      blog: "storyblok/Blog",
      bloglist: "storyblok/BlogList",
      carousel: "storyblok/Carousel",
      childhero: "storyblok/ChildHero",
      config: "storyblok/Config",
      embed: "storyblok/Embed",
      featured_blogs: "storyblok/FeaturedBlogs",
      fourup: "storyblok/FourUp",
      hero: "storyblok/Hero",
      iconcard: "storyblok/IconCard",
      image: "storyblok/Image",
      leftright: "storyblok/LeftRight",
      listitem: "storyblok/Listitem",
      liststack: "storyblok/Liststack",
      page: "storyblok/Page",
      quote: "storyblok/Quote",
      quotes: "storyblok/Quotes",
      sidebyside: "storyblok/SideBySide",
      testimonial: "storyblok/Testimonial",
      testimonials: "storyblok/Testimonials",
      textblock: "storyblok/Textblock",
      threecolumn: "storyblok/ThreeColumn",
      video: "storyblok/Video",
      wysiwyg: "storyblok/Wysiwyg",
    }
  })
],
  vite: {
    optimizeDeps: { exclude: ["fsevents"] },
    plugins: [basicSsl()],
    server: {
      https: true,
    },
  },
  build: {
    format: 'directory'
  },
  trailingSlash: 'never',
  output: deployEnv === "production"
    ? "static"
    : "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true, // Optional: enables Vercel's analytics tracking
    },
  }),
});
