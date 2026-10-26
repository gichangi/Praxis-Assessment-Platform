import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Map,
  Users,
  MessageSquare,
  Settings,
  ShieldCheck,
  BarChart3,
  BookOpen,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Overview",
        description: "Your workspace at a glance",
      },
      {
        href: "/assessments",
        icon: ClipboardList,
        label: "Assessments",
        description: "Review submissions and results",
      },
      {
        href: "/forms",
        icon: FileText,
        label: "Form library",
        description: "Build and publish questionnaires",
      },
      {
        href: "/compare",
        icon: BarChart3,
        label: "Compare results",
        description: "Explore location performance",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        href: "/locations",
        icon: Map,
        label: "Locations",
        description: "Manage your geographic tree",
      },
      {
        href: "/users",
        icon: Users,
        label: "Team members",
        description: "Manage your team and roles",
      },
      {
        href: "/audit",
        icon: ShieldCheck,
        label: "Activity log",
        description: "Track workspace changes",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        href: "/support/tickets",
        icon: MessageSquare,
        label: "Support",
        description: "View team support requests",
      },
      {
        href: "/help",
        icon: BookOpen,
        label: "Help & guidance",
        description: "Learn how to use the platform",
      },
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
        description: "Configure your workspace",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);
