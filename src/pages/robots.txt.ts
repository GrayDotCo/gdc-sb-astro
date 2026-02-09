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

export const GET: APIRoute = () => {
  const isMainDomain = import.meta.env.SITE?.includes("thegray.company") &&
    !import.meta.env.SITE?.includes("dev.thegray.company");

  return new Response(isMainDomain ? prodRobots : devRobots, {
    headers: { "Content-Type": "text/plain" },
  });
};
