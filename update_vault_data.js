const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, 'wondermake.xyz');
const POSTS_DIR = path.join(ROOT_DIR, 'api', 'posts');
const API_FILE = path.join(ROOT_DIR, 'api.html');

const vaultData = [
  {
    pad: '01',
    id: 'insp-vault-01',
    title: 'Market Meltdown',
    alias: 'Market Meltdown',
    categories: ['Motion Graphics', 'Finance'],
    description: 'Dynamic animated market crash trajectory with downward dipping trendlines and kinetic currency accents over studio footage.',
    intro: 'Showcasing high-retention financial motion graphics, downward vector physics, and custom sound design designed to illustrate economic trends with punchy visual storytelling.'
  },
  {
    pad: '02',
    id: 'insp-vault-02',
    title: 'Studio Podcast',
    alias: 'Studio Podcast',
    categories: ['Long Form', 'YouTube'],
    description: 'High-energy podcast cut with studio neon lighting, kinetic word-by-word subtitles, and seamless audio-visual pacing.',
    intro: 'Multi-camera podcast editing built for retention. Featuring ambient lighting balance, frame-by-frame subtitle choreography, and rhythmic pacing that keeps viewers glued to the conversation.'
  },
  {
    pad: '03',
    id: 'insp-vault-03',
    title: 'Monk Mode',
    alias: 'Monk Mode',
    categories: ['Short Form', 'Kinetic Type'],
    description: 'Minimalist dark topographic aesthetic featuring silhouette line art and punchy kinetic typography engineered for high watch-time.',
    intro: 'Viral short-form editing that pairs philosophical depth with clean, tactile kinetic typography and animated meditation vectors designed to maximize completion rates on Shorts and Reels.'
  },
  {
    pad: '04',
    id: 'insp-vault-04',
    title: 'Web3 Mindset',
    alias: 'Web3 Mindset',
    categories: ['Motion Graphics', 'Vlog'],
    description: 'Dynamic lifestyle vlog edit integrating 3D floating crypto tokens, neon trajectory arrows, and retention callouts.',
    intro: 'Blending high-end lifestyle vlogging with Web3 motion graphics. Featuring 3D Ethereum crystal assets, animated trend curves, and snappy visual emphasis on key conversational beats.'
  },
  {
    pad: '05',
    id: 'insp-vault-05',
    title: 'Late Night Desk',
    alias: 'Late Night Desk',
    categories: ['2D Animation', 'Storytelling'],
    description: 'Hand-crafted 2D vector workspace animation with ambient lighting sweeps, floating particulate physics, and narrative depth.',
    intro: 'Atmospheric 2D animation illustrating late-night creative flow. Features custom vector illustration, realistic monitor glow passes, particle dust simulation, and cinematic lighting sweeps.'
  },
  {
    pad: '06',
    id: 'insp-vault-06',
    title: 'Expertise Ident',
    alias: 'Expertise Ident',
    categories: ['Commercial', 'Corporate'],
    description: 'Studio interview edit with high-contrast motion graphics, verified authority badges, and polished color grading.',
    intro: 'Clean, authoritative corporate video editing. Combines broadcast-tier color grading with punchy green-check verified badges and typography overlays that reinforce speaker credibility.'
  },
  {
    pad: '07',
    id: 'insp-vault-07',
    title: 'Growth Pathway',
    alias: 'Growth Pathway',
    categories: ['Explainer', 'Motion Design'],
    description: 'Node-based horizontal infographic timeline with custom motion tracks, circular subject cutouts, and kinetic pacing.',
    intro: 'An interactive infographic timeline animation mapping step-by-step milestones with vibrant yellow vector trails, circular photographic nodes, and clear visual hierarchy.'
  },
  {
    pad: '08',
    id: 'insp-vault-08',
    title: 'Attention Economy',
    alias: 'Attention Economy',
    categories: ['Motion Graphics', 'Reels'],
    description: 'Stylized vector character animation examining the evolution of modern attention spans with retention graphs and bold color blocks.',
    intro: 'High-impact social commentary animation that contrasts historic vs. modern human attention spans using stylized subway commuters, negative trend curves, and bold narrative graphics.'
  },
  {
    pad: '09',
    id: 'insp-vault-09',
    title: 'Creative Wave',
    alias: 'Creative Wave',
    categories: ['2D Motion Design', 'Branding'],
    description: 'Vibrant purple concentric wave animation synchronizing illustrated microphones and books to clean visual motion.',
    intro: 'Playful and punchy vector animation representing learning and content creation. Concentric purple waves pulse rhythmically behind custom audio and literature iconography.'
  },
  {
    pad: '10',
    id: 'insp-vault-10',
    title: 'Fintech Pulse',
    alias: 'Fintech Pulse',
    categories: ['UI Motion', 'Data Viz'],
    description: 'Interactive 3D financial dashboard breakdown displaying live account balance metrics, demographic curves, and fluid card transitions.',
    intro: 'Product marketing UI animation demonstrating a modern fintech mobile & web application. Complete with realistic banking metrics, demographic charts, and tactile screen micro-interactions.'
  }
];

