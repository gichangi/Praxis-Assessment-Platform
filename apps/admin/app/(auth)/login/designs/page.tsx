import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers3 } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { ConceptThumbnail } from "@/components/login/ConceptThumbnail";
import { LOGIN_DESIGNS } from "@/components/login/designs";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Login design collection · ${BRAND.name}` };

export default function LoginDesignsPage() {
  return (
    <div className="design-gallery">
      <header className="gallery-header">
        <Link href="/login/designs" className="gallery-brand">
          <BrandMark />
          <span>
            {BRAND.name}<span className="gallery-brand__detail">Design collection</span>
          </span>
        </Link>
        <span className="gallery-header__note">
          <Layers3 size={15} />
          {LOGIN_DESIGNS.length} directions. One workspace.
        </span>
      </header>
      <main className="gallery-main">
        <div className="gallery-intro">
          <div>
            <p className="gallery-eyebrow">LOGIN / DESIGN EXPLORATIONS</p>
            <h1>
              A considered
              <br />
              <span>welcome.</span>
            </h1>
          </div>
          <p>
            Praxis. Insight into action.
            <br />
            Flexible assessments that turn understanding into grounded action. Explore the brand
            through ten visual directions, led by Ember Ledger’s warm stone, copper, and ivory palette.
          </p>
        </div>
        <div className="gallery-grid">
          {[
            ...LOGIN_DESIGNS.slice(-1),
            ...LOGIN_DESIGNS.slice(5, -1),
            ...LOGIN_DESIGNS.slice(0, 5),
          ].map((design) => (
            <article className="gallery-card" key={design.slug}>
              <Link
                href={`/login/designs/${design.slug}`}
                className="gallery-preview-link"
                aria-label={`Open ${design.name} full-size design`}
              >
                <ConceptThumbnail design={design.slug} name={design.name} />
                <span className="gallery-preview-open">
                  Explore design
                  <ArrowUpRight size={15} />
                </span>
              </Link>
              <div className="gallery-card__info">
                <div className="gallery-card__heading">
                  <span className="gallery-number">{design.number}</span>
                  <h2>{design.name}</h2>
                  <span
                    className="gallery-swatch"
                    style={{ background: design.color }}
                    aria-hidden="true"
                  />
                </div>
                <p>{design.description}</p>
                <div className="gallery-card__footer">
                  <span>
                    {"inspiredBy" in design
                      ? `New · Inspired by ${design.inspiredBy}`
                      : design.mood}
                  </span>
                  <Link href={`/login/designs/${design.slug}`} aria-label={`View ${design.name}`}>
                    <ArrowRight size={19} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="gallery-bottom">
          <p>Every concept adapts to mobile and includes password or email-link sign-in.</p>
          <span>Choose a direction. We’ll make it yours.</span>
        </div>
      </main>
    </div>
  );
}
