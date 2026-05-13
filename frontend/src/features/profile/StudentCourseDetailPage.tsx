import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { CourseDetailResponse, CourseLessonSummary, StudentCourseEnrollmentResponse } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const emptyDetail: CourseDetailResponse = {
  course_id: 0,
  title: '',
  description: '',
  category: '',
  difficulty_level: '',
  estimated_hours: 0,
  status: 'active',
  lesson_count: 0,
  is_enrolled: false,
  enrollment_status: null,
  progress_percent: null,
  readiness_cues: [],
  detail_href: '',
  next_step_label: '',
  next_step_href: '',
  enrollment: {
    is_enrolled: false,
    learning_record_id: null,
    status: null,
    progress_percent: null,
    completed_at: null,
    lesson_count: 0,
    completed_lesson_count: 0,
  },
  lessons: [],
  learning_outcomes: [],
}

type RoadmapNodeState = 'completed' | 'in_progress' | 'ready' | 'locked'

type RoadmapCanvasCard = {
  id: string
  title: string
  body: string
  side: 'left' | 'right'
  optional?: boolean
}

type RoadmapResource = {
  title: string
  description: string
  href: string
  kind: 'article' | 'video' | 'documentation'
}

type RoadmapLessonNode = {
  lesson: CourseLessonSummary
  state: RoadmapNodeState
  stateLabel: string
  explanation: string
  cards: RoadmapCanvasCard[]
  resources: RoadmapResource[]
  tutorPrompts: string[]
}

type FaqItem = {
  id: string
  question: string
  answer: string
}

