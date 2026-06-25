import type { MetadataRoute } from "next";

/**
 * PWA-lite manifest — makes the runner installable to a phone/iPad home screen
 * (standalone, dark chalkboard theme). No service worker / offline cache in this
 * thin slice; that can land later. Wired via Next's metadata route convention.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Open Programming",
    short_name: "OpenProg",
    description:
      "Adaptive CrossFit + wellness programming — show up, hit START, the screen takes over.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
