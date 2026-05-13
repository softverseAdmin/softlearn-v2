import type { WorkHistoryPageData } from './types'

export const workHistoryMockData: WorkHistoryPageData = {
  files: [
    {
      id: 'file-active',
      fileName: 'Work_History_Arjun_Sharma.pdf',
      fileType: 'pdf',
      status: 'active',
      uploadedAt: '2026-05-10T09:30:00Z',
      sizeLabel: '2.4 MB',
      sizeBytes: 2_400_000,
      isActive: true,
    },
    {
      id: 'file-review',
      fileName: 'Resume_Arjun_Sharma_2026.docx',
      fileType: 'docx',
      status: 'processed',
      uploadedAt: '2026-05-02T13:15:00Z',
      sizeLabel: '1.8 MB',
      sizeBytes: 1_800_000,
      isActive: false,
    },
    {
      id: 'file-legacy',
      fileName: 'Experience_Summary_Q1.xlsx',
      fileType: 'xlsx',
      status: 'needs_review',
      uploadedAt: '2026-04-21T08:45:00Z',
      sizeLabel: '920 KB',
      sizeBytes: 920_000,
      isActive: false,
    },
  ],
  links: {
    linkedin: 'https://www.linkedin.com/in/arjun-sharma',
    github: 'https://github.com/arjunsharma-dev',
    portfolio: 'https://arjunsharma.dev',
  },
  insightMetrics: [
    { label: 'Companies', value: '2' },
    { label: 'Roles', value: '2' },
    { label: 'Years Experience', value: '3.1' },
    { label: 'Skills Identified', value: '6' },
  ],
  summary: {
    totalExperience: '3.1 Years',
    companies: 2,
    roles: 2,
    lastUpdated: 'May 10, 2026',
  },
  timeline: [
    {
      id: 'timeline-current',
      title: 'Frontend Engineer',
      subtitle: 'SoftVerse Labs',
      dateLabel: 'Jan 2025 - Present',
      description: 'Leading React dashboard delivery, document workflow polish, and reusable UI foundations.',
      kind: 'work',
      isCurrent: true,
    },
    {
      id: 'timeline-previous',
      title: 'UI Developer',
      subtitle: 'TechNova Solutions',
      dateLabel: 'Mar 2023 - Dec 2024',
      description: 'Built internal SaaS modules, file management flows, and user-facing analytics dashboards.',
      kind: 'work',
    },
    {
      id: 'timeline-education',
      title: 'B.Sc. Computer Science',
      subtitle: 'Kathmandu University',
      dateLabel: '2018 - 2022',
      description: 'Completed software engineering, information systems, and design fundamentals.',
      kind: 'education',
    },
  ],
  preview: {
    title: 'EMPLOYMENT HISTORY',
    name: 'Arjun Sharma',
    contactLine: 'arjun.sharma@example.com  |  +81 80-1234-5678  |  Tokyo, Japan',
    summary:
      'Frontend engineer with experience building SaaS dashboards, learning platforms, and document-centered workflows with React, TypeScript, and clean design systems.',
    experience: [
      {
        company: 'SoftVerse Labs',
        role: 'Frontend Engineer',
        dateRange: 'Jan 2025 - Present',
        bullets: [
          'Designed and implemented modern dashboard interfaces for learner and recruiter workflows.',
          'Created reusable React and Tailwind components for upload, insights, and analytics experiences.',
          'Improved consistency across protected student workspace pages and document flows.',
        ],
      },
      {
        company: 'TechNova Solutions',
        role: 'UI Developer',
        dateRange: 'Mar 2023 - Dec 2024',
        bullets: [
          'Developed responsive admin panels and profile management tools for enterprise clients.',
          'Partnered with backend teams to integrate structured user data into clean frontend surfaces.',
          'Maintained accessible, production-grade interfaces with TypeScript and component libraries.',
        ],
      },
    ],
    education: [
      {
        institution: 'Kathmandu University',
        detail: 'B.Sc. in Computer Science',
        dateRange: '2018 - 2022',
      },
    ],
  },
  nextSteps: [
    {
      id: 'next-resume',
      title: 'Update your resume',
      description: 'Refresh your latest responsibilities and achievements before applying.',
      href: '/student/resume',
    },
    {
      id: 'next-skills',
      title: 'Take a skill assessment',
      description: 'Validate recent experience with a new assessment result.',
      href: '/student/exams',
    },
    {
      id: 'next-matches',
      title: 'Find better matches',
      description: 'Use your updated work history to improve job relevance.',
      href: '/student/matches',
    },
    {
      id: 'next-dashboard',
      title: 'Go to Dashboard',
      description: 'Return to the main student workspace.',
      href: '/student',
    },
  ],
}