function formatStatusLabel(value: string | null | undefined) {
  if (!value) {
    return 'Not started'
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function dedupeText(items: Array<string | null | undefined>) {
  const seen = new Set<string>()

  return items.filter((item): item is string => {
    if (!item) {
      return false
    }

    const normalized = item.trim()
    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  })
}

function createResourceHref(query: string, target: 'article' | 'video' | 'documentation') {
  const encoded = encodeURIComponent(query)

  if (target === 'video') {
    return `https://www.youtube.com/results?search_query=${encoded}`
  }

  return `https://duckduckgo.com/?q=${encoded}`
}

function buildRoadmapNodeState(lesson: CourseLessonSummary): RoadmapNodeState {
  if (lesson.status === 'completed') {
    return 'completed'
  }

  if (lesson.status === 'in_progress') {
    return 'in_progress'
  }

  if (!lesson.is_accessible) {
    return 'locked'
  }

  return 'ready'
}

function buildRoadmapNodes(data: CourseDetailResponse): RoadmapLessonNode[] {
  return data.lessons.map((lesson, index) => {
    const state = buildRoadmapNodeState(lesson)
    const alternatingSides: ['left', 'right'] | ['right', 'left'] =
      index % 2 === 0 ? ['left', 'right'] : ['right', 'left']
    const concept = dedupeText([
      lesson.summary,
      data.learning_outcomes[index % Math.max(data.learning_outcomes.length, 1)],
      `Understand the core ideas behind ${lesson.title}.`,
    ])[0]
    const practice = dedupeText([
      data.readiness_cues[index % Math.max(data.readiness_cues.length, 1)],
      data.learning_outcomes[(index + 1) % Math.max(data.learning_outcomes.length, 1)],
      `Turn ${lesson.title} into a small practice exercise before moving on.`,
    ])[0]
    const explanation =
      lesson.summary || `Step ${lesson.sequence_number} in the ${data.title || 'course'} roadmap.`
    const searchTopic = [data.title, lesson.title].filter(Boolean).join(' ')

    return {
      lesson,
      state,
      stateLabel:
        state === 'completed'
          ? 'Completed'
          : state === 'in_progress'
            ? 'In progress'
            : state === 'locked'
              ? 'Locked'
              : 'Ready',
      explanation,
      cards: [
        {
          id: `${lesson.lesson_id}-concept`,
          title: 'Core concept',
          body: concept,
          side: alternatingSides[0],
        },
        {
          id: `${lesson.lesson_id}-practice`,
          title: 'Practice focus',
          body: practice,
          side: alternatingSides[1],
        },
        {
          id: `${lesson.lesson_id}-optional`,
          title: 'Optional resource',
          body: `Take a deeper dive into ${lesson.title} with extra examples, references, and walkthroughs.`,
          side: alternatingSides[0],
          optional: true,
        },
      ],
      resources: [
        {
          title: 'Documentation reference',
          description: `Look up official and community docs for ${lesson.title}.`,
          href: createResourceHref(`${searchTopic} documentation`, 'documentation'),
          kind: 'documentation',
        },
        {
          title: 'Free article guide',
          description: `Read walkthroughs and explainers for ${lesson.title}.`,
          href: createResourceHref(`${searchTopic} tutorial article`, 'article'),
          kind: 'article',
        },
        {
          title: 'Video walkthrough',
          description: `Watch a free tutorial for ${lesson.title}.`,
          href: createResourceHref(`${searchTopic} tutorial`, 'video'),
          kind: 'video',
        },
      ],
      tutorPrompts: [
        `Explain ${lesson.title} in simple terms and give me one real example.`,
        `Quiz me on ${lesson.title} with five short questions.`,
        `Give me a beginner practice task for ${lesson.title} and review criteria.`,
      ],
    }
  })
}

function buildProjectIdeas(data: CourseDetailResponse) {
  const firstLesson = data.lessons[0]?.title || 'the first topic'
  const secondLesson = data.lessons[1]?.title || 'the next concept'
  const thirdLesson = data.lessons[2]?.title || 'the final milestone'

  return [
    {
      title: 'Mini starter project',
      description: `Build a small project that uses ${firstLesson} and document what you learned.`,
    },
    {
      title: 'Feature challenge',
      description: `Create one focused feature around ${secondLesson} and keep the scope intentionally small.`,
    },
    {
      title: 'Portfolio walkthrough',
      description: `Turn ${thirdLesson} into a demo, README, or presentation you can reuse later.`,
    },
  ]
}

function buildFaqItems(data: CourseDetailResponse): FaqItem[] {
  const accessibleCount = data.lessons.filter((lesson) => lesson.is_accessible).length

  return [
    {
      id: 'start',
      question: 'How should I use this roadmap?',
      answer: data.enrollment.is_enrolled
        ? 'Follow the yellow lesson nodes from top to bottom. Open a node when you want the explanation, free resources, and the direct lesson action.'
        : 'Start by enrolling in the course. Once enrolled, the roadmap becomes your main navigation path for lessons, progress, and extra study resources.',
    },
    {
      id: 'order',
      question: 'Do I need to complete every node in order?',
      answer:
        accessibleCount < data.lessons.length
          ? `Some lessons stay locked until earlier steps are complete. Right now you can access ${accessibleCount} of ${data.lessons.length} lesson nodes.`
          : 'You can explore any open node, but the recommended path is still top to bottom so your practice stays structured.',
    },
    {
      id: 'resources',
      question: 'What opens when I click a roadmap node?',
      answer:
        'The right-side drawer shows the lesson summary, free resource links, the direct lesson action when available, and suggested AI tutor prompts for extra help.',
    },
    {
      id: 'completion',
      question: 'How is progress shown on the roadmap?',
      answer:
        'Completed lessons show a check badge, active lessons show an in-progress state, and locked lessons stay clearly marked so you always know what is next.',
    },
  ]
}

function RoadmapSubtopicCard({
  card,
  onClick,
}: {
  card: RoadmapCanvasCard
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full rounded-2xl border border-sky-200/80 bg-background/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md dark:border-sky-950 dark:bg-background/80 dark:hover:border-sky-700"
    >
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 hidden w-8 -translate-y-1/2 lg:block',
          card.side === 'left' ? '-right-8' : '-left-8',
          card.optional ? 'border-t border-dashed border-sky-400/90' : 'h-px bg-sky-400/90'
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            {card.optional ? 'Optional' : card.title}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
        </div>
        <ArrowUpRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500 transition group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-200" />
      </div>
    </button>
  )
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium">{item.question}</span>
        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen ? <div className="px-5 pb-4 text-sm text-muted-foreground">{item.answer}</div> : null}
    </div>
  )
}