// 1. Update individual HTML files in api/posts/
for (const v of vaultData) {
  const filePath = path.join(POSTS_DIR, `_work_editing-inspiration-vault-${v.pad}.html`);
  let postData = {};
  if (fs.existsSync(filePath)) {
    try {
      postData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch(e) {}
  }
  
  const d = postData.data || postData;
  d.id = v.id;
  d.title = v.title;
  d.post_type = 'project';
  d.template = 'project';
  d.status = 'published';
  d.permalink = {
    path: `/work/editing-inspiration-vault-${v.pad}`,
    slug: `editing-inspiration-vault-${v.pad}`,
    parent: '',
    base: 'work',
    frontpage: false
  };

  if (!d.content) d.content = {};
  d.content.hero = {
    title: {
      block_key: 'title',
      block_type: 'title',
      heading: { field_type: 'paragraph', value: v.title },
      text: { field_type: 'paragraph', value: v.description }
    }
  };

  d.content.details = {
    project: {
      block_key: 'project',
      block_type: 'project',
      media: {
        field_type: 'media',
        value: {
          id: v.id,
          extention: 'mp4',
          text: v.title,
          src: `/uploads/insp-vault-${v.pad}.mp4`
        }
      },
      hero: {
        field_type: 'media',
        value: {
          id: v.id,
          extention: 'mp4',
          text: v.title,
          src: `/uploads/insp-vault-${v.pad}.mp4`
        }
      },
      categories: {
        field_type: 'select',
        value: v.categories
      },
      description: {
        field_type: 'paragraph',
        value: v.description
      },
      intro: {
        field_type: 'paragraph',
        value: v.intro
      },
      link: {
        field_type: 'link',
        value: {
          text: 'Watch Video',
          path: `/uploads/insp-vault-${v.pad}.mp4`,
          id: false,
          external: true,
          post_type: false
        }
      },
      alias: {
        field_type: 'text_small',
        value: v.alias
      }
    }
  };

  postData.data = d;
  fs.writeFileSync(filePath, JSON.stringify(postData, null, 2), 'utf8');
  console.log(`✓ Updated _work_editing-inspiration-vault-${v.pad}.html (${v.title})`);
}

// 2. Update api.html
let apiData = JSON.parse(fs.readFileSync(API_FILE, 'utf8'));
const posts = apiData.data.posts;

for (const v of vaultData) {
  const existingIdx = posts.findIndex(p => p.id === v.id || p.permalink?.slug === `editing-inspiration-vault-${v.pad}`);
  const postObj = {
    id: v.id,
    title: v.title,
    permalink: {
      path: `/work/editing-inspiration-vault-${v.pad}`,
      slug: `editing-inspiration-vault-${v.pad}`,
      parent: '',
      base: 'work',
      frontpage: false
    },
    'content.details': {
      project: {
        block_key: 'project',
        block_type: 'project',
        media: {
          field_type: 'media',
          value: {
            id: v.id,
            extention: 'mp4',
            text: v.title,
            src: `/uploads/insp-vault-${v.pad}.mp4`
          }
        },
        hero: {
          field_type: 'media',
          value: {
            id: v.id,
            extention: 'mp4',
            text: v.title,
            src: `/uploads/insp-vault-${v.pad}.mp4`
          }
        },
        categories: {
          field_type: 'select',
          value: v.categories
        },
        description: {
          field_type: 'paragraph',
          value: v.description
        },
        intro: {
          field_type: 'paragraph',
          value: v.intro
        },
        link: {
          field_type: 'link',
          value: {
            text: 'Watch Video',
            path: `/uploads/insp-vault-${v.pad}.mp4`,
            id: false,
            external: true,
            post_type: false
          }
        },
        alias: {
          field_type: 'text_small',
          value: v.alias
        }
      }
    }
  };

  if (existingIdx !== -1) {
    posts[existingIdx] = postObj;
  } else {
    posts.unshift(postObj);
  }
}

fs.writeFileSync(API_FILE, JSON.stringify(apiData, null, 2), 'utf8');
console.log('✓ Updated api.html with all 10 custom inspiration vault descriptions and titles');
