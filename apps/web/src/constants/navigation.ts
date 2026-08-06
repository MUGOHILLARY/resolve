import {
  LayoutDashboard,
  HeartHandshake,
  BookOpen,
  CalendarDays,
  Clock3,
  Brain,
  Trophy,
  User,
  FileText,
  BarChart3,
  Bot,
  Shield,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },

  {
    title: "Recovery",
    icon: HeartHandshake,
    children: [
      {
        title: "Overview",
        href: "/recovery",
        icon: HeartHandshake,
      },
      {
        title: "Journal",
        href: "/recovery/journal",
        icon: BookOpen,
      },
      {
        title: "Calendar",
        href: "/recovery/calendar",
        icon: CalendarDays,
      },
      {
        title: "Timeline",
        href: "/recovery/timeline",
        icon: Clock3,
      },
      {
        title: "Insights",
        href: "/recovery/insights",
        icon: Brain,
      },
      {
        title: "Achievements",
        href: "/recovery/achievements",
        icon: Trophy,
      },
      {
        title: "Recovery Profile",
        href: "/recovery/profile",
        icon: User,
      },
      {
        title: "Recovery Policy",
        href: "/recovery/policy",
        icon: FileText,
      },
    ],
  },

  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },

  {
    title: "AI Coach",
    icon: Bot,
    href: "/ai-coach",
  },

  {
    title: "Website Blocker",
    icon: Shield,
    href: "/blocker",
  },

  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];