export function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<CourseDetailResponse>(emptyDetail)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [openFaqId, setOpenFaqId] = useState<string | null>('start')

  const loadCourse = useCallback(async (active = true) => {
    if (!courseId) {
      setError('Course id is required.')
      setLoading(false)
      return
    }

    try {
      const response = await apiRequest<CourseDetailResponse>(`/student/courses/${courseId}`)
      if (active) {
        setData(response)
      }
    } catch (loadError) {
      if (active) {
        setError(loadError instanceof ApiError ? loadError.message : 'Unable to load course detail.')
      }
    } finally {
      if (active) {
        setLoading(false)
      }
    }
  }, [courseId])

  useEffect(() => {
    let active = true
    void loadCourse(active)
    return () => {
      active = false
    }
  }, [loadCourse])

  async function handleEnroll() {
    if (!courseId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<StudentCourseEnrollmentResponse>(`/student/courses/${courseId}/enrollment`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await loadCourse(true)
      setSuccess(response.created ? 'Course enrollment started.' : 'You are already enrolled in this course.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to enroll in this course.')
    } finally {
      setSaving(false)
    }
  }

  const roadmapNodes = useMemo(() => buildRoadmapNodes(data), [data])
  const selectedNode = roadmapNodes.find((node) => node.lesson.lesson_id === selectedLessonId) ?? null
  const progressPercent = data.enrollment.progress_percent ?? data.progress_percent ?? 0
  const completedNodes = roadmapNodes.filter((node) => node.state === 'completed').length
  const nextRecommendedNode =
    roadmapNodes.find((node) => node.state === 'in_progress') ??
    roadmapNodes.find((node) => node.state === 'ready') ??
    roadmapNodes[0] ??
    null
  const relatedRoadmaps = [
    {
      title: 'Learning progress',
      description: 'Review your course completion and current focus areas.',
      to: '/student/learning',
    },
    {
      title: 'Exam preparation',
      description: 'Pair this roadmap with practice and exam readiness.',
      to: '/student/preparation',
    },
    {
      title: `${data.category || 'Course'} catalog`,
      description: 'Browse more learning paths from the full course library.',
      to: '/student/courses',
    },
  ]
  const projectIdeas = useMemo(() => buildProjectIdeas(data), [data])
  const faqItems = useMemo(() => buildFaqItems(data), [data])

  useEffect(() => {
    if (selectedLessonId !== null && !roadmapNodes.some((node) => node.lesson.lesson_id === selectedLessonId)) {
      setSelectedLessonId(null)
    }
  }, [roadmapNodes, selectedLessonId])

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 xl:px-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading roadmap…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 xl:px-8">
      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_52%,#fff7ed_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
        <div className="space-y-6 p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                <Sparkles className="h-4 w-4" />
                Course roadmap
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{data.title || 'Course roadmap'}</h1>
                {data.difficulty_level ? <Badge className="border-transparent bg-violet-100 text-violet-700 hover:bg-violet-100">{data.difficulty_level}</Badge> : null}
              </div>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                {data.description || 'Move through the course as one visual roadmap instead of a plain lesson list.'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-800">
                  Roadmap
                </span>
                <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                  {formatStatusLabel(data.enrollment.status || data.enrollment_status)}
                </Badge>
                <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {progressPercent}% progress
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{progressPercent}%</p>
                <p className="mt-1 text-sm text-slate-500">
                  {completedNodes} of {roadmapNodes.length || data.lesson_count} lesson nodes completed
                </p>
              </div>
              <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Timeline</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{data.estimated_hours > 0 ? `${data.estimated_hours}h` : '--'}</p>
                <p className="mt-1 text-sm text-slate-500">{data.lesson_count} roadmap steps</p>
              </div>
              <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Category</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{data.category || 'General learning'}</p>
                <p className="mt-1 text-sm text-slate-500">Visual path with node drawer details</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {data.enrollment.is_enrolled ? (
              <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800" asChild>
                <Link to={data.next_step_href}>{data.next_step_label}</Link>
              </Button>
            ) : (
              <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800" onClick={() => void handleEnroll()} disabled={saving}>
                {saving ? 'Enrolling…' : 'Start this roadmap'}
              </Button>
            )}
            {nextRecommendedNode ? (
              <Button variant="outline" className="h-11 rounded-2xl border-slate-200 bg-white px-5" onClick={() => setSelectedLessonId(nextRecommendedNode.lesson.lesson_id)}>
                Open next node
              </Button>
            ) : null}
            <Button variant="ghost" className="h-11 rounded-2xl px-5 text-slate-700" asChild>
              <Link to="/student/courses">Back to catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load course</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {success ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Success</h3>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!error ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <motion.aside
              className="space-y-4 xl:sticky xl:top-6 xl:self-start"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="border-amber-200/70 bg-gradient-to-br from-amber-50 via-background to-yellow-50 dark:border-yellow-900 dark:from-yellow-950/40 dark:via-background dark:to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Personal recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {nextRecommendedNode
                        ? `Your best next step is "${nextRecommendedNode.lesson.title}". Open the node drawer to review the summary and free learning links before you continue.`
                        : 'This roadmap will become more useful as new lesson nodes are added.'}
                    </p>
                    <div className="space-y-2 rounded-2xl border border-amber-200/70 bg-background/80 p-4 dark:border-yellow-900 dark:bg-background/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Current status
                      </p>
                      <p className="font-medium">{formatStatusLabel(data.enrollment.status || data.enrollment_status)}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.enrollment.completed_lesson_count} completed lessons and {progressPercent}% total progress.
                      </p>
                    </div>
                    {nextRecommendedNode ? (
                      <Button className="w-full" onClick={() => setSelectedLessonId(nextRecommendedNode.lesson.lesson_id)}>
                        Focus on next node
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-sky-500" />
                      Related roadmaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {relatedRoadmaps.map((item) => (
                      <Link
                        key={item.title}
                        to={item.to}
                        className="block rounded-2xl border border-border p-4 transition hover:border-sky-400 hover:bg-muted/40"
                      >
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      Beginner project ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {projectIdeas.map((idea) => (
                      <div key={idea.title} className="rounded-2xl border border-border bg-background/70 p-4">
                        <p className="font-medium">{idea.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.aside>

            <div className="space-y-6">
              <Card className="overflow-hidden border-sky-200/70 bg-gradient-to-b from-sky-50/60 to-background dark:border-sky-950 dark:from-sky-950/10 dark:to-background">
                <CardHeader className="border-b border-sky-100/80 dark:border-sky-950">
                  <CardTitle>Visual roadmap canvas</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click any lesson node to open the right-side drawer with resources and study support.
                  </p>
                </CardHeader>
                <CardContent className="relative px-4 pb-8 pt-6 sm:px-6 lg:px-10">
                  <div className="pointer-events-none absolute bottom-8 left-[1.7rem] top-4 w-px bg-gradient-to-b from-sky-200 via-sky-400 to-sky-200 dark:from-sky-900 dark:via-sky-700 dark:to-sky-900 lg:left-1/2 lg:-translate-x-1/2" />

                  {roadmapNodes.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-sky-300 bg-background/80 p-8 text-center dark:border-sky-900">
                      <p className="text-lg font-medium">No roadmap nodes yet</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Lessons will appear here as soon as the course outline is available.
                      </p>
                    </div>
                  ) : (
                    <motion.div className="space-y-8 lg:space-y-12" variants={containerVariants} initial="hidden" animate="visible">
                      {roadmapNodes.map((node) => {
                        const leftCards = node.cards.filter((card) => card.side === 'left')
                        const rightCards = node.cards.filter((card) => card.side === 'right')
                        const isCompleted = node.state === 'completed'
                        const isLocked = node.state === 'locked'
                        const isInProgress = node.state === 'in_progress'

                        return (
                          <motion.div
                            key={node.lesson.lesson_id}
                            variants={itemVariants}
                            className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] lg:items-center lg:gap-8"
                          >
                            <div className="order-2 space-y-3 lg:order-1">
                              {leftCards.map((card) => (
                                <RoadmapSubtopicCard
                                  key={card.id}
                                  card={card}
                                  onClick={() => setSelectedLessonId(node.lesson.lesson_id)}
                                />
                              ))}
                            </div>

                            <div className="order-1 lg:order-2">
                              <div className="relative">
                                <span className="pointer-events-none absolute left-[0.15rem] top-8 z-10 h-5 w-5 rounded-full border-4 border-sky-300 bg-background dark:border-sky-700 lg:left-1/2 lg:-translate-x-1/2" />
                                <button
                                  type="button"
                                  onClick={() => setSelectedLessonId(node.lesson.lesson_id)}
                                  className="group relative ml-8 flex w-[calc(100%-2rem)] flex-col gap-4 rounded-[28px] border border-yellow-300 bg-gradient-to-br from-amber-200 via-yellow-100 to-yellow-50 p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-yellow-800 dark:from-yellow-500/20 dark:via-yellow-400/10 dark:to-background lg:ml-0 lg:w-full"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-4">
                                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-black/10 text-foreground">
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        ) : isLocked ? (
                                          <Lock className="h-5 w-5 text-amber-900 dark:text-yellow-100" />
                                        ) : isInProgress ? (
                                          <PlayCircle className="h-6 w-6 text-sky-700 dark:text-sky-300" />
                                        ) : (
                                          <Clock3 className="h-5 w-5 text-amber-900 dark:text-yellow-100" />
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <Badge className="bg-black/10 text-foreground hover:bg-black/10" variant="secondary">
                                            Step {node.lesson.sequence_number}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              'border-transparent bg-white/70 text-foreground dark:bg-background/50',
                                              isCompleted && 'text-emerald-700 dark:text-emerald-300',
                                              isInProgress && 'text-sky-700 dark:text-sky-300',
                                              isLocked && 'text-amber-800 dark:text-yellow-200'
                                            )}
                                          >
                                            {node.stateLabel}
                                          </Badge>
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">{node.lesson.title}</h3>
                                        <p className="text-sm text-foreground/80">{node.explanation}</p>
                                      </div>
                                    </div>
                                    {isCompleted ? (
                                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                        <Check className="h-4 w-4" />
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-4 text-sm text-foreground/75 dark:border-white/10">
                                    <span>{isLocked ? 'Complete earlier nodes to unlock this step.' : 'Open node details and resources'}</span>
                                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                  </div>
                                </button>
                              </div>
                            </div>

                            <div className="order-3 space-y-3">
                              {rightCards.map((card) => (
                                <RoadmapSubtopicCard
                                  key={card.id}
                                  card={card}
                                  onClick={() => setSelectedLessonId(node.lesson.lesson_id)}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>FAQ</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Quick answers for how this roadmap page works.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {faqItems.map((item) => (
                    <FaqAccordionItem
                      key={item.id}
                      item={item}
                      isOpen={openFaqId === item.id}
                      onToggle={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Sheet
            open={selectedNode !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedLessonId(null)
              }
            }}
          >
            <SheetContent className="w-full gap-0 overflow-y-auto px-0 sm:max-w-xl">
              {selectedNode ? (
                <>
                  <SheetHeader className="border-b border-border pb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Step {selectedNode.lesson.sequence_number}</Badge>
                      <Badge variant="secondary">{selectedNode.stateLabel}</Badge>
                    </div>
                    <SheetTitle className="mt-3 text-xl">{selectedNode.lesson.title}</SheetTitle>
                    <SheetDescription className="mt-2">{selectedNode.explanation}</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 p-4">
                    <Card className="bg-muted/30">
                      <CardHeader>
                        <CardTitle className="text-base">Short explanation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {selectedNode.lesson.summary || `This lesson moves you through ${selectedNode.lesson.title} as part of the full course roadmap.`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="font-medium text-foreground">{selectedNode.stateLabel}</span>
                        </p>
                        {selectedNode.lesson.detail_href ? (
                          selectedNode.lesson.is_accessible ? (
                            <Button className="w-full" asChild>
                              <Link to={selectedNode.lesson.detail_href}>Open lesson</Link>
                            </Button>
                          ) : (
                            <Button className="w-full" disabled>
                              Lesson locked
                            </Button>
                          )
                        ) : null}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Free resources</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedNode.resources.map((resource) => (
                          <a
                            key={resource.title}
                            href={resource.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4 transition hover:border-sky-400 hover:bg-muted/40"
                          >
                            <div>
                              <p className="font-medium">{resource.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                              <span className="text-xs font-medium uppercase tracking-[0.2em]">{resource.kind}</span>
                              <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            </div>
                          </a>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">AI tutor help</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          If you need help, use one of these prompts with your AI tutor or study assistant.
                        </p>
                        {selectedNode.tutorPrompts.map((prompt) => (
                          <div key={prompt} className="rounded-2xl border border-border bg-background/80 p-3 text-sm">
                            {prompt}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : null}
            </SheetContent>
          </Sheet>
        </>
      ) : null}
    </div>
  )
}
