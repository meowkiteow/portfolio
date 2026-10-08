const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'wondermake.xyz');
const POSTS_DIR = path.join(ROOT, 'api', 'posts');

// Helper to safely read and parse JSON file
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

console.log('--- Starting Copy & FAQ Update for Vellisto Video Studio ---');

// =========================================================================
// 1. _services_website-design.html (Motion Designs)
// =========================================================================
const motionPath = path.join(POSTS_DIR, '_services_website-design.html');
const motionData = readJson(motionPath);
const motionContent = motionData.data.content;

motionContent.hero.category.heading.value = "Motion Designs";
motionContent.hero.category.text.value = "We create high-end 2D & 3D motion graphics, kinetic typography, and visual effects that give your brand unmistakable energy and impact.";

motionContent.intro.heading.heading.value = "Breathe life into \nyour <b>visuals</b>";
motionContent.intro['heading-1'].heading.value = "Dynamic motion design elevates your brand beyond static imagery, captivating your audience with fluid rhythm, bold physics, and seamless visual storytelling.";
motionContent.intro.opening.paragraph.value = "Motion graphics come in all formats — from slick product reveal animations and kinetic typography idents, to intricate 3D renders, custom logo stings, and explosive VFX transitions.";
motionContent.intro.paragraph.paragraph.value = "At Vellisto, motion design is our obsession. We blend technical mastery across After Effects, Cinema 4D, and Blender with an instinct for visual timing, weight, and rhythm. We engineer animations that feel tactile, electrifying, and unforgettable — perfectly synchronized to custom sound design that hits hard.";

motionContent.how.heading.heading.value = "How we \nwork";
motionContent.how.opening.paragraph.value = "Our end-to-end motion design, visual effects, and animation production workflow";

