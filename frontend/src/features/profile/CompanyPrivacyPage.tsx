import { ChevronRight, FileText, Lock, MessagesSquare, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { AccountSecurityCard } from '@/components/AccountSecurityCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const privacyHighlights = [
  {
    title: 'Permission-controlled candidate access',
    description: 'Candidate profiles are visible only inside approved review contexts instead of open company-side browsing.',
    icon: Users,
  },
  {
    title: 'Student exam privacy stays student-controlled',
    description: 'Assessment results remain hidden unless the student explicitly shares exam visibility in their own privacy settings.',
    icon: FileText,
  },
  {
    title: 'Protected communication boundaries',
    description: 'Messaging and follow-up workflows stay limited to candidates with active review access in the current company workspace.',
    icon: MessagesSquare,
  },
]

export function CompanyPrivacyPage() {
  const { csrfToken, user } = useAuth()

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Privacy</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company privacy</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy and security</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Review the privacy guardrails that shape candidate access, protected communication, and account security inside the company workspace.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <AccountSecurityCard
            csrfToken={csrfToken}
            title="Account security"
            description="Protect the company workspace with the same session-protected password update flow used across the platform."
            helperText="Password updates apply to company profile edits, hiring workflows, and other protected actions that already rely on CSRF-aware session authentication."
          />

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Privacy guardrails
              </CardTitle>
              <CardDescription>These protections reflect the real candidate-review and interview rules already enforced in the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {privacyHighlights.map((highlight) => {
                const Icon = highlight.icon

                return (
                  <div key={highlight.title} className="flex items-start gap-4 rounded-2xl border border-border p-4">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{highlight.title}</p>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Operational safeguards
              </CardTitle>
              <CardDescription>Company privacy is shaped by what your team can see and when those surfaces unlock.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Candidate review first</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Candidate details stay tied to application, shortlist, or approved match flows rather than broad company-wide discovery.
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Interviews require valid access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Interview actions depend on approved candidate context, and meeting URLs must pass validation before they are stored.
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Student exam data is limited</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Exam outcomes are only available when the student has explicitly shared them, so hidden results never surface in company review screens.
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Protected writes stay CSRF-aware</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Password changes, profile edits, vacancy updates, and interview actions all continue to rely on the protected session model.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Workspace summary</CardTitle>
              <CardDescription>Quick company-side context for the currently authenticated account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{user?.name || 'Company workspace'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'No email available'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <span className="font-medium">Candidate access</span>
                  <Badge>Permission controlled</Badge>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <span className="font-medium">Exam results</span>
                  <Badge variant="outline" className="text-muted-foreground">
                    Student controlled
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <span className="font-medium">Protected writes</span>
                  <Badge>CSRF required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Privacy-aware workflow links</CardTitle>
              <CardDescription>Jump into the company surfaces where these safeguards matter most.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/company/candidates">Review candidate access</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/company/messages">Open protected messages</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/company/interviews">Manage interviews</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/company/profile">Go to company profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

