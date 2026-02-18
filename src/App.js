import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA & CONSTANTS ────────────────────────────────────────────────
const LOCATIONS = ["MH", "BK", "DC"];
const DEPARTMENTS = [
  "Special Education", "Related Services", "Quality", "Research",
  "Continuing Education", "Fundraising", "Finance", "Strategic Planning",
  "Marketing", "Neuropsychology", "Assessment Clinic", "Community Initiatives"
];
const PHASES = ["Planning", "In Progress", "Review", "Completed", "On Hold"];
const PHASE_COLORS = {
  "Planning": { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
  "In Progress": { bg: "#E3F2FD", text: "#0D47A1", dot: "#2196F3" },
  "Review": { bg: "#F3E5F5", text: "#6A1B9A", dot: "#9C27B0" },
  "Completed": { bg: "#E8F5E9", text: "#1B5E20", dot: "#4CAF50" },
  "On Hold": { bg: "#ECEFF1", text: "#37474F", dot: "#78909C" },
};
const MEETING_CADENCES = ["Weekly", "Bi-Weekly", "Monthly", "Quarterly", "As Needed"];

const TEAM_MEMBERS = [
  "Arthur", "Patrick", "Cassie", "Dr. Weisman", "Geneva Lewis", "Caleb",
  "Sarah K.", "Michael R.", "Jennifer L.", "David M.", "Lisa T.", "Robert C.",
  "Amanda H.", "Chris P."
];

const INITIAL_PROJECTS = [
  {
    id: 1, name: "Dysregulation Support Project", type: "Project",
    description: "Developing a comprehensive framework for supporting students experiencing dysregulation, including committee formation, risk management assessment protocols, and ABC training implementation.",
    locations: ["MH", "BK", "DC"], departments: ["Special Education", "Related Services", "Quality"],
    phase: "Planning", pointPerson: "Geneva Lewis", assignees: ["Geneva Lewis", "Caleb"],
    startDate: "2026-02-01", endDate: "2026-08-31",
    meetingCadence: "Bi-Weekly", meetingDay: "Tuesday",
    links: [],
    notes: [
      { id: 1, author: "Geneva Lewis", date: "2026-02-18", text: "Next steps: 1) Put together a committee, 2) Risk management assessment for identification of students, 3) ABC training rollout." },
    ],
    documents: [],
  },
  {
    id: 2, name: "DC Clinic Expansion", type: "Project",
    description: "Expanding therapy services and evaluation capacity at the Washington DC location.",
    locations: ["DC"], departments: ["Assessment Clinic", "Related Services", "Finance"],
    phase: "Planning", pointPerson: "Patrick", assignees: ["Patrick", "Dr. Weisman", "Arthur"],
    startDate: "2026-01-15", endDate: "2026-09-01",
    meetingCadence: "Weekly", meetingDay: "Wednesday",
    links: [{ label: "Expansion Budget Model", url: "#" }, { label: "DC Regulatory Guide", url: "#" }],
    notes: [{ id: 1, author: "Patrick", date: "2026-02-12", text: "Lease negotiations ongoing. Target: finalize by end of March." }],
    documents: [{ name: "Market Analysis.docx", type: "docx" }],
  },
  {
    id: 3, name: "AI Session Note Review System", type: "Project",
    description: "Implementing AI-powered review of therapy session notes to improve quality and compliance.",
    locations: ["MH", "BK"], departments: ["Quality", "Research", "Special Education"],
    phase: "In Progress", pointPerson: "Cassie", assignees: ["Cassie", "Lisa T.", "Amanda H."],
    startDate: "2026-01-01", endDate: "2026-05-15",
    meetingCadence: "Weekly", meetingDay: "Thursday",
    links: [{ label: "Tech Roadmap", url: "#" }],
    notes: [],
    documents: [{ name: "Pilot Results.pdf", type: "pdf" }],
  },
  {
    id: 4, name: "Grand Rounds Conference Series", type: "Initiative",
    description: "Cross-site continuing education program featuring expert presentations and case reviews.",
    locations: ["MH", "BK", "DC"], departments: ["Continuing Education", "Research", "Neuropsychology"],
    phase: "In Progress", pointPerson: "Dr. Weisman", assignees: ["Dr. Weisman", "Jennifer L.", "Robert C."],
    startDate: "2025-09-01", endDate: "2026-08-31",
    meetingCadence: "Monthly", meetingDay: "Friday",
    links: [{ label: "Schedule & Speakers", url: "#" }],
    notes: [{ id: 1, author: "Dr. Weisman", date: "2026-02-08", text: "March session confirmed: Dr. Rivera on pediatric neuroplasticity." }],
    documents: [],
  },
  {
    id: 5, name: "Have a Heart, Save a Brain Campaign", type: "Project",
    description: "Annual fundraising campaign with donor engagement funnel and event planning.",
    locations: ["MH", "BK", "DC"], departments: ["Fundraising", "Marketing", "Community Initiatives"],
    phase: "Review", pointPerson: "Sarah K.", assignees: ["Sarah K.", "Arthur", "Michael R."],
    startDate: "2025-12-01", endDate: "2026-03-31",
    meetingCadence: "Weekly", meetingDay: "Monday",
    links: [{ label: "Campaign Landing Page", url: "#" }, { label: "Donor CRM", url: "#" }],
    notes: [],
    documents: [{ name: "Campaign Brief.pdf", type: "pdf" }, { name: "Donor List.xlsx", type: "xlsx" }],
  },
  {
    id: 6, name: "Centralized Dashboard System", type: "Project",
    description: "Building unified dashboard for cross-departmental KPI tracking and process management.",
    locations: ["MH", "BK", "DC"], departments: ["Strategic Planning", "Marketing", "Quality"],
    phase: "In Progress", pointPerson: "Arthur", assignees: ["Arthur", "Chris P."],
    startDate: "2026-01-10", endDate: "2026-07-01",
    meetingCadence: "Bi-Weekly", meetingDay: "Wednesday",
    links: [{ label: "Dashboard Wireframes", url: "#" }],
    notes: [{ id: 1, author: "Arthur", date: "2026-02-16", text: "V1 prototype ready for leadership review next week." }],
    documents: [],
  },
];

// ─── ICONS (inline SVGs) ─────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    filter: <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    x: <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
    file: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
    note: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    chevDown: <path d="M6 9l6 6 6-6" />,
    chevRight: <path d="M9 18l6-6-6-6" />,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
    timeline: <><path d="M12 2v20M2 12h20" /><circle cx="12" cy="6" r="2" /><circle cx="12" cy="18" r="2" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    send: <><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4z" /></>,
    building: <><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18" /><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2M18 12h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" /><path d="M10 6h4M10 10h4M10 14h4M10 18h4" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    check: <path d="M20 6L9 17l-5-5" />,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></>,
    msg: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&display=swap');

  :root {
    --bg-primary: #FAFAF8;
    --bg-surface: #FFFFFF;
    --bg-surface-alt: #F5F4F0;
    --bg-hover: #EFEEEA;
    --border: #E2E0D8;
    --border-light: #EDECEA;
    --text-primary: #1A1917;
    --text-secondary: #6B6960;
    --text-tertiary: #9C9889;
    --accent: #2D5A27;
    --accent-light: #E8F0E7;
    --accent-hover: #3D7635;
    --accent-warm: #C4652A;
    --accent-warm-light: #FFF0E8;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
    --shadow-lg: 0 8px 30px rgba(0,0,0,0.08);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'DM Sans', -apple-system, sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: var(--font-body);
    background: var(--bg-primary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  .dashboard { max-width: 1440px; margin: 0 auto; padding: 0 24px 60px; }

  /* ── Header ── */
  .header {
    padding: 32px 0 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .header h1 {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text-primary);
    line-height: 1.2;
  }
  .header-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
  .header-actions { display: flex; gap: 10px; align-items: center; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    padding: 8px 14px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-surface);
    color: var(--text-primary); cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .btn:hover { background: var(--bg-hover); border-color: #ccc; }
  .btn-primary {
    background: var(--accent); color: white; border-color: var(--accent);
  }
  .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-ghost { border: none; background: none; }
  .btn-ghost:hover { background: var(--bg-hover); }
  .btn-danger { color: #C62828; }
  .btn-danger:hover { background: #FFEBEE; }

  /* ── Filter Bar ── */
  .filter-bar {
    display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
    padding: 16px 0; margin-bottom: 16px;
  }
  .search-box {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 8px 12px; flex: 1; min-width: 220px;
  }
  .search-box input {
    border: none; outline: none; font-family: var(--font-body);
    font-size: 13px; width: 100%; background: transparent; color: var(--text-primary);
  }
  .search-box input::placeholder { color: var(--text-tertiary); }

  .filter-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
    border: 1px solid var(--border); background: var(--bg-surface);
    cursor: pointer; transition: all 0.15s; position: relative;
    color: var(--text-secondary);
  }
  .filter-chip:hover { border-color: #bbb; background: var(--bg-hover); }
  .filter-chip.active { border-color: var(--accent); background: var(--accent-light); color: var(--accent); }
  .filter-count {
    background: var(--accent); color: white; font-size: 10px;
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Dropdown ── */
  .dropdown-wrapper { position: relative; }
  .dropdown-menu {
    position: absolute; top: calc(100% + 4px); left: 0; z-index: 100;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
    min-width: 200px; padding: 6px; max-height: 300px; overflow-y: auto;
  }
  .dropdown-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: var(--radius-sm);
    font-size: 13px; cursor: pointer; transition: background 0.1s;
  }
  .dropdown-item:hover { background: var(--bg-hover); }
  .dropdown-check {
    width: 16px; height: 16px; border-radius: 3px;
    border: 1.5px solid var(--border); display: flex;
    align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .dropdown-check.checked {
    background: var(--accent); border-color: var(--accent);
  }

  /* ── View Tabs ── */
  .view-tabs {
    display: flex; gap: 2px; background: var(--bg-surface-alt);
    border-radius: var(--radius-sm); padding: 3px;
    border: 1px solid var(--border);
  }
  .view-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;
    color: var(--text-secondary); cursor: pointer; border: none;
    background: transparent; transition: all 0.15s;
  }
  .view-tab.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }

  /* ── Project Cards ── */
  .projects-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 16px;
  }
  .project-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 0; overflow: hidden;
    transition: all 0.2s; cursor: pointer;
  }
  .project-card:hover { border-color: #ccc; box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .project-card-header { padding: 20px 20px 0; }
  .project-card-body { padding: 12px 20px 20px; }
  .project-type-badge {
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.8px; padding: 3px 8px; border-radius: 4px;
    display: inline-block; margin-bottom: 8px;
  }
  .project-name {
    font-family: var(--font-display); font-size: 18px; font-weight: 600;
    line-height: 1.3; margin-bottom: 6px; letter-spacing: -0.2px;
  }
  .project-desc {
    font-size: 13px; color: var(--text-secondary); line-height: 1.5;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .project-meta {
    display: flex; gap: 16px; flex-wrap: wrap; padding-top: 12px;
    border-top: 1px solid var(--border-light); margin-top: 12px;
  }
  .meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: var(--text-secondary);
  }
  .meta-item svg { opacity: 0.6; }
  .location-dots { display: flex; gap: 4px; }
  .location-dot {
    font-size: 10px; font-weight: 600; padding: 2px 6px;
    border-radius: 3px; background: var(--bg-surface-alt);
    color: var(--text-secondary);
  }
  .dept-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
  .dept-tag {
    font-size: 11px; padding: 2px 8px; border-radius: 10px;
    background: var(--bg-surface-alt); color: var(--text-secondary);
  }
  .dept-tag.point { background: var(--accent-light); color: var(--accent); font-weight: 500; }
  .avatar-stack { display: flex; }
  .avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--accent-light); color: var(--accent);
    font-size: 10px; font-weight: 600; display: flex;
    align-items: center; justify-content: center;
    border: 2px solid var(--bg-surface); margin-left: -6px;
  }
  .avatar:first-child { margin-left: 0; }
  .avatar.point-person { background: var(--accent); color: white; }

  /* ── Phase badge ── */
  .phase-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; padding: 3px 10px;
    border-radius: 12px;
  }
  .phase-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* ── Timeline View ── */
  .timeline-container { overflow-x: auto; padding-bottom: 20px; }
  .timeline-header {
    display: flex; position: sticky; top: 0; z-index: 10;
    background: var(--bg-primary); border-bottom: 1px solid var(--border);
  }
  .timeline-label-col {
    min-width: 260px; width: 260px; padding: 10px 16px;
    font-size: 12px; font-weight: 600; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.5px;
    flex-shrink: 0; border-right: 1px solid var(--border);
  }
  .timeline-months { display: flex; flex: 1; }
  .timeline-month {
    flex: 1; min-width: 100px; padding: 10px 12px;
    font-size: 12px; font-weight: 500; color: var(--text-secondary);
    text-align: center; border-right: 1px solid var(--border-light);
  }
  .timeline-month.current { color: var(--accent); font-weight: 600; background: var(--accent-light); }
  .timeline-row {
    display: flex; border-bottom: 1px solid var(--border-light);
    min-height: 52px; align-items: center;
    transition: background 0.1s; cursor: pointer;
  }
  .timeline-row:hover { background: var(--bg-hover); }
  .timeline-row-label {
    min-width: 260px; width: 260px; padding: 8px 16px;
    flex-shrink: 0; border-right: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .timeline-row-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
  .timeline-bar-area { display: flex; flex: 1; position: relative; height: 52px; align-items: center; }
  .timeline-bar {
    position: absolute; height: 24px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 600; color: white;
    min-width: 20px; transition: all 0.2s;
  }

  /* ── Detail Panel ── */
  .panel-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.3);
    z-index: 200; animation: fadeIn 0.2s;
  }
  .detail-panel {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: min(680px, 95vw); background: var(--bg-surface);
    z-index: 201; overflow-y: auto; box-shadow: -8px 0 30px rgba(0,0,0,0.12);
    animation: slideIn 0.25s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

  .panel-header {
    padding: 24px 28px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--bg-surface); z-index: 10;
  }
  .panel-header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .panel-title {
    font-family: var(--font-display); font-size: 22px; font-weight: 600;
    letter-spacing: -0.3px; line-height: 1.3;
  }
  .panel-close {
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: var(--bg-surface-alt); cursor: pointer; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
    transition: background 0.15s;
  }
  .panel-close:hover { background: var(--bg-hover); }

  .panel-body { padding: 0 28px 40px; }

  .panel-section {
    padding: 20px 0; border-bottom: 1px solid var(--border-light);
  }
  .panel-section:last-child { border-bottom: none; }
  .panel-section-title {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.8px; color: var(--text-tertiary); margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }

  /* ── Links & Documents in Panel ── */
  .link-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: var(--radius-sm);
    transition: background 0.1s; cursor: pointer;
  }
  .link-row:hover { background: var(--bg-hover); }
  .link-row-text { font-size: 13px; color: var(--accent); font-weight: 500; }
  .doc-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border-light); margin-bottom: 6px;
    transition: background 0.1s;
  }
  .doc-row:hover { background: var(--bg-hover); }
  .doc-icon {
    width: 32px; height: 32px; border-radius: 6px; display: flex;
    align-items: center; justify-content: center; font-size: 10px;
    font-weight: 700; text-transform: uppercase;
  }
  .doc-icon.pdf { background: #FFEBEE; color: #C62828; }
  .doc-icon.xlsx { background: #E8F5E9; color: #2E7D32; }
  .doc-icon.docx { background: #E3F2FD; color: #1565C0; }
  .doc-name { font-size: 13px; font-weight: 500; }

  /* ── Notes ── */
  .note-card {
    padding: 12px 14px; background: var(--bg-surface-alt);
    border-radius: var(--radius-md); margin-bottom: 8px;
  }
  .note-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .note-author { font-size: 12px; font-weight: 600; }
  .note-date { font-size: 11px; color: var(--text-tertiary); }
  .note-text { font-size: 13px; line-height: 1.55; color: var(--text-secondary); }
  .note-input-area {
    display: flex; gap: 8px; margin-top: 12px;
  }
  .note-input {
    flex: 1; padding: 10px 12px; border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-family: var(--font-body);
    font-size: 13px; resize: none; outline: none;
    transition: border-color 0.15s; min-height: 40px;
  }
  .note-input:focus { border-color: var(--accent); }

  /* ── Assignee Grid ── */
  .assignee-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .assignee-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 10px; border-radius: 20px; font-size: 12px;
    background: var(--bg-surface-alt); border: 1px solid var(--border-light);
    cursor: pointer; transition: all 0.15s;
  }
  .assignee-chip:hover { border-color: #bbb; }
  .assignee-chip.assigned { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 500; }
  .assignee-chip.is-point { background: var(--accent); color: white; border-color: var(--accent); }
  .assignee-chip .chip-avatar {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--bg-hover); font-size: 9px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
  }
  .assignee-chip.assigned .chip-avatar { background: rgba(255,255,255,0.3); }
  .assignee-chip.is-point .chip-avatar { background: rgba(255,255,255,0.3); }

  /* ── Add Project Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    z-index: 300; display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s;
  }
  .modal {
    background: var(--bg-surface); border-radius: var(--radius-lg);
    width: min(600px, 92vw); max-height: 85vh; overflow-y: auto;
    box-shadow: var(--shadow-lg); animation: modalIn 0.25s ease;
  }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: none; } }
  .modal-header {
    padding: 20px 24px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 600; }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input {
    width: 100%; padding: 9px 12px; border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-family: var(--font-body);
    font-size: 13px; outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  select.form-input { cursor: pointer; }
  .multi-select-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .multi-select-option {
    padding: 5px 12px; border-radius: 20px; font-size: 12px;
    border: 1px solid var(--border); cursor: pointer;
    transition: all 0.15s; background: var(--bg-surface);
  }
  .multi-select-option:hover { border-color: #bbb; }
  .multi-select-option.selected { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 500; }

  /* ── List View ── */
  .list-table { width: 100%; border-collapse: collapse; }
  .list-table th {
    text-align: left; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px;
    color: var(--text-tertiary); padding: 10px 14px;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .list-table td {
    padding: 12px 14px; border-bottom: 1px solid var(--border-light);
    font-size: 13px; vertical-align: middle;
  }
  .list-table tr { cursor: pointer; transition: background 0.1s; }
  .list-table tbody tr:hover { background: var(--bg-hover); }

  /* ── Calendar View ── */
  .calendar-container {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
  }
  .calendar-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
  }
  .calendar-nav-title {
    font-family: var(--font-display); font-size: 18px; font-weight: 600;
    letter-spacing: -0.2px;
  }
  .calendar-nav-btns { display: flex; gap: 6px; }
  .calendar-grid-header {
    display: grid; grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--border);
  }
  .calendar-day-label {
    padding: 10px; text-align: center; font-size: 11px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    color: var(--text-tertiary);
  }
  .calendar-grid {
    display: grid; grid-template-columns: repeat(7, 1fr);
  }
  .calendar-cell {
    min-height: 110px; border-right: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light); padding: 6px;
    transition: background 0.1s; position: relative;
  }
  .calendar-cell:nth-child(7n) { border-right: none; }
  .calendar-cell:hover { background: var(--bg-hover); }
  .calendar-cell.other-month { background: var(--bg-surface-alt); opacity: 0.5; }
  .calendar-cell.today { background: var(--accent-light); }
  .calendar-date {
    font-size: 12px; font-weight: 500; color: var(--text-secondary);
    margin-bottom: 4px; padding: 2px 4px;
  }
  .calendar-date.today-num {
    background: var(--accent); color: white; border-radius: 50%;
    width: 22px; height: 22px; display: flex; align-items: center;
    justify-content: center; font-weight: 600;
  }
  .calendar-event {
    font-size: 10px; padding: 2px 6px; border-radius: 4px;
    margin-bottom: 2px; cursor: pointer; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; font-weight: 500;
    transition: opacity 0.1s; line-height: 1.6;
  }
  .calendar-event:hover { opacity: 0.8; }
  .calendar-event.meeting { background: #E3F2FD; color: #0D47A1; }
  .calendar-event.deadline { background: #FFF3E0; color: #E65100; }
  .calendar-event.milestone { background: #E8F5E9; color: #1B5E20; }
  .calendar-event.custom { background: #F3E5F5; color: #6A1B9A; }
  .calendar-legend {
    display: flex; gap: 16px; padding: 12px 20px;
    border-top: 1px solid var(--border); flex-wrap: wrap;
  }
  .calendar-legend-item {
    display: flex; align-items: center; gap: 5px; font-size: 11px;
    color: var(--text-secondary);
  }
  .calendar-legend-dot {
    width: 10px; height: 10px; border-radius: 3px;
  }
  .add-event-form {
    padding: 16px 20px; border-top: 1px solid var(--border);
    background: var(--bg-surface-alt);
  }
  .add-event-row {
    display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .projects-grid { grid-template-columns: 1fr; }
    .filter-bar { flex-direction: column; align-items: stretch; }
    .header-top { flex-direction: column; }
    .header-actions { width: 100%; justify-content: flex-end; }
    .form-row { grid-template-columns: 1fr; }
    .detail-panel { width: 100vw; }
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #aaa; }
`;

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────
const getInitials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2);

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── DROPDOWN COMPONENT ─────────────────────────────────────────────
const MultiDropdown = ({ label, options, selected, onChange, icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="dropdown-wrapper" ref={ref}>
      <div className={`filter-chip ${selected.length > 0 ? "active" : ""}`} onClick={() => setOpen(!open)}>
        {icon && <Icon name={icon} size={14} />}
        {label}
        {selected.length > 0 && <span className="filter-count">{selected.length}</span>}
        <Icon name="chevDown" size={12} />
      </div>
      {open && (
        <div className="dropdown-menu">
          {options.map(opt => (
            <div key={opt} className="dropdown-item" onClick={() => toggle(opt)}>
              <div className={`dropdown-check ${selected.includes(opt) ? "checked" : ""}`}>
                {selected.includes(opt) && <Icon name="check" size={11} color="white" />}
              </div>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── PHASE BADGE ─────────────────────────────────────────────────────
const PhaseBadge = ({ phase }) => {
  const c = PHASE_COLORS[phase] || PHASE_COLORS["Planning"];
  return (
    <span className="phase-badge" style={{ background: c.bg, color: c.text }}>
      <span className="phase-dot" style={{ background: c.dot }} />
      {phase}
    </span>
  );
};

// ─── PROJECT CARD ────────────────────────────────────────────────────
const ProjectCard = ({ project, onClick }) => {
  const typeColor = project.type === "Initiative"
    ? { bg: "#FFF8E1", color: "#F57F17" }
    : { bg: "#E8EAF6", color: "#283593" };

  return (
    <div className="project-card" onClick={() => onClick(project)}>
      <div className="project-card-header">
        <span className="project-type-badge" style={{ background: typeColor.bg, color: typeColor.color }}>
          {project.type}
        </span>
        <div className="project-name">{project.name}</div>
        <div className="project-desc">{project.description}</div>
        <div className="dept-tags">
          {project.departments.map(d => (
            <span key={d} className="dept-tag">{d}</span>
          ))}
        </div>
      </div>
      <div className="project-card-body">
        <div className="project-meta">
          <div className="meta-item">
            <PhaseBadge phase={project.phase} />
          </div>
          <div className="meta-item">
            <Icon name="pin" size={13} />
            <div className="location-dots">
              {project.locations.map(l => <span key={l} className="location-dot">{l}</span>)}
            </div>
          </div>
          <div className="meta-item">
            <Icon name="calendar" size={13} />
            {project.meetingCadence}
          </div>
          <div className="meta-item" style={{ marginLeft: "auto" }}>
            <div className="avatar-stack">
              {project.assignees.slice(0, 4).map((a, i) => (
                <div key={a} className={`avatar ${a === project.pointPerson ? "point-person" : ""}`}
                  title={a === project.pointPerson ? `${a} (Point Person)` : a}>
                  {getInitials(a)}
                </div>
              ))}
              {project.assignees.length > 4 && (
                <div className="avatar" style={{ background: "#eee", color: "#666" }}>+{project.assignees.length - 4}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TIMELINE VIEW ───────────────────────────────────────────────────
const TimelineView = ({ projects, onSelect }) => {
  const months = [];
  const now = new Date();
  for (let i = -2; i < 10; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), date: d });
  }

  const timelineStart = months[0].date.getTime();
  const timelineEnd = new Date(months[months.length - 1].date.getFullYear(), months[months.length - 1].date.getMonth() + 1, 0).getTime();
  const totalMs = timelineEnd - timelineStart;

  const getBarStyle = (project) => {
    const start = new Date(project.startDate + "T00:00:00").getTime();
    const end = new Date(project.endDate + "T00:00:00").getTime();
    const clampedStart = Math.max(start, timelineStart);
    const clampedEnd = Math.min(end, timelineEnd);
    const left = ((clampedStart - timelineStart) / totalMs) * 100;
    const width = ((clampedEnd - clampedStart) / totalMs) * 100;
    const c = PHASE_COLORS[project.phase] || PHASE_COLORS["Planning"];
    return { left: `${left}%`, width: `${Math.max(width, 1.5)}%`, background: c.dot };
  };

  const currentMonthIdx = months.findIndex(m =>
    m.date.getMonth() === now.getMonth() && m.date.getFullYear() === now.getFullYear()
  );

  return (
    <div className="timeline-container" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div className="timeline-header">
        <div className="timeline-label-col">Project / Initiative</div>
        <div className="timeline-months">
          {months.map((m, i) => (
            <div key={i} className={`timeline-month ${i === currentMonthIdx ? "current" : ""}`}>{m.label}</div>
          ))}
        </div>
      </div>
      {projects.map(p => (
        <div key={p.id} className="timeline-row" onClick={() => onSelect(p)}>
          <div className="timeline-row-label">
            <PhaseBadge phase={p.phase} />
            <span className="timeline-row-name" title={p.name}>{p.name}</span>
          </div>
          <div className="timeline-bar-area">
            <div className="timeline-bar" style={getBarStyle(p)} title={`${formatDate(p.startDate)} — ${formatDate(p.endDate)}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── LIST VIEW ───────────────────────────────────────────────────────
const ListView = ({ projects, onSelect }) => (
  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
    <table className="list-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Phase</th>
          <th>Sites</th>
          <th>Point Person</th>
          <th>Cadence</th>
          <th>Dates</th>
        </tr>
      </thead>
      <tbody>
        {projects.map(p => (
          <tr key={p.id} onClick={() => onSelect(p)}>
            <td style={{ fontWeight: 500 }}>{p.name}</td>
            <td>{p.type}</td>
            <td><PhaseBadge phase={p.phase} /></td>
            <td><div className="location-dots">{p.locations.map(l => <span key={l} className="location-dot">{l}</span>)}</div></td>
            <td>{p.pointPerson}</td>
            <td>{p.meetingCadence}</td>
            <td style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{formatDate(p.startDate)} — {formatDate(p.endDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── CALENDAR VIEW ───────────────────────────────────────────────────
const INITIAL_EVENTS = [
  { id: "e1", title: "Dysregulation Committee Kickoff", date: "2026-03-03", type: "milestone", projectId: 1 },
  { id: "e2", title: "Risk Mgmt Assessment Review", date: "2026-03-17", type: "meeting", projectId: 1 },
  { id: "e3", title: "ABC Training Session 1", date: "2026-04-07", type: "milestone", projectId: 1 },
  { id: "e4", title: "DC Expansion Budget Review", date: "2026-02-26", type: "meeting", projectId: 2 },
  { id: "e5", title: "AI Note Review Pilot Deadline", date: "2026-03-15", type: "deadline", projectId: 3 },
  { id: "e6", title: "Grand Rounds — Dr. Rivera", date: "2026-03-14", type: "meeting", projectId: 4 },
  { id: "e7", title: "Fundraising Campaign Wrap-Up", date: "2026-03-31", type: "deadline", projectId: 5 },
  { id: "e8", title: "Dashboard V1 Leadership Demo", date: "2026-02-25", type: "milestone", projectId: 6 },
];

const CalendarView = ({ projects, events: externalEvents, onAddEvent, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [events, setEvents] = useState(externalEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", type: "meeting", projectId: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Generate recurring meeting events for this month based on project cadences
  const generateMeetingEvents = useCallback(() => {
    const recurring = [];
    const dayMap = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5 };

    projects.forEach(p => {
      if (!p.meetingDay || !p.meetingCadence) return;
      const targetDay = dayMap[p.meetingDay];
      if (targetDay === undefined) return;

      // Find first occurrence of that weekday in the month
      let d = new Date(year, month, 1);
      while (d.getDay() !== targetDay) d.setDate(d.getDate() + 1);

      const interval = p.meetingCadence === "Weekly" ? 1 : p.meetingCadence === "Bi-Weekly" ? 2 : p.meetingCadence === "Monthly" ? 5 : 0;
      if (interval === 0) return;

      let weekCount = 0;
      while (d.getMonth() === month) {
        if (interval === 5) {
          // Monthly: only first occurrence
          recurring.push({
            id: `recurring-${p.id}-${d.getDate()}`,
            title: `${p.name} (${p.meetingCadence})`,
            date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
            type: "meeting",
            projectId: p.id,
            recurring: true,
          });
          break;
        }
        if (weekCount % interval === 0) {
          recurring.push({
            id: `recurring-${p.id}-${d.getDate()}`,
            title: `${p.name} (${p.meetingCadence})`,
            date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
            type: "meeting",
            projectId: p.id,
            recurring: true,
          });
        }
        d.setDate(d.getDate() + 7);
        weekCount++;
      }
    });
    return recurring;
  }, [projects, year, month]);

  const allEvents = [...events, ...generateMeetingEvents()];

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const evt = { ...newEvent, id: `custom-${Date.now()}`, projectId: newEvent.projectId ? Number(newEvent.projectId) : null };
    setEvents(prev => [...prev, evt]);
    if (onAddEvent) onAddEvent(evt);
    setNewEvent({ title: "", date: "", type: "meeting", projectId: "" });
    setShowAddEvent(false);
  };

  // Build calendar cells
  const cells = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, otherMonth: true });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false, isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear() });
  }
  // Next month leading days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, otherMonth: true });
    }
  }

  return (
    <div className="calendar-container">
      <div className="calendar-nav">
        <div className="calendar-nav-btns">
          <button className="btn btn-sm" onClick={prevMonth}>← Prev</button>
          <button className="btn btn-sm" onClick={goToday}>Today</button>
          <button className="btn btn-sm" onClick={nextMonth}>Next →</button>
        </div>
        <span className="calendar-nav-title">{monthLabel}</span>
        <button className="btn btn-sm" onClick={() => setShowAddEvent(!showAddEvent)}>
          <Icon name="plus" size={13} /> Add Event
        </button>
      </div>

      {showAddEvent && (
        <div className="add-event-form">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>New Event</div>
          <div className="add-event-row">
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <input className="form-input" placeholder="Event title" value={newEvent.title}
                onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input className="form-input" type="date" value={newEvent.date}
                onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <select className="form-input" value={newEvent.type}
                onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <select className="form-input" value={newEvent.projectId}
                onChange={e => setNewEvent(p => ({ ...p, projectId: e.target.value }))}>
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddEvent}>Add</button>
          </div>
        </div>
      )}

      <div className="calendar-grid-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((cell, i) => {
          const dayEvents = !cell.otherMonth ? getEventsForDay(cell.day) : [];
          return (
            <div key={i} className={`calendar-cell ${cell.otherMonth ? "other-month" : ""} ${cell.isToday ? "today" : ""}`}>
              <div className={`calendar-date ${cell.isToday ? "today-num" : ""}`}>{cell.day}</div>
              {dayEvents.slice(0, 3).map(evt => {
                const proj = projects.find(p => p.id === evt.projectId);
                return (
                  <div key={evt.id} className={`calendar-event ${evt.type}`}
                    title={`${evt.title}${proj ? ` — ${proj.name}` : ""}`}
                    onClick={() => proj && onSelect(proj)}>
                    {evt.title}
                  </div>
                );
              })}
              {dayEvents.length > 3 && (
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", padding: "0 6px" }}>+{dayEvents.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="calendar-legend-item"><div className="calendar-legend-dot" style={{ background: "#E3F2FD", border: "1px solid #90CAF9" }} /> Meetings</div>
        <div className="calendar-legend-item"><div className="calendar-legend-dot" style={{ background: "#FFF3E0", border: "1px solid #FFCC80" }} /> Deadlines</div>
        <div className="calendar-legend-item"><div className="calendar-legend-dot" style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }} /> Milestones</div>
        <div className="calendar-legend-item"><div className="calendar-legend-dot" style={{ background: "#F3E5F5", border: "1px solid #CE93D8" }} /> Custom</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic" }}>
          Recurring meetings auto-generated from project cadences
        </div>
      </div>
    </div>
  );
};

// ─── DETAIL PANEL ────────────────────────────────────────────────────
const DetailPanel = ({ project, onClose, onUpdate }) => {
  const [noteText, setNoteText] = useState("");
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingPhase, setEditingPhase] = useState(false);

  if (!project) return null;

  const toggleAssignee = (name) => {
    const updated = project.assignees.includes(name)
      ? { ...project, assignees: project.assignees.filter(a => a !== name) }
      : { ...project, assignees: [...project.assignees, name] };
    onUpdate(updated);
  };

  const setPointPerson = (name) => {
    const updated = { ...project, pointPerson: name };
    if (!project.assignees.includes(name)) {
      updated.assignees = [...project.assignees, name];
    }
    onUpdate(updated);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = { id: Date.now(), author: "Arthur", date: todayStr(), text: noteText.trim() };
    onUpdate({ ...project, notes: [...project.notes, note] });
    setNoteText("");
  };

  const addLink = () => {
    if (!newLink.label.trim()) return;
    onUpdate({ ...project, links: [...project.links, { ...newLink }] });
    setNewLink({ label: "", url: "" });
    setShowAddLink(false);
  };

  const changePhase = (phase) => {
    onUpdate({ ...project, phase });
    setEditingPhase(false);
  };

  const typeColor = project.type === "Initiative"
    ? { bg: "#FFF8E1", color: "#F57F17" }
    : { bg: "#E8EAF6", color: "#283593" };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="detail-panel">
        <div className="panel-header">
          <div className="panel-header-top">
            <div>
              <span className="project-type-badge" style={{ background: typeColor.bg, color: typeColor.color, marginBottom: 10, display: "inline-block" }}>
                {project.type}
              </span>
              <div className="panel-title">{project.name}</div>
            </div>
            <button className="panel-close" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 }}>{project.description}</p>
        </div>

        <div className="panel-body">
          {/* Quick Info */}
          <div className="panel-section">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div className="panel-section-title"><Icon name="clock" size={13} /> Phase</div>
                <div style={{ position: "relative" }}>
                  <div onClick={() => setEditingPhase(!editingPhase)} style={{ cursor: "pointer" }}>
                    <PhaseBadge phase={project.phase} />
                  </div>
                  {editingPhase && (
                    <div className="dropdown-menu" style={{ top: "100%", marginTop: 4 }}>
                      {PHASES.map(ph => (
                        <div key={ph} className="dropdown-item" onClick={() => changePhase(ph)}>
                          <span className="phase-dot" style={{ background: PHASE_COLORS[ph].dot, width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }} />
                          {ph}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="panel-section-title"><Icon name="pin" size={13} /> Locations</div>
                <div className="location-dots" style={{ gap: 6 }}>
                  {project.locations.map(l => <span key={l} className="location-dot" style={{ fontSize: 12, padding: "3px 10px" }}>{l}</span>)}
                </div>
              </div>
              <div>
                <div className="panel-section-title"><Icon name="calendar" size={13} /> Timeline</div>
                <div style={{ fontSize: 13 }}>{formatDate(project.startDate)} — {formatDate(project.endDate)}</div>
              </div>
              <div>
                <div className="panel-section-title"><Icon name="clock" size={13} /> Meeting Cadence</div>
                <div style={{ fontSize: 13 }}>{project.meetingCadence}{project.meetingDay ? ` · ${project.meetingDay}s` : ""}</div>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="panel-section">
            <div className="panel-section-title"><Icon name="building" size={13} /> Departments</div>
            <div className="dept-tags" style={{ gap: 6 }}>
              {project.departments.map(d => <span key={d} className="dept-tag" style={{ fontSize: 12, padding: "4px 12px" }}>{d}</span>)}
            </div>
          </div>

          {/* Links & Documents */}
          <div className="panel-section">
            <div className="panel-section-title" style={{ justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="link" size={13} /> Links & Resources</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowAddLink(!showAddLink)}>
                <Icon name="plus" size={12} /> Add
              </button>
            </div>
            {project.links.map((link, i) => (
              <div key={i} className="link-row">
                <Icon name="link" size={14} color="var(--accent)" />
                <span className="link-row-text">{link.label}</span>
              </div>
            ))}
            {showAddLink && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input className="form-input" placeholder="Label" value={newLink.label}
                  onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                  style={{ flex: 1 }} />
                <input className="form-input" placeholder="URL" value={newLink.url}
                  onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                  style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" onClick={addLink}>Add</button>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="panel-section">
            <div className="panel-section-title"><Icon name="file" size={13} /> Documents</div>
            {project.documents.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "8px 0" }}>No documents attached yet.</div>
            )}
            {project.documents.map((doc, i) => (
              <div key={i} className="doc-row">
                <div className={`doc-icon ${doc.type}`}>{doc.type}</div>
                <div className="doc-name">{doc.name}</div>
              </div>
            ))}
          </div>

          {/* Team / Assignees */}
          <div className="panel-section">
            <div className="panel-section-title"><Icon name="users" size={13} /> Team & Assignments</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
              Click to join/leave. Right-click or long-press to set as point person.
              <span style={{ marginLeft: 8, background: "var(--accent)", color: "white", padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                ★ = Point Person
              </span>
            </div>
            <div className="assignee-grid">
              {TEAM_MEMBERS.map(name => {
                const isAssigned = project.assignees.includes(name);
                const isPoint = project.pointPerson === name;
                return (
                  <div key={name}
                    className={`assignee-chip ${isAssigned ? "assigned" : ""} ${isPoint ? "is-point" : ""}`}
                    onClick={() => toggleAssignee(name)}
                    onContextMenu={(e) => { e.preventDefault(); setPointPerson(name); }}
                  >
                    <span className="chip-avatar">{getInitials(name)}</span>
                    {name}
                    {isPoint && <span style={{ fontSize: 10 }}>★</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="panel-section">
            <div className="panel-section-title"><Icon name="msg" size={13} /> Notes & Updates</div>
            {project.notes.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "8px 0" }}>No notes yet. Add the first one below.</div>
            )}
            {project.notes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <span className="note-author">{note.author}</span>
                  <span className="note-date">{formatDate(note.date)}</span>
                </div>
                <div className="note-text">{note.text}</div>
              </div>
            ))}
            <div className="note-input-area">
              <textarea className="note-input" placeholder="Add a note..." rows={2}
                value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); }}} />
              <button className="btn btn-primary btn-sm" onClick={addNote} style={{ alignSelf: "flex-end" }}>
                <Icon name="send" size={14} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── ADD PROJECT MODAL ───────────────────────────────────────────────
const AddProjectModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "", type: "Project", description: "",
    locations: [], departments: [], phase: "Planning",
    pointPerson: "", startDate: "", endDate: "",
    meetingCadence: "Weekly", meetingDay: "",
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleMulti = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
    }));
  };

  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({
      ...form, id: Date.now(),
      assignees: form.pointPerson ? [form.pointPerson] : [],
      links: [], notes: [], documents: [],
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Project / Initiative</span>
          <button className="panel-close" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Project name" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => update("type", e.target.value)}>
                <option>Project</option><option>Initiative</option><option>Focus Area</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description}
              onChange={e => update("description", e.target.value)} placeholder="Brief description..." />
          </div>
          <div className="form-group">
            <label className="form-label">Locations</label>
            <div className="multi-select-grid">
              {LOCATIONS.map(l => (
                <span key={l} className={`multi-select-option ${form.locations.includes(l) ? "selected" : ""}`}
                  onClick={() => toggleMulti("locations", l)}>{l}</span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Departments</label>
            <div className="multi-select-grid">
              {DEPARTMENTS.map(d => (
                <span key={d} className={`multi-select-option ${form.departments.includes(d) ? "selected" : ""}`}
                  onClick={() => toggleMulti("departments", d)}>{d}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phase</label>
              <select className="form-input" value={form.phase} onChange={e => update("phase", e.target.value)}>
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Point Person</label>
              <select className="form-input" value={form.pointPerson} onChange={e => update("pointPerson", e.target.value)}>
                <option value="">Select...</option>
                {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => update("startDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.endDate} onChange={e => update("endDate", e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Meeting Cadence</label>
              <select className="form-input" value={form.meetingCadence} onChange={e => update("meetingCadence", e.target.value)}>
                {MEETING_CADENCES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Day</label>
              <select className="form-input" value={form.meetingDay} onChange={e => update("meetingDay", e.target.value)}>
                <option value="">Select...</option>
                {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>
            <Icon name="plus" size={14} color="white" /> Create
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────
function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterLocations, setFilterLocations] = useState([]);
  const [filterDepts, setFilterDepts] = useState([]);
  const [filterPhases, setFilterPhases] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterLocations.length && !filterLocations.some(l => p.locations.includes(l))) return false;
    if (filterDepts.length && !filterDepts.some(d => p.departments.includes(d))) return false;
    if (filterPhases.length && !filterPhases.includes(p.phase)) return false;
    if (filterType.length && !filterType.includes(p.type)) return false;
    return true;
  });

  const updateProject = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  const addProject = (proj) => {
    setProjects(prev => [...prev, proj]);
  };

  const clearFilters = () => {
    setFilterLocations([]); setFilterDepts([]); setFilterPhases([]); setFilterType([]); setSearch("");
  };

  const hasFilters = filterLocations.length || filterDepts.length || filterPhases.length || filterType.length || search;

  return (
    <>
      <style>{CSS}</style>
      <div className="dashboard">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div>
              <h1>Leadership Command Center</h1>
              <div className="header-subtitle">iBRAIN — Projects, Initiatives & Strategic Focuses across all sites</div>
            </div>
            <div className="header-actions">
              <div className="view-tabs">
                <button className={`view-tab ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>
                  <Icon name="grid" size={14} /> Cards
                </button>
                <button className={`view-tab ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
                  <Icon name="list" size={14} /> List
                </button>
                <button className={`view-tab ${view === "timeline" ? "active" : ""}`} onClick={() => setView("timeline")}>
                  <Icon name="timeline" size={14} /> Timeline
                </button>
                <button className={`view-tab ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>
                  <Icon name="calendar" size={14} /> Calendar
                </button>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Icon name="plus" size={14} color="white" /> New Project
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-box">
            <Icon name="search" size={16} color="var(--text-tertiary)" />
            <input placeholder="Search projects & initiatives..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <MultiDropdown label="Location" options={LOCATIONS} selected={filterLocations} onChange={setFilterLocations} icon="pin" />
          <MultiDropdown label="Department" options={DEPARTMENTS} selected={filterDepts} onChange={setFilterDepts} icon="building" />
          <MultiDropdown label="Phase" options={PHASES} selected={filterPhases} onChange={setFilterPhases} icon="clock" />
          <MultiDropdown label="Type" options={["Project", "Initiative", "Focus Area"]} selected={filterType} onChange={setFilterType} icon="star" />
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <Icon name="x" size={12} /> Clear
            </button>
          )}
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto" }}>
            {filtered.length} of {projects.length} items
          </span>
        </div>

        {/* Content */}
        {view === "grid" && (
          <div className="projects-grid">
            {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={setSelectedProject} />)}
          </div>
        )}
        {view === "list" && <ListView projects={filtered} onSelect={setSelectedProject} />}
        {view === "timeline" && <TimelineView projects={filtered} onSelect={setSelectedProject} />}
        {view === "calendar" && <CalendarView projects={filtered} events={INITIAL_EVENTS} onSelect={setSelectedProject} />}

        {filtered.length === 0 && view !== "calendar" && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-tertiary)" }}>
            <Icon name="search" size={32} color="var(--text-tertiary)" />
            <p style={{ marginTop: 12, fontSize: 14 }}>No projects match your current filters.</p>
            <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={clearFilters}>Clear all filters</button>
          </div>
        )}

        {/* Detail Panel */}
        {selectedProject && (
          <DetailPanel
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdate={updateProject}
          />
        )}

        {/* Add Modal */}
        {showAddModal && (
          <AddProjectModal onClose={() => setShowAddModal(false)} onAdd={addProject} />
        )}
      </div>
    </>
  );
}

export default App;
