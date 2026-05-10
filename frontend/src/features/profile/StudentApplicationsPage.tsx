import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Briefcase, Building2, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { StudentApplicationRecord, StudentApplicationsResponse } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const emptyApplicationsResponse: StudentApplicationsResponse = {
  student_id: 0,
  application_count: 0,
  applications: [],
}

export function StudentApplicationsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentApplicationsResponse>(emptyApplicationsResponse)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadApplications() {
      try {
        const response = await apiRequest<StudentApplicationsResponse>('/student/applications')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load applications.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadApplications()
    return () => {
      active = false
    }
  }, [])

  async function refreshApplications() {
    const response = await apiRequest<StudentApplicationsResponse>('/student/applications')
    setData(response)
  }

  async function handleWithdraw(application: StudentApplicationRecord) {
    setSavingId(application.application_id)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<StudentApplicationRecord>(`/student/applications/${application.application_id}/withdraw`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await refreshApplications()
      setSuccess('Application withdrawn successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to withdraw application.')
    } finally {
      setSavingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      case 'interviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading applications…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student applications</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Application status</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Track your submitted jobs, current status, and application history in one protected place.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total applications</p>
              <p className="mt-2 text-3xl font-bold">{data.application_count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Success State */}
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

      {/* Applications List */}
      {data.applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You haven't applied to any jobs yet. Explore job opportunities in the jobs section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {data.applications.map((application) => (
            <motion.div key={application.application_id} variants={itemVariants}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="hidden rounded-lg bg-blue-100 p-2 dark:bg-blue-950 md:block">
                          <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg md:text-xl">{application.vacancy_title}</CardTitle>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{application.company_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Dates */}
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest">Submitted</p>
                        <p className="mt-1">{new Date(application.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest">Updated</p>
                        <p className="mt-1">{new Date(application.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  {application.history.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold mb-3">Application history</p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {application.history.map((entry) => (
                          <div key={entry.id} className="flex gap-2">
                            <span className="text-xs shrink-0">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex-1">
                              <span className="font-semibold">{entry.to_status}</span>
                              {entry.actor_name && <span className="ml-2">· {entry.actor_name}</span>}
                              {entry.note && <p className="mt-1 text-xs italic">{entry.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {application.can_withdraw && (
                    <div className="border-t border-border pt-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleWithdraw(application)}
                        disabled={savingId === application.application_id}
                      >
                        {savingId === application.application_id ? 'Withdrawing…' : 'Withdraw application'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
