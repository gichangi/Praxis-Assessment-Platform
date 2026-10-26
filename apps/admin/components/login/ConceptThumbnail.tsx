"use client";

import { useEffect, useRef, useState } from "react";
import type { LoginDesign } from "./designs";

export function ConceptThumbnail({ design, name }: { design: LoginDesign; name: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1280));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={container} className="concept-thumbnail" aria-hidden="true">
      <iframe
        title={`${name} preview`}
        src={`/login/designs/${design}?thumbnail=1`}
        loading="lazy"
        tabIndex={-1}
        style={{ width: 1280, height: 800, transform: `scale(${scale})` }}
      />
    </div>
  );
}
