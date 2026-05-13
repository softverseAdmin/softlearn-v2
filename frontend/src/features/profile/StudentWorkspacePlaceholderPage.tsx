import { ArrowRight, Award, BrainCircuit, Layers3, MessageSquareText, Sparkles, Video } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type StudentWorkspacePlaceholderPageProps = {
  title: string
  description: string
}

export function StudentWorkspacePlaceholderPage({
  title,
  description,
}: StudentWorkspacePlaceholderPageProps) {
  const surfaceByTitle: Record<string, { eyebrow: string; chip: string; icon: typeof Video; cards: Array<{ title: string; body: string }> }> = {
    'Mock Interviews': {
      eyebrow: 'Interview workspace',
      chip: 'Video-ready',
      icon: Video,
      cards: [
        { title: 'Interview overview', body: 'Schedule prep, confidence prompts, and follow-up notes fit into the same protected student shell.' },
        { title: 'Feedback snapshot', body: 'Use the shared dashboard card system for scores, strengths, and next-step coaching once this route is implemented.' },
      ],
    },
    Community: {
      eyebrow: 'Community space',
      chip: 'Collaboration',
      icon: MessageSquareText,
      cards: [
        { title: 'Discussion layout', body: 'A clean split-view can support topic lists, mentor answers, and focused peer threads without changing the workspace shell.' },
        { title: 'Knowledge capture', body: 'Blue primary actions and subtle purple highlights keep discussion, AI tips, and bookmarks visually consistent.' },
      ],
    },
    Certificates: {
      eyebrow: 'Proof of learning',
      chip: 'Verified',
      icon: Award,
      cards: [
        { title: 'Certificate gallery', body: 'Rounded cards and soft status badges can present issued certificates, pending requirements, and share-ready documents.' },
        { title: 'Completion signals', body: 'Results, course completion, and next actions can reuse the same production dashboard visual language.' },
      ],
    },
  }

  const surface = surfaceByTitle[title] ?? {
    eyebrow: 'Student workspace',
    chip: 'In progress',
    icon: Layers3,
    cards: [
      { title: 'Shared design system', body: 'This route now uses the same card, spacing, border, and accent treatments as the rest of the redesigned workspace.' },
      { title: 'Future-ready shell', body: 'When this page is implemented, it can drop into the same sidebar, top navbar, and content rhythm without route changes.' },
    ],
  }
  const Icon = surface.icon

  return (
    <div className="min-h-full px-4 py-6 md:px-6 lg:px-8">
      <Card className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/80 to-violet-50/70 shadow-[0_22px_54px_rgba(15,23,42,0.06)]">
        <CardContent className="px-6 py-8 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{surface.eyebrow}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
                  <Badge className="rounded-full bg-violet-100 px-3 py-1 text-violet-700 hover:bg-violet-100">
                    {surface.chip}
                  </Badge>
                </div>
                <p className="max-w-2xl text-base leading-7 text-slate-600">{description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {surface.cards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-sm">
                    <p className="text-lg font-semibold text-slate-900">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-2xl px-5">
                  <Link to="/student">
                    Back to dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl px-5">
                  <Link to="/student/learning">Open learning workspace</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-900">Mapped design surface</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This placeholder now reflects the same clean SaaS treatment used across the redesigned student routes:
                light canvas, rounded cards, blue action states, purple AI accents, and production-style spacing.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                      <Layers3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Reusable workspace cards</p>
                      <p className="text-xs text-slate-500">Same layout foundation as dashboard, jobs, courses, and documents.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">AI-ready accent treatment</p>
                      <p className="text-xs text-slate-500">Purple-highlighted insights align future premium or AI-driven surfaces.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Consistent next-step pattern</p>
                      <p className="text-xs text-slate-500">Call-to-action buttons and status badges stay uniform across the app.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
