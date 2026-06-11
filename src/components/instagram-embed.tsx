"use client";

import { useEffect } from "react";

interface Props {
  url: string;
}

export function InstagramEmbed({ url }: Props) {
  useEffect(() => {
    const win = window as Window & {
      instgrm?: { Embeds: { process: () => void } };
    };
    if (win.instgrm) {
      win.instgrm.Embeds.process();
    } else if (!document.getElementById("ig-embed-js")) {
      const s = document.createElement("script");
      s.id = "ig-embed-js";
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [url]);

  return (
    <div className="flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ maxWidth: 540, width: "calc(100% - 2px)", minWidth: 0, margin: "0 auto" }}
      />
    </div>
  );
}
