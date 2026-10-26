import type { ReactNode } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { ConceptForm } from "./ConceptForm";
import { BRAND } from "@/lib/brand";

type EditorialDesign = "ledger" | "portico" | "obsidian" | "ember" | "ember-ledger";

function GateSeal() {
  return (
    <svg className="ledger-seal" viewBox="0 0 300 300" fill="none" aria-hidden="true">
      <circle cx="150" cy="150" r="138" stroke="currentColor" strokeOpacity=".3" />
      <circle cx="150" cy="150" r="124" stroke="currentColor" strokeOpacity=".15" />
      <path
        d="M72 220V140a78 78 0 0 1 156 0v80M92 220V140a58 58 0 0 1 116 0v80M113 220V140a37 37 0 0 1 74 0v80M133 220V140a17 17 0 0 1 34 0v80M53 220H247"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M150 24V38M150 262V276M24 150H38M262 150H276" stroke="currentColor" />
      <circle cx="150" cy="61" r="3" fill="currentColor" />
    </svg>
  );
}

function PorticoArtwork() {
  return (
    <svg className="portico-art" viewBox="0 0 500 350" fill="none" aria-hidden="true">
      <rect width="500" height="350" fill="#E7C6AB" />
      <circle cx="375" cy="79" r="42" fill="#F3DFC4" />
      <path d="M64 350V146a132 132 0 0 1 264 0v204" fill="#BD7755" />
      <path d="M98 350V151a98 98 0 0 1 196 0v199" fill="#D6A582" />
      <path d="M128 350V157a68 68 0 0 1 136 0v193" fill="#713E32" />
      <path d="M151 350V158a45 45 0 0 1 90 0v192" fill="#F4E4CD" />
      <path d="M211 159h30v191h-30z" fill="#DEC9AB" />
      <path d="M324 350V234H477V350" fill="#B36A4B" />
      <path d="M350 350V260H451V350" fill="#DCAA87" />
      <path d="M376 350V286H425V350" fill="#F2D8B8" />
      <path d="M0 317H64M0 335H64M328 215H477" stroke="#F8E6D0" strokeOpacity=".5" />
      <path d="M48 350L131 281H185L64 350M237 350L477 350" fill="#955039" fillOpacity=".25" />
    </svg>
  );
}

function OrbitalArtwork() {
  return (
    <svg className="obsidian-orbit" viewBox="0 0 540 460" fill="none" aria-hidden="true">
      <circle cx="270" cy="230" r="176" stroke="currentColor" strokeOpacity=".15" />
      <circle cx="270" cy="230" r="143" stroke="currentColor" strokeOpacity=".25" />
      <circle cx="270" cy="230" r="106" stroke="currentColor" strokeOpacity=".4" />
      <ellipse
        cx="270"
        cy="230"
        rx="231"
        ry="74"
        transform="rotate(-28 270 230)"
        stroke="currentColor"
        strokeOpacity=".4"
      />
      <path
        d="M270 7V453M46 230H494"
        stroke="currentColor"
        strokeOpacity=".12"
        strokeDasharray="3 7"
      />
      <circle
        cx="270"
        cy="230"
        r="45"
        fill="currentColor"
        fillOpacity=".07"
        stroke="currentColor"
        strokeOpacity=".25"
      />
      <path d="M250 243V225M270 243V209M290 243V218" stroke="currentColor" strokeWidth="4" />
      <circle cx="376" cy="89" r="5" fill="currentColor" />
      <circle cx="145" cy="310" r="4" fill="currentColor" />
      <circle cx="376" cy="89" r="14" stroke="currentColor" strokeOpacity=".25" />
      <path
        d="M36 52H54M45 43V61M479 391H497M488 382V400"
        stroke="currentColor"
        strokeOpacity=".5"
      />
    </svg>
  );
}

function EmberArtwork() {
  return (
    <svg className="ember-art" viewBox="0 0 530 205" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="ember-columns"
          x1="0"
          y1="0"
          x2="0"
          y2="205"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E0A484" stopOpacity=".85" />
          <stop offset="1" stopColor="#E0A484" stopOpacity=".04" />
        </linearGradient>
      </defs>
      {[85, 125, 163, 195, 165, 132, 100, 65].map((height, index) => (
        <g key={height}>
          <rect
            x={index * 64 + 8}
            y={205 - height}
            width="42"
            height={height}
            rx="21"
            fill="url(#ember-columns)"
          />
          <path
            d={`M${index * 64 + 29} ${205 - height + 18}V205`}
            stroke="#EFC3A8"
            strokeOpacity=".18"
          />
        </g>
      ))}
    </svg>
  );
}

