import { ArrowUpRight, Check, Fingerprint, Globe2, ShieldCheck, Sprout } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { ConceptForm } from "./ConceptForm";
import { CivicArtwork, AtlasArtwork, FieldArtwork } from "./ConceptArtwork";
import type { LoginDesign } from "./designs";
import { EditorialVariants } from "./EditorialVariants";
import { BRAND } from "@/lib/brand";

function Brand() {
  return (
    <div className="concept-brand">
      <BrandMark className="concept-brand__mark" />
      <div>
        <p>{BRAND.name}</p>
        <span>{BRAND.tagline.toUpperCase()}</span>
      </div>
    </div>
  );
}

export function LoginConcept({ design }: { design: LoginDesign }) {
  if (
    design === "ledger" ||
    design === "portico" ||
    design === "obsidian" ||
    design === "ember" ||
    design === "ember-ledger"
  ) {
    return <EditorialVariants design={design} brand={<Brand />} />;
  }
  if (design === "civic")
    return (
      <div className="login-concept concept-civic" data-design={design}>
        <section className="civic-story">
          <Brand />
          <div className="civic-story__body">
            <p className="concept-overline">EVIDENCE WITH PURPOSE</p>
            <h2>
              Small insights.
              <br />
              <em>Meaningful change.</em>
            </h2>
            <p className="concept-story-copy">
              Every assessment starts with a question. Build flexible forms and bring your evidence
              into one clear view.
            </p>
            <CivicArtwork />
          </div>
          <div className="concept-story-footer">
            <span>Rooted in local knowledge.</span>
            <span>Built for collective progress.</span>
          </div>
        </section>
        <section className="civic-login">
          <span className="concept-corner-note">
            <ShieldCheck size={14} />
            Administration portal
          </span>
          <ConceptForm
            heading="A welcome return."
            introduction="Your forms, your evidence, your next decision. Sign in to your workspace."
          />
          <p className="concept-bottom-note">{BRAND.descriptor}</p>
        </section>
      </div>
    );
  if (design === "atlas")
    return (
      <div className="login-concept concept-atlas" data-design={design}>
        <section className="atlas-login">
          <Brand />
          <ConceptForm
            heading="Connect to your workspace."
            introduction="One place to review evidence, understand performance, and move your team forward."
          />
          <p className="concept-bottom-note">
            <ShieldCheck size={13} />
            Your team. One connected workspace.
          </p>
        </section>
        <section className="atlas-story">
          <div className="atlas-story__top">
            <span>
              <Globe2 size={16} />
              YOUR QUESTIONS. SHARED PERSPECTIVE.
            </span>
            <ArrowUpRight size={22} />
          </div>
          <AtlasArtwork />
          <div className="atlas-story__body">
            <p className="concept-overline">SEE THE CONNECTIONS</p>
            <h2>
              Every assessment.
              <br />A bigger picture.
            </h2>
            <p>
              Turn field evidence into a shared understanding of where you are—and where to go next.
            </p>
          </div>
          <span className="atlas-caption">COLLECT / CONNECT / UNDERSTAND</span>
        </section>
      </div>
    );
  if (design === "focus")
    return (
      <div className="login-concept concept-focus" data-design={design}>
        <header className="focus-header">
          <Brand />
          <span className="concept-corner-note">Administration portal</span>
        </header>
        <main className="focus-main">
          <div className="focus-orbit" aria-hidden="true" />
          <div className="focus-card">
            <span className="focus-symbol">
              <Fingerprint size={27} strokeWidth={1.4} />
            </span>
            <ConceptForm
              heading="Good to see you again."
              introduction="A little clarity for the work ahead. Sign in to your assessment workspace."
            />
          </div>
        </main>
        <footer className="focus-footer">
          <span>{BRAND.name}</span>
          <span>{BRAND.tagline}</span>
        </footer>
      </div>
    );
  if (design === "nocturne")
    return (
      <div className="login-concept concept-nocturne" data-design={design}>
        <div className="nocturne-glow" aria-hidden="true" />
        <header className="nocturne-header">
          <Brand />
          <span className="concept-corner-note">
            <ShieldCheck size={14} />
            Administration portal
          </span>
        </header>
        <main className="nocturne-main">
          <section className="nocturne-story">
            <p className="concept-overline">
              <span />
              PURPOSE IN EVERY MEASURE
            </p>
            <h2>
              Make progress.
              <br />
              <span>
                Make it <br />
                measurable.
              </span>
            </h2>
            <p className="concept-story-copy">
              When your team sees the same evidence, the way forward becomes clearer.
            </p>
            <div className="nocturne-line" aria-hidden="true">
              <svg viewBox="0 0 460 94" fill="none">
                <path d="M0 75H460M0 40H460M0 5H460" stroke="#FFFFFF" strokeOpacity=".08" />
                <path
                  d="M0 83L65 66L129 71L195 45L260 53L323 25L390 34L456 5"
                  stroke="#D9AB64"
                  strokeWidth="2"
                />
                <circle cx="323" cy="25" r="5" fill="#D9AB64" />
                <circle cx="456" cy="5" r="5" fill="#D9AB64" />
              </svg>
              <span>Clarity creates momentum.</span>
            </div>
          </section>
          <section className="nocturne-card">
            <ConceptForm
              heading="Your next move starts here."
              introduction="Sign in to your workspace and pick up where your team left off."
            />
          </section>
        </main>
        <footer className="nocturne-footer">
          <span>{BRAND.descriptor}</span>
          <span>PRAXIS / WORKSPACE</span>
        </footer>
      </div>
    );
  return (
    <div className="login-concept concept-fieldwork" data-design={design}>
      <header className="fieldwork-header">
        <Brand />
        <span className="concept-corner-note">
          <Sprout size={16} />
          Progress starts locally.
        </span>
      </header>
      <main className="fieldwork-main">
        <div className="fieldwork-card">
          <section className="fieldwork-story">
            <p className="concept-overline">CLOSER TO THE WORK THAT MATTERS</p>
            <h2>
              On the ground.
              <br />
              <em>Looking ahead.</em>
            </h2>
            <FieldArtwork />
            <p className="concept-story-copy">
              The most useful perspective starts in the field. Bring local insight into your next
              decision.
            </p>
            <div className="fieldwork-footnote">
              <Check size={14} />
              One workspace. A shared sense of direction.
            </div>
          </section>
          <section className="fieldwork-login">
            <ConceptForm
              heading="Come on in."
              introduction="Sign in to connect with your team and keep good work growing."
            />
          </section>
        </div>
      </main>
      <footer className="fieldwork-footer">Made for the people behind the progress.</footer>
    </div>
  );
}
