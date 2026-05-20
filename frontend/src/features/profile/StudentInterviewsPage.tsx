import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Calendar, Clock, Video, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { InterviewListResponse } from './types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const emptyResponse: InterviewListResponse = {
  interviews: [],
}

export function StudentInterviewsPage() {
  const [data, setData] = useState<InterviewListResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadInterviews() {
      try {
        const response = await apiRequest<InterviewListResponse>('/student/interviews')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load interviews.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInterviews()
    return () => {
      active = false
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <LoadingState title="Loading interviews" className="min-h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student interviews</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Interview schedule</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Review interview requests, share availability, and track confirmed schedules.
        </p>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load interviews</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Empty State */}
      {!error && data.interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">No interviews yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Interview requests will appear here after a company starts a hiring conversation.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Interviews Grid */}
      {data.interviews.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {data.interviews.map((interview) => (
            <motion.div key={interview.id} variants={itemVariants}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base md:text-lg">{interview.purpose}</CardTitle>
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{interview.role_context || 'General interview'}</p>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pt-0">
                  {/* Schedule Info */}
                  <div className="space-y-2">
                    {interview.scheduled_start && interview.scheduled_end ? (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span>{new Date(interview.scheduled_start).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span>
                            {new Date(interview.scheduled_start).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(interview.scheduled_end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">Awaiting schedule confirmation</p>
                      </div>
                    )}
                  </div>

                  {/* Status Info */}
                  <div className="space-y-1 border-t border-border pt-4">
                    {interview.completed_at && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed {new Date(interview.completed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {interview.cancelled_at && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Cancelled {new Date(interview.cancelled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>

                <div className="border-t border-border p-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/student/interviews/${interview.id}`}>View details</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