export function EditorialVariants({
  design,
  brand,
}: {
  design: EditorialDesign;
  brand: ReactNode;
}) {
  if (design === "ember-ledger")
    return (
      <div className="login-concept concept-fusion" data-design={design}>
        <header className="fusion-header">
          {brand}
          <span className="variant-header-note">THINK CLEARLY. ACT WITH PURPOSE.</span>
        </header>
        <main className="fusion-main">
          <section className="fusion-story">
            <p className="concept-overline">
              <span />A SHARED RECORD. A CLEARER FUTURE.
            </p>
            <h2>
              From insight.
              <br />
              To grounded <br />
              <em>action.</em>
            </h2>
            <div className="fusion-story__bottom">
              <div className="fusion-seal">
                <GateSeal />
              </div>
              <div>
                <span className="fusion-story-label">PERSPECTIVE WITH PURPOSE</span>
                <p className="concept-story-copy">
                  Build flexible assessments, bring evidence into focus, and ground your next
                  decision in what you learn.
                </p>
              </div>
            </div>
            <div className="fusion-story-rule">
              <span>EVIDENCE</span>
              <span>INSIGHT</span>
              <span>
                ACTION <ArrowUpRight size={12} />
              </span>
            </div>
          </section>
          <section className="fusion-login">
            <div className="fusion-chapter">
              <span>01 / YOUR WORKSPACE</span>
              <ShieldCheck size={15} />
            </div>
            <ConceptForm
              heading="A welcome return."
              introduction="Your forms, your evidence, your next decision. Sign in to your workspace."
            />
            <div className="fusion-login-note">
              <span />
              Built for shared understanding.
            </div>
          </section>
        </main>
        <footer className="fusion-footer">
          <span>{BRAND.tagline}</span>
          <span>PRAXIS / ASSESSMENT WORKSPACE</span>
        </footer>
      </div>
    );
  if (design === "ledger")
    return (
      <div className="login-concept concept-ledger" data-design={design}>
        <header className="ledger-header">
          {brand}
          <span className="variant-header-note">THE ASSESSMENT JOURNAL</span>
        </header>
        <main className="ledger-main">
          <section className="ledger-story">
            <p className="concept-overline">A SHARED RECORD. A CLEARER FUTURE.</p>
            <h2>
              Good decisions <br />
              begin with
              <br />
              <em>good evidence.</em>
            </h2>
            <div className="ledger-story__bottom">
              <GateSeal />
              <p className="concept-story-copy">
                A flexible space to build assessments, collect evidence, and understand results.
              </p>
            </div>
          </section>
          <section className="ledger-login">
            <span className="ledger-chapter">01 / YOUR WORKSPACE</span>
            <ConceptForm
              heading="Welcome back."
              introduction="Return to your team’s shared record. Your next chapter starts here."
            />
          </section>
        </main>
        <footer className="variant-footer">
          <span>Local understanding. Lasting progress.</span>
          <span>EVIDENCE / INSIGHT / ACTION</span>
        </footer>
      </div>
    );
  if (design === "portico")
    return (
      <div className="login-concept concept-portico" data-design={design}>
        <header className="portico-header">
          {brand}
          <span className="variant-header-note">A PLACE FOR BETTER PERSPECTIVE</span>
        </header>
        <main className="portico-main">
          <div className="portico-spread">
            <section className="portico-story">
              <p className="concept-overline">OPEN THE WAY FORWARD</p>
              <h2>
                A little insight.
                <br />
                <em>A wider horizon.</em>
              </h2>
              <PorticoArtwork />
              <div className="portico-caption">
                <span>Built on understanding.</span>
                <ArrowUpRight size={17} />
              </div>
            </section>
            <section className="portico-login">
              <span className="portico-edition">ASSESSMENT / ADMINISTRATION</span>
              <ConceptForm
                heading="Step inside."
                introduction="Bring local knowledge into focus. Sign in to your assessment workspace."
              />
              <p className="portico-login-note">
                <ShieldCheck size={13} />A shared space for your team.
              </p>
            </section>
          </div>
        </main>
        <footer className="portico-footer">Thoughtful work starts with a clear view.</footer>
      </div>
    );
  if (design === "obsidian")
    return (
      <div className="login-concept concept-obsidian" data-design={design}>
        <header className="obsidian-header">
          {brand}
          <span className="variant-header-note">
            <ShieldCheck size={13} />
            ADMINISTRATION PORTAL
          </span>
        </header>
        <main className="obsidian-main">
          <section className="obsidian-login">
            <span className="obsidian-index">WORKSPACE ACCESS / 01</span>
            <ConceptForm
              heading="Back to what matters."
              introduction="Your team’s evidence, insight, and direction. All in one place."
            />
          </section>
          <section className="obsidian-story">
            <OrbitalArtwork />
            <div className="obsidian-story__copy">
              <p className="concept-overline">BRING IT ALL INTO ALIGNMENT</p>
              <h2>
                Perspective.
                <br />
                <em>With purpose.</em>
              </h2>
              <p className="concept-story-copy">
                Find the connections that turn understanding into progress.
              </p>
            </div>
          </section>
        </main>
        <footer className="variant-footer">
          <span>Clarity in every connection.</span>
          <span>ASSESSMENT WORKSPACE</span>
        </footer>
      </div>
    );
  return (
    <div className="login-concept concept-ember" data-design={design}>
      <header className="ember-header">
        {brand}
        <span className="variant-header-note">LOCAL INSIGHT. LASTING IMPACT.</span>
      </header>
      <main className="ember-main">
        <section className="ember-story">
          <p className="concept-overline">
            <span />
            TURN UNDERSTANDING INTO MOMENTUM
          </p>
          <h2>
            See clearly.
            <br />
            <em>Move forward.</em>
          </h2>
          <p className="concept-story-copy">
            Every observation holds possibility. Give your team the perspective to make it count.
          </p>
          <EmberArtwork />
          <div className="ember-art-caption">
            <span>INSIGHT IN EVERY MEASURE</span>
            <span>→</span>
          </div>
        </section>
        <section className="ember-login">
          <span className="ember-access-note">
            <span />
            YOUR TEAM WORKSPACE
          </span>
          <ConceptForm
            heading="A fresh perspective awaits."
            introduction="Sign in and continue the work that makes a difference."
          />
          <div className="ember-card-note">
            <ShieldCheck size={13} />
            <span>Built for shared understanding.</span>
          </div>
        </section>
      </main>
      <footer className="variant-footer">
        <span>Small insights. Meaningful change.</span>
        <span>ASSESSMENTS / EVIDENCE / PROGRESS</span>
      </footer>
    </div>
  );
}
