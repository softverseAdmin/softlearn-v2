// @ts-nocheck
import React, { useMemo } from 'react'
import { BookOpen, TrendingUp, Clock, Award, Play, Lock, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-extended'
import { StatCard, Badge, Progress } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Mock data interface
interface StudentDashboardData {
  stats: {
    enrolledCourses: number
    completedCourses: number
    learningHours: number
    certificates: number
  }
  courses: Array<{
    id: string
    title: string
    thumbnail?: string
    progress: number
    lessonsTotal: number
    lessonsCompleted: number
    instructor: string
    category: string
  }>
  roadmap: Array<{
    id: string
    title: string
    status: 'completed' | 'in-progress' | 'locked'
    progress: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    course: string
    timestamp: string
  }>
}

interface StudentDashboardProps {
  data?: StudentDashboardData
  onCourseClick?: (courseId: string) => void
  onViewAllCourses?: () => void
}

export function StudentDashboard({
  data = mockDashboardData,
  onCourseClick,
  onViewAllCourses,
}: StudentDashboardProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back! 👋</h1>
        <p className="mt-2 text-muted-foreground">Keep up your learning streak and achieve your goals</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            label="Enrolled Courses"
            value={data.stats.enrolledCourses}
            icon={<BookOpen />}
            change={{ percentage: 12, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Completed Courses"
            value={data.stats.completedCourses}
            icon={<CheckCircle2 />}
            change={{ percentage: 8, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Learning Hours"
            value={`${data.stats.learningHours}h`}
            icon={<Clock />}
            change={{ percentage: 24, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Certificates"
            value={data.stats.certificates}
            icon={<Award />}
            change={{ percentage: 5, isPositive: false }}
          />
        </motion.div>
      </motion.div>

      {/* Continue Learning */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Continue Learning</h2>
          <Button variant="outline" onClick={onViewAllCourses}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.courses.map((course, index) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              onClick={() => onCourseClick?.(course.id)}
              className="cursor-pointer"
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail */}
                {course.thumbnail && (
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      <Play className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}

                <CardContent className="space-y-4">
                  {/* Category Badge */}
                  <div className="flex gap-2 pt-4">
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} max={100} animated={course.progress < 100} />
                  </div>

                  {/* Lesson Count */}
                  <p className="text-xs text-muted-foreground">
                    {course.lessonsCompleted} of {course.lessonsTotal} lessons completed
                  </p>

                  {/* CTA Button */}
                  <Button className="w-full mt-2" size="sm">
                    {course.progress === 100 ? 'Review' : 'Continue'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Roadmap Section */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4">
        <h2 className="text-2xl font-bold">Your Learning Roadmap</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.roadmap.map((step, index) => (
            <Card
              key={step.id}
              variant="glass"
              className="relative overflow-hidden hover:shadow-lg transition-all"
            >
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg font-bold flex-shrink-0',
                        step.status === 'completed' && 'bg-success/20 text-success',
                        step.status === 'in-progress' && 'bg-primary/20 text-primary',
                        step.status === 'locked' && 'bg-muted/20 text-muted-foreground'
                      )}
                    >
                      {step.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                      {step.status === 'in-progress' && <TrendingUp className="h-5 w-5" />}
                      {step.status === 'locked' && <Lock className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.status === 'completed' && 'Completed ✓'}
                        {step.status === 'in-progress' && 'In Progress'}
                        {step.status === 'locked' && 'Locked'}
                      </p>
                    </div>
                  </div>
                </div>
                {step.status !== 'locked' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold">{step.progress}%</span>
                    </div>
                    <Progress value={step.progress} max={100} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning activities from the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.course}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Mock data
const mockDashboardData: StudentDashboardData = {
  stats: {
    enrolledCourses: 8,
    completedCourses: 3,
    learningHours: 124,
    certificates: 2,
  },
  courses: [
    {
      id: '1',
      title: 'Advanced React & TypeScript',
      thumbnail: 'https://via.placeholder.com/400x200/4F46E5/ffffff?text=React+TS',
      progress: 65,
      lessonsTotal: 24,
      lessonsCompleted: 16,
      instructor: 'Sarah Chen',
      category: 'Web Development',
    },
    {
      id: '2',
      title: 'UI/UX Design Fundamentals',
      thumbnail: 'https://via.placeholder.com/400x200/06B6D4/ffffff?text=UI+UX',
      progress: 42,
      lessonsTotal: 18,
      lessonsCompleted: 8,
      instructor: 'Alex Rodriguez',
      category: 'Design',
    },
    {
      id: '3',
      title: 'Python for Data Science',
      thumbnail: 'https://via.placeholder.com/400x200/F59E0B/ffffff?text=Python',
      progress: 88,
      lessonsTotal: 30,
      lessonsCompleted: 26,
      instructor: 'Prof. Kumar',
      category: 'Data Science',
    },
  ],
  roadmap: [
    { id: '1', title: 'Master Fundamentals', status: 'completed', progress: 100 },
    { id: '2', title: 'Intermediate Projects', status: 'in-progress', progress: 60 },
    { id: '3', title: 'Advanced Topics', status: 'locked', progress: 0 },
    { id: '4', title: 'Professional Portfolio', status: 'locked', progress: 0 },
  ],
  recentActivity: [
    { id: '1', action: 'Completed lesson', course: 'Advanced React', timestamp: '2 hours ago' },
    { id: '2', action: 'Earned certificate', course: 'JavaScript Mastery', timestamp: '1 day ago' },
    { id: '3', action: 'Completed quiz', course: 'UI/UX Design', timestamp: '2 days ago' },
  ],
}
