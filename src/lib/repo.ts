import { certifications, experience, pillars, profile, projects, skills } from "./data";

/*
 * Data access layer. Pages and API routes only call these functions, never the
 * data module directly, so the source can be swapped for a database later.
 */

export async function getProfile() {
  return profile;
}

export async function getPillars() {
  return pillars;
}

export async function listProjects() {
  return projects;
}

export async function getProject(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function listExperience() {
  return experience;
}

export async function listCertifications() {
  return certifications;
}

export async function listSkills() {
  return skills;
}
