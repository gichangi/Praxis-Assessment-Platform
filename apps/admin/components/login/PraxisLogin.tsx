import { BrandMark } from "@/components/BrandMark";
import { BRAND } from "@/lib/brand";
import { ConceptForm } from "./ConceptForm";

function EvidenceNetwork() {
  return (
    <svg className="access-network" viewBox="0 0 900 800" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="praxis-network-wash">
          <stop stopColor="#E0A484" stopOpacity=".24" />
          <stop offset="1" stopColor="#D7C3AB" stopOpacity=".04" />
        </radialGradient>
        <pattern id="praxis-network-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".7" fill="#955B40" opacity=".19" />
        </pattern>
        <clipPath id="praxis-network-disc">
          <circle cx="546" cy="430" r="310" />
        </clipPath>
        <filter id="praxis-node-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <path id="praxis-questions-arc" d="M317 423a229 229 0 0 1 85-179" />
        <path id="praxis-evidence-arc" d="M685 252a229 229 0 0 1 87 171" />
        <path id="praxis-action-arc" d="M461 664a245 245 0 0 0 166-2" />
      </defs>

      <circle cx="546" cy="430" r="310" fill="url(#praxis-network-wash)" />
      <circle cx="546" cy="430" r="310" stroke="#B79A7B" strokeOpacity=".2" />
      <g clipPath="url(#praxis-network-disc)">
        <circle cx="546" cy="430" r="310" fill="url(#praxis-network-dots)" />
        <circle cx="546" cy="430" r="153" stroke="#955B40" strokeOpacity=".14" strokeDasharray="2 5" />
        <circle cx="546" cy="430" r="105" stroke="#955B40" strokeOpacity=".1" />
        <path d="M546 120V740M236 430H856" stroke="#955B40" strokeOpacity=".06" />
      </g>
      <circle cx="546" cy="430" r="218" stroke="#955B40" strokeOpacity=".43" />
      <path d="M646 236a218 218 0 0 1 115 216" stroke="#C98361" strokeWidth="1.5" strokeDasharray="6 8" />
      <path d="M546 215V328M733 541L660 501M387 578L449 508" stroke="#955B40" strokeOpacity=".24" />

      <g fill="#BF805B">
        <circle cx="341" cy="355" r="5" />
        <circle cx="328" cy="430" r="5" />
        <circle cx="698" cy="274" r="4" />
        <circle cx="760" cy="390" r="4" />
        <circle cx="669" cy="610" r="5" />
        <circle cx="546" cy="648" r="4" />
      </g>
      <g fill="#C98361" opacity=".45" filter="url(#praxis-node-glow)">
        <circle cx="341" cy="355" r="6" />
        <circle cx="698" cy="274" r="5" />
        <circle cx="669" cy="610" r="6" />
      </g>

      <g fontFamily="monospace" fontSize="8" letterSpacing="2.5" fill="#88674F">
        <text><textPath href="#praxis-questions-arc" startOffset="12%">BETTER QUESTIONS</textPath></text>
        <text><textPath href="#praxis-evidence-arc" startOffset="10%">SHARED EVIDENCE</textPath></text>
        <text><textPath href="#praxis-action-arc" startOffset="12%">GROUNDED ACTION</textPath></text>
      </g>

      <g transform="translate(546 215)">
        <circle r="62" fill="#F1ECE4" stroke="#CBB29B" />
        <circle r="56" fill="#FFFCF6" stroke="#955B40" strokeOpacity=".65" strokeWidth="1.5" />
        <path d="M-9-7V-16M0-7V-27M9-7V-21" stroke="#955B40" strokeWidth="2" strokeLinecap="round" />
        <text y="20" textAnchor="middle" fill="#554438" fontSize="11" letterSpacing="1.2">ASSESSMENTS</text>
      </g>
      <g transform="translate(733 541)">
        <circle r="62" fill="#F1ECE4" stroke="#CBB29B" />
        <circle r="56" fill="#FFFCF6" stroke="#955B40" strokeOpacity=".65" strokeWidth="1.5" />
        <ellipse cy="-20" rx="10" ry="4" stroke="#955B40" strokeWidth="1.6" />
        <path d="M-10-20V-4c0 5 20 5 20 0v-16M-10-12c0 5 20 5 20 0" stroke="#955B40" strokeWidth="1.6" />
        <text y="22" textAnchor="middle" fill="#554438" fontSize="12" letterSpacing="1.5">EVIDENCE</text>
      </g>
      <g transform="translate(387 578)">
        <circle r="42" fill="#FFFCF6" stroke="#B79A7B" />
        <path d="M-10-9l6 6 13-13" stroke="#955B40" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <text y="19" textAnchor="middle" fill="#554438" fontSize="9" letterSpacing="1.5">ACTION</text>
      </g>
      <g transform="translate(546 430)">
        <circle cy="-18" r="20" stroke="#955B40" strokeOpacity=".6" />
        <circle cy="-18" r="6" fill="#955B40" />
        <text y="36" textAnchor="middle" fill="#332E29" fontSize="27" fontWeight="500">Praxis</text>
        <path d="M-23 55H23" stroke="#955B40" strokeOpacity=".6" />
      </g>

      <g stroke="#B79A7B" strokeOpacity=".25">
        <path d="M-70 410C138 364 192 509 416 472S677 639 972 558" />
        <path d="M-70 446C137 400 206 554 418 517S669 686 972 600" />
        <path d="M-70 490C123 443 219 598 420 563S653 731 972 644" />
      </g>
      <path d="M0 739L112 705L174 716L254 668L369 720L462 702L566 744L667 685L760 722L900 693V800H0Z" fill="#DED0BE" fillOpacity=".34" />
      <path d="M0 777L108 748L218 774L323 737L440 776L555 751L658 779L769 749L900 772V800H0Z" fill="#D4C1A9" fillOpacity=".24" />
      <g fill="#B7835C" opacity=".65">
        <circle cx="79" cy="747" r="1.7" /><circle cx="164" cy="732" r="1.5" />
        <circle cx="273" cy="713" r="1.7" /><circle cx="426" cy="744" r="1.5" />
        <circle cx="646" cy="728" r="1.7" /><circle cx="791" cy="742" r="1.5" />
      </g>
    </svg>
  );
}

export function PraxisLogin() {
  return (
    <div className="praxis-access">
      <section className="access-visual" aria-label="About Praxis">
        <header className="access-header">
          <BrandMark className="access-brand-mark" />
          <span className="access-brand-name">{BRAND.name}</span>
          <span className="access-header-rule" />
          <span className="access-console">Assessment workspace</span>
        </header>
        <div className="access-story">
          <h2>Connected evidence.<br /><em>Grounded action.</em></h2>
          <span className="access-story-rule" />
          <p>Bring your questions, evidence<br />and next decisions together.</p>
        </div>
        <EvidenceNetwork />
        <div className="access-index" aria-hidden="true">
          <span>QUESTIONS</span><span>EVIDENCE</span><span>INSIGHT</span><span>ACTION</span>
          <i />
        </div>
        <footer className="access-visual-footer">{BRAND.tagline}</footer>
      </section>
      <main className="access-entry">
        <p className="access-entry-note">Better questions.<br />Clearer evidence.<br />Grounded action.<span /></p>
        <section className="access-card" aria-label="Sign in to Praxis">
          <div className="access-card-brand"><span />{BRAND.name}</div>
          <ConceptForm heading="Welcome back." introduction="Sign in to your assessment workspace." />
          <footer className="access-card-footer">
            <span>SECURE<br />ACCESS</span><span>SHARED<br />EVIDENCE</span><span>CLEAR<br />DIRECTION</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
