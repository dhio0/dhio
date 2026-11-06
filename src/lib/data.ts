import type { Certification, Experience, Pillar, Profile, Project, SkillGroup } from "./types";

/*
 * All site content lives here. The REST API in src/app/api reads it through
 * src/lib/repo.ts, so moving it into a database later only changes the repo layer.
 */

export const profile: Profile = {
  name: "Dhio Padda",
  fullName: "Dhio Umbu Pundar Padda",
  role: "Computer Science student",
  headline:
    "Cybersecurity-focused Computer Science student. I build security tools in Python, break and secure web apps through CTF challenges, and practise detection and incident response in my own SIEM lab.",
  statement:
    "I'm a third-year Computer Science student at BINUS University who wants to know exactly how systems get broken into, and how to catch it when they do. I write web exploitation challenges for CTF contests, build tools that automate recon and forensics instead of doing it by hand, and run a small lab with Wazuh and Splunk to practise detection and incident response. Frameworks like the NIST CSF keep that work tied to how real security teams manage risk.",
  location: "Jakarta, Indonesia",
  university: "BINUS University",
  program: "B.Sc. Computer Science",
  since: 2024,
  focus: ["Web application security", "Detection & incident response", "Security tooling"],
  tools: ["Python", "Linux", "Burp Suite", "Wazuh", "Splunk", "Wireshark", "Docker", "Git"],
  status: "Open to internship",
  email: "",
  phone: { display: "+62 812-4696-7728", e164: "6281246967728" },
  cvUrl: "",
  links: {
    github: "https://github.com/dhio0",
    linkedin: "https://www.linkedin.com/in/dhioo/",
  },
};

export const pillars: Pillar[] = [
  {
    key: "Break",
    title: "Web exploitation",
    text: "I solve and author web CTF challenges: injection, eval and filter bypasses, unrestricted file upload. Writing a challenge means proving there is exactly one way in.",
    tools: ["Burp Suite", "Python", "Flask"],
  },
  {
    key: "Detect",
    title: "Detection & response",
    text: "A home lab with Wazuh and Splunk where I generate attacks and read what the logs and alerts say about them, following the incident response lifecycle.",
    tools: ["Wazuh", "Splunk", "Wireshark"],
  },
  {
    key: "Build",
    title: "Security tooling",
    text: "When a task repeats, I write the tool: recon that triages its own findings, and forensics that rebuilds an attack from server logs with every claim cited.",
    tools: ["Python", "Linux", "Docker"],
  },
];

