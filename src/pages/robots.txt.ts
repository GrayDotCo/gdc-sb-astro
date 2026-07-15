import type { APIRoute } from "astro";

const prodRobots = `User-agent: *
Disallow: /cdn-fpw/*
Disallow: /cdn-cgi/*
Disallow: /_vercel/insights/*
Allow: /

Sitemap: ${import.meta.env.SITE}/sitemap-index.xml
`;

const devRobots = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = ({ url }) => {
  const isMainDomain = url.hostname === "thegray.company" &&
    process.env.VERCEL_ENV === "production";

  return new Response(isMainDomain ? prodRobots : devRobots, {
    headers: { "Content-Type": "text/plain" },
  });
};
