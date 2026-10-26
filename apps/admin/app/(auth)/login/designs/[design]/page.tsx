import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { LoginConcept } from "@/components/login/LoginConcept";
import { LOGIN_DESIGNS } from "@/components/login/designs";
import { BRAND } from "@/lib/brand";

export function generateStaticParams() {
  return LOGIN_DESIGNS.map(({ slug }) => ({ design: slug }));
}
export function generateMetadata({ params }: { params: { design: string } }) {
  const design = LOGIN_DESIGNS.find((item) => item.slug === params.design);
  return { title: `${design?.name ?? "Login concept"} · ${BRAND.name}` };
}

export default function DesignPage({
  params,
  searchParams,
}: {
  params: { design: string };
  searchParams: { thumbnail?: string };
}) {
  const design = LOGIN_DESIGNS.find((item) => item.slug === params.design);
  if (!design) notFound();
  const thumbnail = searchParams.thumbnail === "1";
  return (
    <div className={thumbnail ? "concept-preview concept-preview--thumbnail" : "concept-preview"}>
      {!thumbnail && (
        <nav className="concept-preview-bar" aria-label="Login design collection">
          <Link href="/login/designs" className="concept-preview-back" aria-label="All concepts">
            <ArrowLeft size={15} />
            <span>All concepts</span>
          </Link>
          <span className="concept-preview-title">
            {design.number} / {design.name}
          </span>
          <div className="concept-preview-switch">
            {LOGIN_DESIGNS.map((item) => (
              <Link
                href={`/login/designs/${item.slug}`}
                key={item.slug}
                aria-label={`View ${item.name}`}
                aria-current={item.slug === design.slug ? "page" : undefined}
              >
                {item.number}
              </Link>
            ))}
            <Link
              href="/login/designs"
              className="concept-preview-gallery"
              aria-label="Open collection"
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </nav>
      )}
      <LoginConcept design={design.slug} />
    </div>
  );
}
