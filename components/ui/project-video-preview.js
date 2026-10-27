import {
  B as jsx, pe as useRef, ue as useEffect, ye as useState,
  init_jsx_runtime, init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";

init_npm_react_18_2();
init_jsx_runtime();

export default function ProjectVideoPreview({ project }) {
  const videoRef = useRef(null);
  const visibleRef = useRef(false);
  const systemPauseRef = useRef(false);
  const userPausedRef = useRef(false);
  const [load, setLoad] = useState(false);
  const [state, setState] = useState("idle");
  const start = project.previewStart || 0;
  const timestamp = Math.floor(start / 60) + ":" + String(start % 60).padStart(2, "0");

  function play() {
    const video = videoRef.current;
    if (!video?.getAttribute("src")) return;
    video.play().catch((error) => {
      if (error.name === "NotAllowedError" && visibleRef.current) setState("blocked");
    });
  }

  function pause() {
    const video = videoRef.current;
    if (video && !video.paused) {
      systemPauseRef.current = true;
      video.pause();
    }
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function syncPlayback() {
      if (visibleRef.current && !document.hidden) {
        if (!reducedMotion && !userPausedRef.current) play();
      } else pause();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.45;
      if (visibleRef.current) setLoad(true);
      syncPlayback();
    }, { threshold: [0, 0.45] });
    observer.observe(videoRef.current);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      pause();
    };
  }, []);

  useEffect(() => {
    if (load && visibleRef.current && !document.hidden &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) play();
  }, [load]);

  return jsx("article", {
    className: "project-youtube-card", "data-playback": state,
    children: [
      jsx("div", {
        className: "project-youtube-thumbnail",
        children: jsx("video", {
          ref: videoRef, "data-project-preview": project.id,
          src: load ? project.previewSrc : undefined,
          poster: project.previewPoster || project.thumbnail,
          "aria-label": project.author + " — " + project.previewDuration + " second editing preview from " + timestamp,
          controls: true, loop: true, muted: true, playsInline: true, preload: "none",
          onPlaying: () => {
            userPausedRef.current = false;
            systemPauseRef.current = false;
            setState("playing");
            if (!visibleRef.current || document.hidden) pause();
          },
          onPause: () => {
            if (!systemPauseRef.current && visibleRef.current && !document.hidden) userPausedRef.current = true;
            systemPauseRef.current = false;
            setState("paused");
          },
          onWaiting: () => setState("buffering"),
          onError: () => setState("error"),
        }),
      }),
      jsx("div", {
        className: "project-youtube-body",
        children: [
          jsx("p", { className: "project-youtube-client", children: project.author + " · Full video " + project.duration }),
          jsx("h4", { children: project.title }),
          jsx("div", { className: "project-youtube-footer", children: [
            jsx("span", { className: "project-youtube-views", children: project.views.toLocaleString("en-US") + " views" }),
            jsx("a", { className: "project-youtube-action", href: project.url, target: "_blank", rel: "noopener noreferrer", children: "Watch full video ↗" }),
          ] }),
        ],
      }),
    ],
  });
}
