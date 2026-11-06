import { Cases } from "@/components/Cases";
import { Contact } from "@/components/Contact";
import { Credentials } from "@/components/Credentials";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MirrorFigure } from "@/components/MirrorFigure";
import { ProfileSection } from "@/components/ProfileSection";
import { RecordTimeline } from "@/components/Record";
import { SectionHead } from "@/components/SectionHead";
import { Toolkit } from "@/components/Toolkit";
import {
  getPillars,
  getProfile,
  listCertifications,
  listExperience,
  listProjects,
  listSkills,
} from "@/lib/repo";

export default async function Home() {
  const [profile, pillars, projects, experience, certifications, skills] = await Promise.all([
    getProfile(),
    getPillars(),
    listProjects(),
    listExperience(),
    listCertifications(),
    listSkills(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero profile={profile} />
        <ProfileSection profile={profile} pillars={pillars} />
        <Cases projects={projects} />

        <section id="record" className="shell scroll-mt-20 py-24 md:py-36">
          <SectionHead
            index="03"
            label="Record"
            title={["Where I've", "been working."]}
            intro="Most of my hands-on time goes into the BINUS Cyber Security Community, where I build and review CTF challenges."
          />
          <div className="relative">
            <MirrorFigure />
            <RecordTimeline experience={experience} />
          </div>
        </section>

        <section id="credentials" className="shell scroll-mt-20 py-24 md:py-36">
          <SectionHead index="04" label="Credentials" title={["Verified", "and filed."]} />
          <Credentials items={certifications} />
        </section>

        <section id="toolkit" className="shell scroll-mt-20 py-24 md:py-36">
          <SectionHead
            index="05"
            label="Toolkit"
            title={["Tools, with", "receipts."]}
            intro="Only skills I can point to. Each one lists where it was used: a project, my home lab, a certificate or the CSC. Hover one to light up everything from the same place."
          />
          <Toolkit groups={skills} />
        </section>

        <Contact profile={profile} />
      </main>
      <Footer />
    </>
  );
}
