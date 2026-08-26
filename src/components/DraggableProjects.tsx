import { useState, useRef, useEffect, useCallback } from "react";

interface Project {
  title: string;
  slug: string;
  image?: string;
  tags?: string[];
  width: number;
  height: number;
}

interface Props {
  projects: Project[];
}

export default function DraggableProjects({ projects }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zIndexCounter = useRef(100);
  const [panels, setPanels] = useState<
    {
      id: number;
      x: number;
      y: number;
      z: number;
      w: number;
      h: number;
      rotation: number;
      targetX: number;
      targetY: number;
      opacity: number;
    }[]
  >(() =>
    projects.map((p, i) => ({
      id: i,
      x: 10 + (i * 18) % 50,
      y: 12 + (i * 14) % 40,
      z: 100 + i,
      w: p.width,
      h: p.height,
      rotation: 0,
      targetX: 10 + (i * 18) % 50,
      targetY: 12 + (i * 14) % 40,
      opacity: 1,
    }))
  );
  const dragRef = useRef<{
    id: number;
    pointerId: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    started: boolean;
  } | null>(null);
  const didDragRef = useRef(false);
  const animatingRef = useRef(false);

  const scatter = useCallback(() => {
    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    const rect = containerRef.current?.getBoundingClientRect();
    const cw = rect && rect.width > 50 ? rect.width : vw;
    const ch = rect && rect.height > 50 ? rect.height : vh * 0.85;
    zIndexCounter.current = 100;

    // Step 1: set panels to off-screen start positions (hidden)
    const scattered = projects.map((p, i) => {
      const maxX = Math.max(0, 100 - (p.width / cw) * 100 - 2);
      const maxY = Math.max(0, 100 - (p.height / ch) * 100 - 2);
      const targetX = 2 + Math.random() * Math.min(maxX, 55);
      const targetY = 2 + Math.random() * Math.min(maxY, 55);

      // Random off-screen start position (top, bottom, left, or right)
      const side = Math.floor(Math.random() * 4);
      let startX: number, startY: number;
      if (side === 0) { startX = targetX; startY = -30; } // from top
      else if (side === 1) { startX = targetX; startY = 110; } // from bottom
      else if (side === 2) { startX = -30; startY = targetY; } // from left
      else { startX = 110; startY = targetY; } // from right

      return {
        id: i,
        x: startX,
        y: startY,
        z: zIndexCounter.current++,
        w: p.width,
        h: p.height,
        rotation: (Math.random() - 0.5) * 12, // -6 to 6 degrees
        targetX,
        targetY,
        opacity: 0,
      };
    });
    setPanels(scattered);

    // Step 2: animate to final positions with stagger
    animatingRef.current = true;
    scattered.forEach((panel, i) => {
      setTimeout(() => {
        setPanels(prev => prev.map(p =>
          p.id === panel.id
            ? { ...p, x: panel.targetX, y: panel.targetY, rotation: 0, opacity: 1 }
            : p
        ));
        // last panel done → disable transitions for instant drag
        if (i === scattered.length - 1) {
          animatingRef.current = false;
        }
      }, 80 + i * 100);
    });
  }, [projects]);

  useEffect(() => {
    const id = requestAnimationFrame(() => scatter());
    return () => cancelAnimationFrame(id);
  }, [scatter]);

  useEffect(() => {
    const onOpen = () => requestAnimationFrame(() => scatter());
    window.addEventListener("projects-open", onOpen);
    window.addEventListener("resize", onOpen);
    if (document.getElementById("projects-overlay")?.classList.contains("open")) {
      onOpen();
    }
    return () => {
      window.removeEventListener("projects-open", onOpen);
      window.removeEventListener("resize", onOpen);
    };
  }, [scatter]);

  const bringToFront = useCallback((id: number) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, z: ++zIndexCounter.current } : p
      )
    );
  }, []);

  const endDrag = useCallback(() => {
    if (dragRef.current?.started) {
      didDragRef.current = true;
      // clear after click event has had time to fire
      window.setTimeout(() => {
        didDragRef.current = false;
      }, 80);
    }
    document.body.style.cursor = "";
    dragRef.current = null;
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const d = dragRef.current;

    // drag threshold: 6px before starting
    if (!d.started) {
      if (Math.abs(e.clientX - d.startX) < 6 && Math.abs(e.clientY - d.startY) < 6) return;
      d.started = true;
      didDragRef.current = true;
      document.body.style.cursor = "grabbing";
    }

    const { id, offsetX, offsetY } = d;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - containerRect.left - offsetX) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top - offsetY) / containerRect.height) * 100;
    setPanels((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, x: Math.max(0, Math.min(x, 100 - (p.w / containerRect.width) * 100)), y: Math.max(0, Math.min(y, 100 - (p.h / containerRect.height) * 100)) }
          : p
      )
    );
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return;
    endDrag();
  }, [endDrag]);

  const onPointerCancel = useCallback(() => {
    if (!dragRef.current) return;
    endDrag();
  }, [endDrag]);

  // Global listeners so drag works outside panels and always cleans up
  useEffect(() => {
    const onWindowBlur = () => {
      document.body.style.cursor = "";
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onWindowBlur);
      // cleanup: release cursor on unmount
      document.body.style.cursor = "";
    };
  }, [onPointerMove, onPointerUp, onPointerCancel]);

  const onPanelPointerDown = useCallback(
    (e: React.PointerEvent, id: number) => {
      // don't hijack right-click or ctrl/shift clicks
      if (e.button !== 0 || e.ctrlKey || e.shiftKey || e.metaKey) return;
      const panelEl = e.currentTarget as HTMLElement;
      const rect = panelEl.getBoundingClientRect();
      if (!rect) return;
      bringToFront(id);
      // capture pointer so move/up always reach us even if the cursor
      // leaves the window mid-drag (prevents the "stuck" grab cursor)
      try {
        panelEl.setPointerCapture(e.pointerId);
      } catch {}
      dragRef.current = {
        id,
        pointerId: e.pointerId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        startX: e.clientX,
        startY: e.clientY,
        started: false,
      };
    },
    [bringToFront]
  );

  return (
    <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", minHeight: "85vh", overflow: "hidden", paddingTop: "var(--nav-height)" }} ref={containerRef}>
      {panels.map((panel) => {
        const p = projects[panel.id];
        return (
          <div
            key={panel.id}
            id={`dp-panel-${panel.id}`}
            className="dp-panel"
            onClick={() => bringToFront(panel.id)}
            role="article"
            aria-label={`Project: ${p.title}`}
            style={{
              position: "absolute",
              left: `${panel.x}%`,
              top: `${panel.y}%`,
              width: `${panel.w}px`,
              height: `${panel.h}px`,
              zIndex: panel.z,
              cursor: "grab",
              userSelect: "none",
              touchAction: "none",
              opacity: panel.opacity,
              transform: `rotate(${panel.rotation}deg)`,
              transition: animatingRef.current
                ? "left 0.5s cubic-bezier(0.34,1.56,0.64,1), top 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)"
                : "none",
            }}
          >
            {/* Window chrome */}
            <div
              onPointerDown={(e) => onPanelPointerDown(e, panel.id)}
              style={{
                height: "17px",
                background: "#252525",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                paddingLeft: "10px",
                gap: "5px",
                flexShrink: 0,
                cursor: "grab",
                touchAction: "none",
                userSelect: "none",
              }}>
              {[0, 1, 2].map((j) => (
                <span key={j} style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "#252525",
                  flexShrink: 0,
                }} />
              ))}
              <span style={{
                marginLeft: "8px",
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 700,
                flex: 1,
                color: "rgba(255,255,255,0.7)",
              }}>
                {p.title}
              </span>
            </div>
            {/* Content area — clickable link (or static if no slug) */}
            <a
              href={p.slug ? `/projects/${p.slug}` : undefined}
              draggable={false}
              onPointerDown={(e) => onPanelPointerDown(e, panel.id)}
              onClick={(e) => {
                if (!p.slug) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (didDragRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  didDragRef.current = false;
                  return;
                }
                e.stopPropagation();
              }}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                height: `calc(100% - 17px)`,
                border: "1px solid rgba(255,255,255,0.12)",
                borderTop: "none",
                overflow: "hidden",
                position: "relative",
                touchAction: "none",
              }}
            >
              {p.image ? (
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: `url(${p.image}) center/cover no-repeat`,
                  filter: "grayscale(1)",
                  transition: "filter 0.4s ease",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(1)")}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "#E8DCC8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "clamp(0.6rem, 1vw, 0.85rem)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#1A1207",
                  opacity: 0.6,
                  textAlign: "center",
                  padding: "1em",
                }}>
                  {p.title}
                </div>
              )}
              {p.tags && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "6px 8px",
                  background: "rgba(26,18,7,0.7)",
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                }}>
                  {p.tags.map((t) => (
                    <span key={t} style={{
                      fontSize: "0.6rem",
                      fontFamily: "'Space Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#FFF8EE",
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </a>
          </div>
        );
      })}
    </div>
  );
}
