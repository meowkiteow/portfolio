const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'wondermake.xyz', 'api.html');
const apiData = JSON.parse(fs.readFileSync(apiPath, 'utf8'));

// 1. Remove "Long Form" from all existing projects
apiData.data.posts.forEach(post => {
  if (post['content.details']) {
    if (Array.isArray(post['content.details'].categories)) {
      post['content.details'].categories = post['content.details'].categories.filter(c => c !== 'Long Form');
    }
    if (post['content.details'].project && post['content.details'].project.categories) {
      if (Array.isArray(post['content.details'].project.categories.value)) {
        post['content.details'].project.categories.value = post['content.details'].project.categories.value.filter(c => c !== 'Long Form');
      }
    }
  }
});

// Remove existing ai-branding-workflow if already there
apiData.data.posts = apiData.data.posts.filter(p => p.id !== 'ai-branding-workflow' && p.permalink?.slug !== 'ai-branding-workflow');

// 2. Add AI Branding Workflow
const aiBrandingPost = {
  id: "ai-branding-workflow",
  title: "AI Branding Workflow",
  permalink: {
    path: "/work/ai-branding-workflow",
    slug: "ai-branding-workflow",
    parent: "",
    base: "work",
    frontpage: false
  },
  "content.details": {
    alias: "AI Branding Workflow",
    categories: ["Long Form"],
    description: "AI Branding Workflow: How to Create a Brand Identity with AI",
    intro: "A comprehensive, high-retention long-form video exploring AI-driven brand identity synthesis, creative direction, and seamless video storytelling.",
    youtube: "https://youtu.be/zcv-ukngMV8",
    media: {
      id: "yt-ai-branding-workflow",
      extention: "jpg",
      text: "AI Branding Workflow",
      src: "/uploads/yt-ai-branding-workflow.jpg"
    },
    hero: {
      id: "yt-ai-branding-workflow",
      extention: "jpg",
      text: "AI Branding Workflow",
      src: "/uploads/yt-ai-branding-workflow.jpg"
    },
    link: {
      text: "Watch on YouTube",
      path: "https://youtu.be/zcv-ukngMV8",
      id: false,
      external: true,
      post_type: false
    },
    project: {
      block_key: "project",
      block_type: "project",
      alias: {
        field_type: "text_small",
        value: "AI Branding Workflow"
      },
      categories: {
        field_type: "select",
        value: ["Long Form"]
      },
      description: {
        field_type: "paragraph",
        value: "AI Branding Workflow: How to Create a Brand Identity with AI"
      },
      intro: {
        field_type: "paragraph",
        value: "A comprehensive, high-retention long-form video exploring AI-driven brand identity synthesis, creative direction, and seamless video storytelling."
      },
      media: {
        field_type: "media",
        value: {
          id: "yt-ai-branding-workflow",
          extention: "jpg",
          text: "AI Branding Workflow",
          src: "/uploads/yt-ai-branding-workflow.jpg"
        }
      },
      hero: {
        field_type: "media",
        value: {
          id: "yt-ai-branding-workflow",
          extention: "jpg",
          text: "AI Branding Workflow",
          src: "/uploads/yt-ai-branding-workflow.jpg"
        }
      },
      link: {
        field_type: "link",
        value: {
          text: "Watch on YouTube",
          path: "https://youtu.be/zcv-ukngMV8",
          id: false,
          external: true,
          post_type: false
        }
      }
    }
  }
};

// Add to beginning of posts array
apiData.data.posts.unshift(aiBrandingPost);

fs.writeFileSync(apiPath, JSON.stringify(apiData, null, 2), 'utf8');
console.log('Successfully updated api.html with AI Branding Workflow as only Long Form project!');