export const projects: Project[] = [
  {
    slug: "webforensics",
    code: "001",
    title: "webforensics",
    tagline: "Reconstructs how a website was compromised, from the webroot back to the entry point.",
    year: "2026",
    kind: "Forensics tool · Python",
    problem:
      "When a site is defaced or backdoored, the admin is left with a webroot full of files, millions of log lines and no idea how the attacker got in. Most tools flag scary-looking requests; few explain the chain.",
    approach:
      "It starts from the suspicious file the way an analyst does, finds the request that wrote it, and walks back to the login, exploited endpoint or upload that let the attacker in. Every conclusion cites a log line or a file hash. No LLM and no network in the analysis, so the same evidence always gives the same report, written in Indonesian and viewable offline.",
    evidence: [
      "5 of 5 lab scenarios solved, through plain files and through the Wazuh indexer",
      "7.4M log lines from two public-sector servers processed in one 3.7-minute run",
      "34 of 35 real injected gambling pages found; 0 of 11 news pages about gambling misflagged",
      "Names the vulnerable PHP line of an SQL injection and shows the prepared-statement fix",
      "Maps the attack timeline to MITRE ATT&CK; Wazuh integration sends findings back as alerts",
    ],
    stack: ["Python", "Wazuh", "MITRE ATT&CK", "Docker lab", "pytest", "GitHub Actions"],
    links: [
      { label: "Source", href: "https://github.com/dhio0/webforensics" },
      { label: "Live viewer", href: "https://dhio0.github.io/webforensics/examples/scenario_f.viewer.html" },
    ],
    showcase: "webforensics",
  },
  {
    slug: "webxplo",
    code: "002",
    title: "webxplo",
    tagline: "Web reconnaissance with an AI advisor that suggests where to look, never how to exploit.",
    year: "2026",
    kind: "Recon tool · Python",
    problem:
      "Recon on a new web target is the same routine every time: crawl the page, guess the stack, dig through bundled JavaScript for endpoints nobody linked to. It is slow by hand and easy to skip steps.",
    approach:
      "A pipeline of small, separately tested Python modules collects the findings into one structured report, then makes a single call to the Anthropic API for a prioritised list of vulnerability classes to investigate. The prompt asks for leads, not payloads.",
    evidence: [
      "Fingerprints PHP, Java, Laravel and Express from headers and session cookie names",
      "Pulls hidden API endpoints out of linked JavaScript while filtering static-asset noise",
      "One API call per scan, about $0.01 to $0.02 with the default model",
      "Documents its own false-positive case: SPAs that answer 200 to every path",
    ],
    stack: ["Python", "Requests", "BeautifulSoup", "Anthropic API", "pytest"],
    links: [{ label: "Source", href: "https://github.com/dhio0/webxplo" }],
    pipeline: [
      { name: "crawler", note: "forms, links, comments, cookies, headers" },
      { name: "fingerprint", note: "stack from Server, X-Powered-By, cookies" },
      { name: "js_analyzer", note: "hidden endpoints in bundled JS" },
      { name: "common_paths", note: "admin and sensitive paths" },
      { name: "aggregator", note: "one structured report" },
      { name: "advisor", note: "Claude returns investigation leads" },
    ],
  },
  {
    slug: "ctf-challenges",
    code: "003",
    title: "CTF challenges",
    tagline: "Web exploitation challenges built to be broken, but only the intended way.",
    year: "2026",
    kind: "Challenge author · Flask · Docker",
    problem:
      "A good CTF challenge has one real path to the flag, no accidental shortcuts, and has to stay up while a whole contest hammers it at once.",
    approach:
      "Registry looks like a lab-assistant sign-up form. A hint in the page source points to a header that switches the bio field into Python eval(), guarded by a keyword blacklist and a regex filter for hex, unicode and path tricks. Players get past both by rebuilding strings with chr(). It ran in the BINUS Cyber Security Community CTF Contest 2026. Furab, my author trial, is an upload filter bypassed through a hidden header and an Apache .htaccess rule.",
    evidence: [
      "Registry ran in CSC CTF Contest 2026 as a medium web challenge",
      "Two deliberate layers of defence, each with exactly one intended weakness",
      "Intended path re-verified end to end: hidden header, eval mode, chr() bypass, flag",
      "Shipped with Docker Compose; full writeups with screenshots for both challenges",
    ],
    stack: ["Python", "Flask", "Docker", "Apache", "Burp Suite", "Regex"],
    links: [{ label: "Challenges & writeups", href: "https://github.com/dhio0/ctf-challenge-authoring" }],
    showcase: "registry",
  },
];

export const experience: Experience[] = [
  {
    org: "Cyber Security Community",
    orgNote: "BINUS University student community",
    location: "Palmerah, Jakarta",
    type: "work",
    roles: [
      {
        title: "Activist, Research & Development",
        period: "Dec 2025 – Present",
        start: "2025-12",
        end: null,
        summary:
          "Prepare and review CTF competition challenges with the R&D team, and take part in the division's technical research on web exploitation and system security.",
        skills: ["Web application security", "Linux", "Team collaboration"],
      },
      {
        title: "CTF Challenge Developer · CSC CTF Contest 2026",
        period: "May 2026 – Jun 2026",
        start: "2026-05",
        end: "2026-06",
        summary:
          "Designed, built and deployed web exploitation challenges for the contest, including Registry. Set up the containerised environments, verified each vulnerability worked only as intended, and wrote the documentation.",
        skills: ["Web application security", "Docker", "Vulnerability assessment"],
      },
      {
        title: "Member, Research & Development",
        period: "Nov 2025 – Dec 2025",
        start: "2025-11",
        end: "2025-12",
        summary:
          "Joined as an R&D student member. Took part in internal workshops, CTF solving sessions and research on web exploitation and system security.",
        skills: ["Capture the Flag", "Penetration testing"],
      },
    ],
  },
  {
    org: "BINUS University",
    orgNote: "School of Computer Science",
    location: "Jakarta",
    type: "education",
    roles: [
      {
        title: "B.Sc. Computer Science",
        period: "2024 – Present",
        start: "2024-09",
        end: null,
        summary: "Currently in semester 5. Programming coursework in Python, C++ and Java alongside the security work above.",
        skills: ["Python", "C++", "Linux"],
      },
    ],
  },
];