motionContent.processes = [
    {
        "heading": { "field_type": "paragraph", "value": "Concept & Storyboarding" },
        "text": { "field_type": "paragraph", "value": "Every great piece of motion starts with clear narrative direction. We dissect your creative brief, explore moodboards, and script visual beats to storyboard the flow before animating a single frame." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Creative Moodboards</li><li>Visual Scripting</li><li>Pacing Storyboard</li><li>Style Direction</li></ul>" },
        "block_type": "process",
        "block_key": "process"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Styleframes & Visual Direction" },
        "text": { "field_type": "paragraph", "value": "We craft high-fidelity styleframes showcasing the exact visual look, color palette, lighting, typography, and texture of the final piece so you know precisely what the end result will look like." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>High-Res Styleframes</li><li>Typography Curation</li><li>Vector & 3D Asset Creation</li><li>Color Palette Definition</li></ul>" },
        "block_type": "process",
        "block_key": "process-1"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Animation & Motion Choreography" },
        "text": { "field_type": "paragraph", "value": "We bring the design to life. Using custom easing curves, dynamic camera sweeps, and simulated physics, we choreograph motion that feels snappy, fluid, and premium." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>2D & 3D Motion Animation</li><li>Kinetic Typography</li><li>VFX & Particle Dynamics</li><li>Rough Cut Previews</li></ul>" },
        "block_type": "process",
        "block_key": "process-2"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Sound Design & Audio Polish" },
        "text": { "field_type": "paragraph", "value": "Motion is only half the experience. We compose custom sound effects (SFX), whooshes, impacts, and risers synchronized to every frame, complemented by licensed music that amplifies the energy." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Custom Sound FX (SFX)</li><li>Music Selection & Licensing</li><li>Audio Mastering & Equalization</li><li>Synced Audio Pass</li></ul>" },
        "block_type": "process",
        "block_key": "process-3"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Master Rendering & Delivery" },
        "text": { "field_type": "paragraph", "value": "We output pristine master renders in multiple aspect ratios (16:9, 9:16, 1:1) in ProRes 4444 with alpha transparency, ProRes 422 HQ, and web-optimized 4K/60fps formats." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>ProRes 4444 / 422 HQ Masters</li><li>Alpha Transparency Exports</li><li>Multi-Aspect Crops (16:9, 9:16, 1:1)</li><li>Project File Archive</li></ul>" },
        "block_type": "process",
        "block_key": "process-4"
    }
];

motionContent.questions.opening.paragraph.value = "Answers to common questions about our motion graphics and animation production";

motionContent.faq = [
    {
        "question": { "field_type": "paragraph", "value": "Will I get chances to give feedback during production?" },
        "answer": { "field_type": "paragraph", "value": "Absolutely! We build clear review checkpoints into every project: concept approval, styleframe sign-off, rough cut review, and final polish. You get dedicated revision rounds at each milestone via Frame.io so there are never any surprises." },
        "block_type": "question",
        "block_key": "question"
    },
    {
        "question": { "field_type": "paragraph", "value": "What file formats and resolutions do you deliver?" },
        "answer": { "field_type": "paragraph", "value": "We deliver full broadcast and social master formats including Apple ProRes 4444 (with alpha transparency channel if needed), ProRes 422 HQ, and web-ready 4K/1080p H.264/H.265. We also provide exports formatted for 16:9 widescreen, 9:16 vertical, and 1:1 square upon request." },
        "block_type": "question",
        "block_key": "question-1"
    },
    {
        "question": { "field_type": "paragraph", "value": "Do you provide source project files?" },
        "answer": { "field_type": "paragraph", "value": "Yes! Full After Effects (.aep) or Cinema 4D project packages with organized layer structures, linked assets, and plugins can be included as part of your project deliverable package." },
        "block_type": "question",
        "block_key": "question-2"
    },
    {
        "question": { "field_type": "paragraph", "value": "Do you handle sound design and music licensing?" },
        "answer": { "field_type": "paragraph", "value": "Yes. Every motion piece we deliver comes with comprehensive sound design (risers, whooshes, impacts, foley) and fully cleared, commercial-ready music licenses that you can use across YouTube, social ads, or broadcast TV without copyright claims." },
        "block_type": "question",
        "block_key": "question-3"
    },
    {
        "question": { "field_type": "paragraph", "value": "How long does a motion design project typically take?" },
        "answer": { "field_type": "paragraph", "value": "Turnaround depends on complexity and scope. Quick logo idents and UI motion snippets take 3 to 5 business days, while comprehensive 30–60 second 3D or kinetic explainer pieces typically take 2 to 3 weeks with collaborative review cycles." },
        "block_type": "question",
        "block_key": "question-4"
    },
    {
        "question": { "field_type": "paragraph", "value": "Can you animate our existing brand assets or vector files?" },
        "answer": { "field_type": "paragraph", "value": "Definitely. Send us your vector files (AI, SVG, EPS), Figma components, 3D models, or brand guidelines, and we’ll rig and animate them directly according to your brand’s visual identity." },
        "block_type": "question",
        "block_key": "question-5"
    },
    {
        "question": { "field_type": "paragraph", "value": "How will we communicate and share files during the project?" },
        "answer": { "field_type": "paragraph", "value": "We collaborate through private Discord deal/client rooms, shared Frame.io review links for timestamped video notes, Google Drive, and Dropbox for lightning-fast raw file transfer." },
        "block_type": "question",
        "block_key": "question-6"
    },
    {
        "question": { "field_type": "paragraph", "value": "Who will actually be working on my project?" },
        "answer": { "field_type": "paragraph", "value": "The Vellisto guarantee is that you’ll work directly with lead motion designers and video editors at every stage of the project. No account managers or non-technical middlemen — just dedicated creative directors who execute your vision from start to finish." },
        "block_type": "question",
        "block_key": "question-7"
    }
];

motionData.data.seo_title = "Motion Designs & Animation Studio | Vellisto";
motionData.data.seo_desc = "High-end 2D/3D motion graphics, kinetic typography, and visual effects by Vellisto.";
writeJson(motionPath, motionData);
console.log('✓ Updated _services_website-design.html (Motion Designs)');


// =========================================================================
// 2. _services_branding.html (Long Form)
// =========================================================================
const brandingPath = path.join(POSTS_DIR, '_services_branding.html');
const brandingData = readJson(brandingPath);
const brandingContent = brandingData.data.content;

brandingContent.hero.category.heading.value = "Long Form";
brandingContent.hero.category.text.value = "High-retention YouTube editing, documentary narratives, video essays, and podcasts engineered to maximize watch time and engagement.";

brandingContent.intro.heading.heading.value = "Captivate audiences \nwith <b>storytelling</b>";
brandingContent.intro['heading-1'].heading.value = "Transform raw footage into immersive, binge-worthy narratives that hold viewer attention from the first second to the final frame.";
brandingContent.intro.opening.paragraph.value = "Long-form video is the ultimate medium for building loyal audiences, authority, and organic reach. Whether it's high-production YouTube video essays, multi-camera podcasts, documentary deep-dives, or cinematic talking head breakdowns, pacing and narrative rhythm are everything.";
brandingContent.intro.paragraph.paragraph.value = "At Vellisto, we don't just cut clips together; we engineer retention. We analyze audience drop-off patterns, structure compelling narrative arcs, curate context-rich B-roll, and craft seamless visual humor, charts, and motion graphics that keep viewers glued to their screens.";

brandingContent.how.heading.heading.value = "How we \nwork";
brandingContent.how.opening.paragraph.value = "Our systematic long-form editing and post-production workflow";

brandingContent.processes = [
    {
        "heading": { "field_type": "paragraph", "value": "Footage Ingestion & A-Roll Pacing" },
        "text": { "field_type": "paragraph", "value": "We ingest your multi-camera 4K footage and multi-track audio, sync everything with frame accuracy, eliminate dead air, pauses, and stumbles, and construct a tight, punchy A-roll rhythm." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Multicam Audio/Video Sync</li><li>Dead Air & Filler Cut</li><li>Pacing & Hook Optimization</li><li>A-Roll Narrative Backbone</li></ul>" },
        "block_type": "process",
        "block_key": "process"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Story Arc & B-Roll Curation" },
        "text": { "field_type": "paragraph", "value": "We craft an emotional and intellectual arc. We source ultra-relevant cinematic B-roll, archival clips, contextual footage, and sound effects to illustrate complex points visually and maintain relentless engagement." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Cinematic B-Roll Sourcing</li><li>Contextual Visual Cues</li><li>Narrative Arc Structuring</li><li>Visual Gags & Meme Timing</li></ul>" },
        "block_type": "process",
        "block_key": "process-1"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Motion Graphics & Visual Polish" },
        "text": { "field_type": "paragraph", "value": "We integrate custom kinetic typography, animated infographics, lower thirds, 3D camera projections, and stylish visual treatments that give your video a polished, big-budget studio feel." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Custom On-Screen Graphics</li><li>Animated Charts & Infographics</li><li>Custom Lower Thirds</li><li>Visual Effects & Zoom Framing</li></ul>" },
        "block_type": "process",
        "block_key": "process-2"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Sound Design & Audio Mix" },
        "text": { "field_type": "paragraph", "value": "Audio makes up 50% of the viewer experience. We clean background noise, level dialogue, mix dynamic background scores, and layer rich foley and impact SFX that accentuate every key moment." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Dialogue Denoise & EQ</li><li>Dynamic Score Mixing</li><li>Custom SFX & Foley Layering</li><li>Mastered to Broadcast Loudness (-14 LUFS)</li></ul>" },
        "block_type": "process",
        "block_key": "process-3"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Color Grading & Final Master" },
        "text": { "field_type": "paragraph", "value": "We apply cinematic color correction and grading to match cameras and evoke mood, then export YouTube-ready 4K 60fps masters with chapter markers and packaging assets." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Multi-Camera Color Matching</li><li>Cinematic Color Grade (Rec. 709)</li><li>Master 4K / 1080p High-Bitrate Export</li><li>Frame.io Timestamped Revisions</li></ul>" },
        "block_type": "process",
        "block_key": "process-4"
    }
];

brandingContent.questions.opening.paragraph.value = "Frequently asked questions regarding long-form video production and editing retainers";

brandingContent.faq = [
    {
        "question": { "field_type": "paragraph", "value": "How fast is your turnaround for long-form YouTube videos?" },
        "answer": { "field_type": "paragraph", "value": "Our standard turnaround for long-form episodes (10–30 minutes) is 48 to 72 hours for the first cut. Sprints and emergency turnarounds can also be accommodated through our dedicated project retainers." },
        "block_type": "question",
        "block_key": "question"
    },
    {
        "question": { "field_type": "paragraph", "value": "How do we transfer large 4K raw footage files?" },
        "answer": { "field_type": "paragraph", "value": "We use shared high-speed Google Drive and Dropbox folders configured for unlimited file sizes. You simply drop your raw camera cards or exports into the folder, and our editors begin ingestion immediately." },
        "block_type": "question",
        "block_key": "question-1"
    },
    {
        "question": { "field_type": "paragraph", "value": "How many rounds of revisions are included?" },
        "answer": { "field_type": "paragraph", "value": "Every long-form video includes 2 comprehensive rounds of revisions via Frame.io. You can pause the video, click directly on the screen, and leave timestamped comments for our editors to address in real time." },
        "block_type": "question",
        "block_key": "question-2"
    },
    {
        "question": { "field_type": "paragraph", "value": "Do you also help with YouTube packaging (Thumbnails & Titles)?" },
        "answer": { "field_type": "paragraph", "value": "Yes! High retention starts before the click. We provide thumbnail concepts, high-converting thumbnail PSD/PNG designs, and title A/B test suggestions crafted to maximize Click-Through Rate (CTR)." },
        "block_type": "question",
        "block_key": "question-3"
    },
    {
        "question": { "field_type": "paragraph", "value": "What editing software and workflows do you use?" },
        "answer": { "field_type": "paragraph", "value": "We work primarily in Adobe Premiere Pro and DaVinci Resolve Studio for editing and color, paired with After Effects for motion graphics and Audition/Fairlight for sound design." },
        "block_type": "question",
        "block_key": "question-4"
    },
    {
        "question": { "field_type": "paragraph", "value": "Can you edit multi-cam podcast recordings?" },
        "answer": { "field_type": "paragraph", "value": "Yes! We specialize in multi-camera podcast setups with multi-track audio. We handle dynamic speaker switching, picture-in-picture, lower thirds, waveform visuals, and full audio leveling." },
        "block_type": "question",
        "block_key": "question-5"
    },
    {
        "question": { "field_type": "paragraph", "value": "Do you supply licensed background music and sound effects?" },
        "answer": { "field_type": "paragraph", "value": "Every track and sound effect we use is 100% commercially licensed and cleared for YouTube monetization. You will never receive a copyright strike or demonetization notice on videos edited by Vellisto." },
        "block_type": "question",
        "block_key": "question-6"
    },
    {
        "question": { "field_type": "paragraph", "value": "Can you repurpose our long-form videos into short-form clips?" },
        "answer": { "field_type": "paragraph", "value": "Yes! As part of our content ecosystem, we can extract the most viral moments from your long-form video and cut them into high-converting 9:16 vertical shorts for TikTok, Instagram Reels, and YouTube Shorts." },
        "block_type": "question",
        "block_key": "question-7"
    }
];

brandingData.data.seo_title = "Long Form Video Editing | Vellisto";
brandingData.data.seo_desc = "High-retention long form video editing for YouTube, documentaries, and video essays.";
writeJson(brandingPath, brandingData);
console.log('✓ Updated _services_branding.html (Long Form)');


// =========================================================================
// 3. _services_product-design.html (Short Form)
// =========================================================================
const shortPath = path.join(POSTS_DIR, '_services_product-design.html');
const shortData = readJson(shortPath);
const shortContent = shortData.data.content;

shortContent.hero.category.heading.value = "Short Form";
shortContent.hero.category.text.value = "Viral TikToks, Instagram Reels, and YouTube Shorts engineered with scroll-stopping hooks, dynamic pacing, and kinetic typography.";

shortContent.intro.heading.heading.value = "Dominate the \n<b>feed</b> in seconds";
shortContent.intro['heading-1'].heading.value = "Grab immediate attention in the first 3 seconds, hook viewers with relentless visual pacing, and drive massive engagement across TikTok, Reels, and Shorts.";
shortContent.intro.opening.paragraph.value = "Short-form video algorithms demand instant gratification. Without a killer hook and continuous visual stimulation every 1.5 to 2 seconds, viewers swipe away. Success requires a deep understanding of platform retention curves and trending aesthetics.";
shortContent.intro.paragraph.paragraph.value = "At Vellisto, we engineer short-form content designed to stop thumbs in their tracks. We craft bold typography, expressive zooms, sound effects that trigger dopamine, and snappy transitions that keep retention above 80% — turning casual scrollers into dedicated followers and customers.";

shortContent.how.heading.heading.value = "How we \nwork";
shortContent.how.opening.paragraph.value = "Our high-speed viral short-form production framework";

shortContent.processes = [
    {
        "heading": { "field_type": "paragraph", "value": "Hook Strategy & Script Review" },
        "text": { "field_type": "paragraph", "value": "We identify the strongest 3-second hook in your footage or script, structuring the opening with high-impact visual disruption and curiosity gaps to ensure viewers don't swipe past." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>3-Second Hook Optimization</li><li>Pattern Interrupt Design</li><li>Script Flow Review</li><li>Retention Curve Planning</li></ul>" },
        "block_type": "process",
        "block_key": "process"
    },
    {
        "heading": { "field_type": "paragraph", "value": "High-Octane Cut & Dynamic Pacing" },
        "text": { "field_type": "paragraph", "value": "We trim every microsecond of dead air, weaving tight jump cuts, push-ins, dynamic re-framing, and speed ramps to create a relentless visual cadence that feels effortless to watch." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Micro-Pacing & Zero Dead Air</li><li>Dynamic Pan & Zoom Framing</li><li>Speed Ramps & Transitions</li><li>Beat-Synced Edits</li></ul>" },
        "block_type": "process",
        "block_key": "process-1"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Kinetic Captions & Graphic Overlays" },
        "text": { "field_type": "paragraph", "value": "Over 70% of short-form videos are watched on mute. We animate vibrant, kinetic subtitles with word-by-word highlights, emoji accents, stickers, and custom motion graphics." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Word-by-Word Kinetic Subtitles</li><li>Custom Font Styling & Emojis</li><li>B-Roll Overlays & Pop-up Memes</li><li>Platform-Safe Margins (9:16)</li></ul>" },
        "block_type": "process",
        "block_key": "process-2"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Trending Audio & Sound FX" },
        "text": { "field_type": "paragraph", "value": "We layer immersive whooshes, pops, cinematic hits, and trending audio beds that give every subtitle animation and transition tangible physical punch." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Punchy SFX (Pops, Hits, Risers)</li><li>Trending Audio Integration</li><li>Voice Clarity EQ & Compression</li><li>High-Impact Mix</li></ul>" },
        "block_type": "process",
        "block_key": "process-3"
    }
];

shortContent.questions.opening.paragraph.value = "Frequently asked questions about our short-form content creation and batch editing packages";

shortContent.faq = [
    {
        "question": { "field_type": "paragraph", "value": "Can you batch edit multiple short-form videos each month?" },
        "answer": { "field_type": "paragraph", "value": "Yes! Most of our creator and brand clients work with us on monthly batch packages (e.g. 15, 30, or 60 shorts per month). You send us raw clips or podcasts, and we deliver a steady stream of ready-to-post vertical videos." },
        "block_type": "question",
        "block_key": "question"
    },
    {
        "question": { "field_type": "paragraph", "value": "Can you create shorts from my existing long-form videos?" },
        "answer": { "field_type": "paragraph", "value": "Absolutely. Send us your YouTube videos, podcasts, or webinars, and our editors will pinpoint the most engaging, viral segments, reframe them into 9:16 vertical video, and add kinetic captions and graphics." },
        "block_type": "question",
        "block_key": "question-1"
    },
    {
        "question": { "field_type": "paragraph", "value": "What subtitle styles do you support?" },
        "answer": { "field_type": "paragraph", "value": "We customize captions to match your brand aesthetic — from sleek minimalist typography and Hormozi-style bold word-highlights to colorful cartoon animations and dynamic bouncing emojis." },
        "block_type": "question",
        "block_key": "question-2"
    },
    {
        "question": { "field_type": "paragraph", "value": "Do you ensure captions don't get covered by TikTok/Reels UI?" },
        "answer": { "field_type": "paragraph", "value": "Yes! We adhere strictly to platform safe zones. All text, faces, and critical visual elements are kept clear of profile icons, like buttons, comment fields, and caption descriptions." },
        "block_type": "question",
        "block_key": "question-3"
    },
    {
        "question": { "field_type": "paragraph", "value": "What is your turnaround time for short-form edits?" },
        "answer": { "field_type": "paragraph", "value": "Batches of short-form edits are delivered within 24 to 48 hours via Dropbox or Google Drive, complete with preview links for quick mobile approvals." },
        "block_type": "question",
        "block_key": "question-4"
    }
];

shortData.data.seo_title = "Short Form Video Editing | TikTok, Reels & Shorts | Vellisto";
shortData.data.seo_desc = "High-retention short form video editing for TikTok, Instagram Reels, and YouTube Shorts.";
writeJson(shortPath, shortData);
console.log('✓ Updated _services_product-design.html (Short Form)');


// =========================================================================
// 4. _services_design-support.html (Projects)
// =========================================================================
const projectsPath = path.join(POSTS_DIR, '_services_design-support.html');
const projectsData = readJson(projectsPath);
const projectsContent = projectsData.data.content;

projectsContent.hero.category.heading.value = "Projects";
projectsContent.hero.category.text.value = "Dedicated video editing sprints, bespoke commercial campaigns, and ongoing post-production retainers tailored to your creative roadmap.";

projectsContent.intro.heading.heading.value = "Your dedicated \n<b>post-production</b> team";
projectsContent.intro['heading-1'].heading.value = "Scale your video output without the overhead of hiring in-house. Partner with an elite editing studio ready to execute on-demand.";
projectsContent.intro.opening.paragraph.value = "Whether launching a major commercial campaign, scaling a YouTube channel to millions of views, or producing ongoing social content across multiple platforms, you need consistent, high-tier creative execution.";
projectsContent.intro.paragraph.paragraph.value = "At Vellisto, we operate as your embedded creative partner. With dedicated video editors, motion designers, and sound engineers, we plug directly into your production calendar. No flaky freelancers, no recruitment headaches — just world-class video production delivered on schedule, every time.";

projectsContent.how.heading.heading.value = "How we \nwork";
projectsContent.how.opening.paragraph.value = "Flexible engagement models to support your video production and editing needs";

projectsContent.processes = [
    {
        "heading": { "field_type": "paragraph", "value": "Dedicated Sprint Retainers" },
        "text": { "field_type": "paragraph", "value": "Reserve dedicated editor bandwidth month-over-month. We build a production backlog, assign lead video specialists, and deliver regular cuts on an agreed cadence with direct communication in your private Discord hub." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Dedicated Editor Allocation</li><li>Guaranteed Turnaround Times</li><li>Shared Frame.io & Discord Channels</li><li>Predictable Monthly Invoicing</li></ul>" },
        "block_type": "process",
        "block_key": "process"
    },
    {
        "heading": { "field_type": "paragraph", "value": "Bespoke Commercial Projects" },
        "text": { "field_type": "paragraph", "value": "For one-off launch films, product teasers, event recaps, or high-concept commercials, we scope the entire post-production pipeline from script to final color grade and master delivery." },
        "outcomes": { "field_type": "paragraph", "value": "<ul><li>Fixed Scope & Transparent Pricing</li><li>Full Creative Direction & Storyboarding</li><li>2D/3D Motion Graphics & VFX</li><li>Complete Broadcast & Web Masters</li></ul>" },
        "block_type": "process",
        "block_key": "process-1"
    }
];

projectsContent.questions.opening.paragraph.value = "Answers to common questions about our dedicated video editing retainers and project sprints";

projectsContent.faq = [
    {
        "question": { "field_type": "paragraph", "value": "How does a dedicated monthly video retainer work?" },
        "answer": { "field_type": "paragraph", "value": "You get reserved editing bandwidth each month with guaranteed turnaround times. We set up a private Discord production room and shared cloud folders, allowing you to submit projects continuously with priority turnaround." },
        "block_type": "question",
        "block_key": "question"
    },
    {
        "question": { "field_type": "paragraph", "value": "Can we pause or cancel our subscription?" },
        "answer": { "field_type": "paragraph", "value": "Yes. Our monthly retainers are flexible. You can pause or adjust your tier depending on your shooting schedule and video pipeline with zero long-term lock-in." },
        "block_type": "question",
        "block_key": "question-1"
    },
    {
        "question": { "field_type": "paragraph", "value": "What is your turnaround time during an active retainer?" },
        "answer": { "field_type": "paragraph", "value": "Retainer clients receive priority turnaround: typically 24 hours for short-form edits and 48 hours for long-form episodes, with live communication inside your dedicated Discord channel." },
        "block_type": "question",
        "block_key": "question-2"
    },
    {
        "question": { "field_type": "paragraph", "value": "What if our editing requirements change mid-project?" },
        "answer": { "field_type": "paragraph", "value": "Because we have expertise across long-form editing, 2D/3D motion graphics, and short-form social content, we can fluidly shift focus between formats as your priorities evolve." },
        "block_type": "question",
        "block_key": "question-3"
    }
];

projectsData.data.seo_title = "Video Editing Retainers & Projects | Vellisto";
projectsData.data.seo_desc = "Dedicated video editing retainers and custom commercial projects by Vellisto.";
writeJson(projectsPath, projectsData);
console.log('✓ Updated _services_design-support.html (Projects)');


// =========================================================================
// 5. _services.html (Overview Services Page)
// =========================================================================
const servicesPath = path.join(POSTS_DIR, '_services.html');
const servicesData = readJson(servicesPath);
const servContent = servicesData.data.content;

servContent.hero.title.text.value = "We're an elite video editing and motion production studio specializing in high-retention visual storytelling.";
servContent.intro.heading.heading.value = "Crafted for creators and brands who refuse to be ignored.";
servContent.intro.opening.paragraph.value = "In a digital landscape overflowing with noise, standard video editing simply doesn't cut it. We combine narrative psychology, relentless pacing, and world-class motion design to capture attention and hold it.";
servContent.intro.paragraph.paragraph.value = "From high-retention YouTube long-form and viral short-form to bespoke 2D/3D motion graphics and commercial video campaigns — our multidisciplinary studio brings unmatched craft to every timeline.<br>";

servContent.overview.heading.heading.value = "SERVICES \nAT A GLANCE";
servContent.overview.paragraph.paragraph.value = "A breakdown of our core video editing, motion design, and post-production capabilities.";

servContent.services[0].heading.value = "Long Form";
servContent.services[0].text.value = "YouTube Editing • Documentary Narratives • Video Essays • Podcast Multi-Cam • Retention Pacing";

servContent.services[1].heading.value = "Motion Designs";
servContent.services[1].text.value = "2D & 3D Motion Graphics • Kinetic Typography • VFX Transitions • Logo Animations • UI Motion";

servContent.services[2].heading.value = "Short Form";
servContent.services[2].text.value = "TikToks • Instagram Reels • YouTube Shorts • Kinetic Subtitles • 3-Second Hook Strategy";

servContent.services[3].heading.value = "Projects & Sprints";
servContent.services[3].text.value = "Dedicated Video Retainers • Commercial Campaigns • Launch Trailers • Brand Story Films";

servContent.services[4].heading.value = "Sound Design & Mix";
servContent.services[4].text.value = "Custom SFX & Foley • Dialogue Denoising • Dynamic Scoring • Loudness Mastering (-14 LUFS)";

servContent.services[5].heading.value = "Color Grading";
servContent.services[5].text.value = "Cinematic Looks • Multi-Camera Color Matching • Rec.709 & HDR Mastering • Mood Grading";

servContent.services[6].heading.value = "Visual Effects & CGI";
servContent.services[6].text.value = "3D Camera Projection • Motion Tracking • Screen Replacements • Rotoscoping & Compositing";

servContent.services[7].heading.value = "YouTube Packaging";
servContent.services[7].text.value = "CTR-Optimized Thumbnails • Title Strategy • A/B Testing Assets • Retention Analytics";

servContent.expertise.title.heading.value = "What are you \nlooking for?";
servContent.expertise.title.text.value = "Long form, short form, motion graphics, or full commercial production — we have the editing power to elevate your content.";

servicesData.data.seo_title = "Video Editing & Motion Services | Vellisto";
servicesData.data.seo_desc = "Explore our suite of video editing, motion graphics, short form, and post-production services.";
writeJson(servicesPath, servicesData);
console.log('✓ Updated _services.html (Overview)');


// =========================================================================
// 6. _about.html (About Page)
// =========================================================================
const aboutPath = path.join(POSTS_DIR, '_about.html');
const aboutData = readJson(aboutPath);
const aboutContent = aboutData.data.content;

aboutContent.hero.title.heading.value = "Character & craft<br><b>in motion</b>";
aboutContent.hero.title.text.value = "We’re an independent video editing and motion production studio crafted with passion and purpose for those brave enough to buck the trend.";

aboutContent.intro.heading.heading = "Daring visual storytelling with personality, passion and purpose.";
aboutContent.intro.opening.paragraph = "We partner with visionary creators, founders, and bold brands to craft high-retention video content, documentary storytelling, and electrifying motion design that leave a lasting impression.";
aboutContent.intro.paragraph.paragraph = "Our work combines narrative psychology with relentless editing craft, bringing character and energy to life across every cut.";

aboutContent.approach.title.text.value = "How we turn raw footage into cinematic, high-retention visual experiences.";
aboutContent.approach.card.heading = "Narrative First";
aboutContent.approach.card.text = "We dig into the core story and message, structuring an arc that hooks audiences immediately and never lets go.";

aboutContent.approach['card-1'].heading = "Relentless Craft";
aboutContent.approach['card-1'].text = "We refuse boring edits. Every cut, sound effect, and graphic element is tuned with frame-by-frame precision.";

aboutContent.approach['card-2'].heading = "Rhythm & Physics";
aboutContent.approach['card-2'].text = "Great pacing balances explosive kinetic momentum with breathing room, matching visual movement to sound design.";

aboutContent.approach['card-3'].heading = "Retention Engineering";
aboutContent.approach['card-3'].text = "We design for watch time, algorithmic lift, and audience connection that compounds into enduring brand authority.";

aboutData.data.seo_title = "About Us | Vellisto Video Studio";
aboutData.data.seo_desc = "Learn about Vellisto, an independent video editing and motion production studio.";
writeJson(aboutPath, aboutData);
console.log('✓ Updated _about.html');


// =========================================================================
// 7. _work.html (Work Page)
// =========================================================================
const workPath = path.join(POSTS_DIR, '_work.html');
const workData = readJson(workPath);
const workContent = workData.data.content;

workContent.hero.title.text.value = "High-impact video editing, kinetic motion design, and retention-focused storytelling engineered to stand out.";
workContent.expertise.title.text.value = "Long form, motion design, viral shorts, or dedicated production sprints — discover our creative output.";

workData.data.seo_title = "Our Work | Vellisto";
workData.data.seo_desc = "A showcase of high-impact video edits, motion graphics, and creative video projects by Vellisto.";
writeJson(workPath, workData);
console.log('✓ Updated _work.html');


// =========================================================================
// 8. index.html (SSR HTML and embedded window.$ssr JSON)
// =========================================================================
const indexPath = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Update meta tags and SSR prerendered text
indexHtml = indexHtml.replace(
    /<title>Vellisto \| Creative studio for brands, web, apps &amp; games<\/title>/g,
    '<title>Vellisto | Video Editing & Motion Production Studio</title>'
);
indexHtml = indexHtml.replace(
    /A creative studio, crafting bold brands and daring digital experiences with personality, passion and purpose · Web Design · Branding · Development/g,
    'An ultra-premium video editing agency and motion design studio crafting high-retention YouTube content, viral short form, and electrifying animations.'
);
indexHtml = indexHtml.replace(
    /<h1>Vellisto \| Creative studio for brands, web, apps &amp; games<\/h1>/g,
    '<h1>Vellisto | Video Editing & Motion Production Studio</h1>'
);
indexHtml = indexHtml.replace(
    /<h2>We build brands<br>that <b>stand out<\/b><\/h2><p>We’re a brand and digital design studio combining character and craft for those brave enough to buck the trend.<\/p>/g,
    '<h2>We craft videos<br>that <b>stand out</b></h2><p>We’re an ultra-premium video editing and motion design studio combining character and craft for those brave enough to buck the trend.</p>'
);
indexHtml = indexHtml.replace(
    /<p>We craft brands, products, games and experiences that spark a moment of joy.<\/p>/g,
    '<p>We craft high-retention video edits, viral short form, motion graphics, and commercial campaigns that captivate audiences.</p>'
);
indexHtml = indexHtml.replace(
    /<p>Create or refine a visual identity to celebrate your unique personality and proposition.<\/p>/g,
    '<p>High-retention YouTube editing, documentary narratives, podcasts, and deep video essays engineered for maximum watch time.</p>'
);
indexHtml = indexHtml.replace(
    /<p>Amplify your brands presence and engage your audience with an impactful and interactive website.<\/p>/g,
    '<p>High-end 2D/3D motion graphics, kinetic typography, VFX, and visual identity animations that demand attention.</p>'
);
indexHtml = indexHtml.replace(
    /<p>Organise, structure and architect your digital product so that it’s beautiful, intuitive and effective.<\/p>/g,
    '<p>Viral TikToks, Reels, and Shorts crafted with aggressive hooks, dynamic pacing, and kinetic captions.</p>'
);
indexHtml = indexHtml.replace(
    /<p>An ongoing engagement to help with your regular or ad-hoc creative requirements and output.<\/p>/g,
    '<p>Dedicated video editing sprints, bespoke commercial campaigns, and continuous post-production retainers.</p>'
);

// Update window.$ssr JSON string inside indexHtml
const ssrStart = indexHtml.indexOf("window.$ssr = '");
const ssrEnd = indexHtml.lastIndexOf("';</script>");
if (ssrStart !== -1 && ssrEnd !== -1) {
    const rawSsrString = indexHtml.substring(ssrStart + "window.$ssr = '".length, ssrEnd);
    // Parse using Function to unescape string literals
    const evaluatedJsonString = new Function("return '" + rawSsrString + "'")();
    const ssrObj = JSON.parse(evaluatedJsonString);

    // Update ssrObj fields
    ssrObj.options.site_title = 'Vellisto';
    ssrObj.options.site_desc = 'An ultra-premium video editing agency and motion design studio crafting high-retention YouTube content, viral short form, and electrifying animations.';

    if (ssrObj.post && ssrObj.post.content) {
        const pc = ssrObj.post.content;
        if (pc.hero && pc.hero.title) {
            pc.hero.title.heading.value = "We craft videos \\nthat <b>stand out</b>";
            pc.hero.title.text.value = "We’re an ultra-premium video editing and motion design studio combining character and craft for those brave enough to buck the trend.";
        }
        if (pc.expertise) {
            if (pc.expertise.title) {
                pc.expertise.title.text.value = "We craft high-retention video edits, viral short form, motion graphics, and commercial campaigns that captivate audiences.";
            }
            if (pc.expertise.category) {
                pc.expertise.category.text.value = "High-retention YouTube editing, documentary narratives, podcasts, and deep video essays engineered for maximum watch time.";
            }
            if (pc.expertise['category-1']) {
                pc.expertise['category-1'].text.value = "High-end 2D/3D motion graphics, kinetic typography, VFX, and visual identity animations that demand attention.";
            }
            if (pc.expertise['category-2']) {
                pc.expertise['category-2'].text.value = "Viral TikToks, Reels, and Shorts crafted with aggressive hooks, dynamic pacing, and kinetic captions.";
            }
            if (pc.expertise['category-3']) {
                pc.expertise['category-3'].text.value = "Dedicated video editing sprints, bespoke commercial campaigns, and continuous post-production retainers.";
            }
        }
        if (pc.enquiry) {
            if (pc.enquiry.opening && pc.enquiry.opening.paragraph) {
                pc.enquiry.opening.paragraph.value = "Every video project is a balancing act of quality, speed and scale. It's the classic creative conundrum...";
            }
            if (pc.enquiry.paragraph && pc.enquiry.paragraph.paragraph) {
                pc.enquiry.paragraph.paragraph.value = "We'll always deliver the best outcomes for your channel or brand, but how that looks will depend on your timeline and footage. High-production cinematic editing with a fast turnaround will be prioritized. Looking for regular batch output on a creator budget? Rest assured we'll find a solution that works for you!";
            }
        }
    }

    // Re-stringify safely into single-quoted JS literal
    const updatedSsrString = JSON.stringify(ssrObj).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    indexHtml = indexHtml.substring(0, ssrStart + "window.$ssr = '".length) + updatedSsrString + indexHtml.substring(ssrEnd);
    console.log('✓ Updated window.$ssr in index.html');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✓ Saved index.html');

console.log('--- All Copy and FAQs successfully updated to Vellisto Video & Motion Studio! ---');
