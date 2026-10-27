import {
  B as jsx,
  pe as useRef,
  ue as useEffect,
  ye as useState,
  init_jsx_runtime,
  init_npm_react_18_2,
} from "/framerusercontent.com/sites/1TnLMRKXnoaeyMYClWUga/react.CIS0Sdlv.mjs";
import { longFormProjects } from "./long-form-projects.js";
import ProjectVideoPreview from "./project-video-preview.js";

init_npm_react_18_2();
init_jsx_runtime();

export const projectCategories = [
  {
    id: "minimal",
    title: "Minimal",
    videos: [
      ["jayzee_metaman_ad.mp4", "Perfume brand edit"],
      ["jayzee_kl_rahul_1.mp4", "Skincare product edit"],
      ["jayzee_kl_rahul_2.mp4", "Product campaign edit"],
      ["jayzee_metamen_perfume.mp4", "Minimal motion graphics edit"],
    ],
  },
  {
    id: "talking-head",
    title: "Talking Head",
    videos: [
      ["jayzee_short_minimal_1.mp4", "Creator storytelling edit"],
      ["jayzee_short_minimal_2.mp4", "Creator social media edit"],
    ],
  },
  {
    id: "long-form",
    title: "Long Form",
    landscape: true,
    videos: [["jayzee_vsl_edit.mp4", "Long form editing excerpt"]],
    youtubeProjects: longFormProjects,
  },
];

function youtubeProjectCard(project) {
  return jsx(ProjectVideoPreview, { key: project.id, project });
}

export default function ProjectGallery() {
  const [layout, setLayout] = useState("grid");
  const galleryRef = useRef(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    const videos = gallery.querySelectorAll("video:not([data-project-preview])");
    const handleVolumeChange = ({ target }) => {
      if (target.tagName !== "VIDEO" || target.muted || target.volume === 0) return;
      gallery.querySelectorAll("video").forEach((video) => {
        if (video !== target) video.muted = true;
      });
    };
    gallery.addEventListener("volumechange", handleVolumeChange, true);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      });
    }, { threshold: 0.1 });
    videos.forEach((video) => observer.observe(video));
    return () => {
      observer.disconnect();
      gallery.removeEventListener("volumechange", handleVolumeChange, true);
    };
  }, []);

  return jsx("div", {
    className: "project-gallery",
    "data-layout": layout,
    ref: galleryRef,
    children: [
      jsx("header", {
        className: "project-gallery-header",
        children: [
          jsx("h2", { children: "Featured Projects" }),
          jsx("div", {
            className: "project-layout-switch",
            "aria-label": "Video layout",
            children: ["grid", "list"].map((mode) => jsx("button", {
              key: mode,
              type: "button",
              "aria-pressed": layout === mode,
              onClick: () => setLayout(mode),
              children: mode === "grid" ? "Grid" : "List",
            })),
          }),
        ],
      }),
      ...projectCategories.map((category, index) => jsx("section", {
        key: category.id,
        id: "projects-" + category.id,
        className: "project-category" + (category.landscape ? " project-category--landscape" : ""),
        "aria-labelledby": "projects-" + category.id + "-title",
        children: [
          jsx("header", {
            className: "project-category-header",
            children: [
              jsx("span", { className: "project-category-index", "aria-hidden": true, children: String(index + 1).padStart(2, "0") }),
              jsx("h3", { id: "projects-" + category.id + "-title", children: category.title }),
            ],
          }),
          jsx("div", {
            className: "project-category-grid",
            children: category.videos.map(([file, label]) => jsx("div", {
              key: file,
              className: "project-video-card" + (category.landscape ? " project-video-card--landscape" : ""),
              children: jsx("video", {
                src: "/framerusercontent.com/assets/" + file,
                "aria-label": label,
                controls: true,
                autoPlay: true,
                loop: true,
                muted: true,
                playsInline: true,
                preload: "metadata",
              }),
            })),
          }),
          category.youtubeProjects && jsx("div", {
            className: "project-category-grid project-category-grid--youtube",
            children: category.youtubeProjects.map(youtubeProjectCard),
          }),
          category.youtubeProjects && jsx("p", {
            className: "project-views-note",
            children: "View counts as of 27 Oct 2026.",
          }),
        ],
      })),
    ],
  });
}