export const certifications: Certification[] = [
  {
    title: "Google Cybersecurity Professional Certificate",
    issuer: "Google · Coursera",
    issued: "Oct 2026",
    credentialId: "IRW4A4IQLJGM",
    verifyUrl: "https://coursera.org/share/33224b9daff5c84e15f4b9b7b5f0885a",
    file: "/certs/google-cybersecurity.pdf",
    image: { src: "/certs/google-cybersecurity.webp", width: 1650, height: 1275 },
    courses: [
      "Foundations of Cybersecurity",
      "Play It Safe: Manage Security Risks",
      "Connect and Protect: Networks and Network Security",
      "Tools of the Trade: Linux and SQL",
      "Assets, Threats, and Vulnerabilities",
      "Sound the Alarm: Detection and Response",
      "Automate Cybersecurity Tasks with Python",
      "Put It to Work: Prepare for Cybersecurity Jobs",
      "Accelerate Your Job Search with AI",
    ],
    summary:
      "Nine hands-on courses: NIST CSF and risk management, network security, Linux and SQL, threat detection, SIEM with Splunk and Chronicle, incident response and Python automation.",
  },
  {
    title: "Java Programming",
    issuer: "BNCC, BINUS University",
    issued: "Jul 2025",
    grade: "High Distinction",
    credentialId: "001/LNT/III/MEMBER/BNCC/KMG/XXXVI/07.2025",
    idLabel: "Certificate no.",
    file: "/certs/bncc-java.pdf",
    image: { src: "/certs/bncc-java.webp", width: 1567, height: 1114 },
    summary:
      "Learning and Training class on object-oriented Java (2024/2025), finished with a JavaFX and MySQL project. Completed with High Distinction.",
  },
];

const P = (label: string, slug: string) => ({ label, kind: "project" as const, href: `#case-${slug}` });
const LAB = { label: "Home lab", kind: "lab" as const };
const GCERT = { label: "Google certificate", kind: "cert" as const, href: "#credentials" };
const CSC = { label: "CSC R&D", kind: "org" as const, href: "#record" };

export const skills: SkillGroup[] = [
  {
    group: "Offense",
    note: "Finding and proving web vulnerabilities",
    skills: [
      { name: "Web application security", evidence: [P("CTF challenges", "ctf-challenges"), P("webxplo", "webxplo"), CSC] },
      { name: "Penetration testing & vulnerability assessment", evidence: [CSC, GCERT] },
      { name: "Burp Suite", evidence: [P("Registry & Furab", "ctf-challenges")] },
      { name: "Capture the Flag", evidence: [CSC, P("CTF challenges", "ctf-challenges")] },
    ],
  },
  {
    group: "Defense",
    note: "Detecting attacks and explaining them",
    skills: [
      { name: "Incident response & digital forensics", evidence: [P("webforensics", "webforensics"), GCERT] },
      { name: "Log analysis & threat detection", evidence: [P("webforensics", "webforensics"), LAB] },
      { name: "SIEM · Wazuh", evidence: [P("webforensics", "webforensics"), LAB] },
      { name: "SIEM · Splunk", evidence: [LAB, GCERT] },
      { name: "Network traffic analysis · Wireshark", evidence: [GCERT] },
      { name: "NIST CSF & risk management", evidence: [GCERT] },
    ],
  },
  {
    group: "Build",
    note: "What the tools and labs are made of",
    skills: [
      { name: "Python", evidence: [P("webforensics", "webforensics"), P("webxplo", "webxplo"), P("Registry", "ctf-challenges")] },
      { name: "Linux & Bash", evidence: [LAB, CSC, P("webforensics", "webforensics")] },
      { name: "Docker", evidence: [P("Registry", "ctf-challenges"), P("webforensics lab", "webforensics")] },
      { name: "Git & GitHub", evidence: [{ label: "Every project", kind: "project", href: "https://github.com/dhio0" }] },
      { name: "Java · C++", evidence: [{ label: "BNCC course", kind: "course", href: "#credentials" }, { label: "BINUS", kind: "course" }] },
    ],
  },
];
