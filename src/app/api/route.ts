// GET /api: lists the available endpoints.
export function GET() {
  return Response.json({
    name: "dhio-portfolio API",
    version: 1,
    endpoints: {
      "GET /api/profile": "Profile and focus areas",
      "GET /api/projects": "All projects (case files)",
      "GET /api/projects/{slug}": "One project by slug",
      "GET /api/experience": "Organisations and roles",
      "GET /api/certifications": "Certificates",
      "GET /api/skills": "Skill groups with where each skill was used",
    },
  });
}
