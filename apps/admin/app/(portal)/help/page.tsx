import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Users,
  Smartphone,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const guides = [
  {
    id: "assessments",
    icon: ClipboardCheck,
    title: "From draft to decision",
    href: "/assessments",
    action: "Open assessments",
    text: "Assessors collect responses in the mobile app and sync their work. Submitted assessments are ready for a manager to review. Approve a completed assessment, or return it with a note when something needs attention.",
  },
  {
    id: "forms",
    icon: FileText,
    title: "Build a useful questionnaire",
    href: "/forms",
    action: "Explore the form library",
    text: "Create questionnaires for different assessment areas, such as governance or service quality. Add sections and questions, then preview each question on mobile. Drafts save as you work. Publishing freezes a version so teams can use a consistent questionnaire on their next sync.",
  },
  {
    id: "team",
    icon: Users,
    title: "Bring your team together",
    href: "/users",
    action: "View team members",
    text: "Invite team members with their work email and choose a role that matches their responsibilities. Assessors collect data, managers review submissions, and form editors maintain questionnaires. Viewers can explore results.",
  },
  {
    id: "compare",
    icon: BarChart3,
    title: "See the bigger picture",
    href: "/compare",
    action: "Compare results",
    text: "Select two to four approved assessments to compare overall and section scores. Location performance on the overview uses the latest approved assessment for each location, so your view reflects reviewed evidence.",
  },
];

export default function HelpPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="A little guidance goes a long way."
        eyebrow="HELP & GUIDANCE"
        description="Get familiar with your workspace and make the most of every assessment."
      />
      <div className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-stone p-6 text-text-main sm:p-8">
        <span className="rounded bg-surface p-3">
          <Smartphone className="h-6 w-6 text-primary" />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">From the field to your workspace</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Collect on mobile. Review here. Use approved results to inform your next decision.
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {guides.map(({ id, icon: Icon, title, text, href, action }) => (
          <Card id={id} key={id} className="scroll-mt-6 p-6">
            <Icon className="mb-5 h-6 w-6 text-primary" strokeWidth={1.5} />
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
            <Link
              href={href}
              className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary"
            >
              {action}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
      </div>
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-sm font-semibold">Need a hand?</h2>
          <p className="mt-1 text-xs text-muted">
            Contact your workspace administrator or check your team’s support tickets.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/support/tickets">
            <MessageSquare className="h-4 w-4" />
            View support tickets
          </Link>
        </Button>
      </Card>
    </div>
  );
}
