import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Code2, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentSkill, StudentSkillsResponse } from './types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { containerVariants, itemVariants } from '../../lib/animations'

const proficiencyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const emptySkillsResponse: StudentSkillsResponse = {
  skills: [],
  available_skills: [],
  skill_count: 0,
}

const emptySkillForm = {
  skill_id: '',
  proficiency_level: 'beginner',
}

export function StudentSkillsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentSkillsResponse>(emptySkillsResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null)
  const [newSkillForm, setNewSkillForm] = useState(emptySkillForm)
  const [editForm, setEditForm] = useState(emptySkillForm)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSkills() {
      try {
        const response = await apiRequest<StudentSkillsResponse>('/student/skills')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load student skills.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSkills()
    return () => {
      active = false
    }
  }, [])

  const selectedSkillIds = useMemo(() => new Set(data.skills.map((skill) => skill.skill_id)), [data.skills])

  const addableSkills = useMemo(
    () => data.available_skills.filter((skill) => !selectedSkillIds.has(skill.id)),
    [data.available_skills, selectedSkillIds],
  )

  async function handleAddSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<StudentSkillsResponse>('/student/skills', {
        method: 'POST',
        body: {
          skill_id: Number(newSkillForm.skill_id),
          proficiency_level: newSkillForm.proficiency_level,
        },
        csrfToken,
      })
      setData(response)
      setNewSkillForm({
        skill_id: '',
        proficiency_level: 'beginner',
      })
      setSuccess('Skill added to your profile.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to add the skill.')
    } finally {
      setSaving(false)
    }
  }

  function startEditing(skill: StudentSkill) {
    setEditingSkillId(skill.id)
    setEditForm({
      skill_id: String(skill.skill_id),
      proficiency_level: skill.proficiency_level,
    })
    setError(null)
    setSuccess(null)
  }

  async function handleUpdateSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editingSkillId === null) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<StudentSkillsResponse>(`/student/skills/${editingSkillId}`, {
        method: 'PUT',
        body: {
          skill_id: Number(editForm.skill_id),
          proficiency_level: editForm.proficiency_level,
        },
        csrfToken,
      })
      setData(response)
      setEditingSkillId(null)
      setSuccess('Skill updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update the skill.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSkill(skillId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<StudentSkillsResponse>(`/student/skills/${skillId}`, {
        method: 'DELETE',
        csrfToken,
      })
      setData(response)
      if (editingSkillId === skillId) {
        setEditingSkillId(null)
      }
      setSuccess('Skill removed from your profile.')
    } catch (deleteError) {
      setError(deleteError instanceof ApiError ? deleteError.message : 'Unable to remove the skill.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingState title="Loading your skills" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student profile</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Skills profile</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Keep your skill set structured so later matching and candidate review can stay deterministic and explainable.
          </p>
        </div>
        <Badge variant="secondary">{data.skill_count} skill{data.skill_count === 1 ? '' : 's'}</Badge>
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Skills List */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Your skills</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the technologies and domains you want companies to see during candidate review.
            </p>
          </div>

          {data.skills.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Code2 className="h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-semibold">No skills added yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first skill to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {data.skills.map((skill) => (
                <motion.div key={skill.id} variants={itemVariants}>
                  <Card className="transition-all hover:shadow-lg dark:bg-card dark:border-border">
                    {editingSkillId === skill.id ? (
                      <CardContent className="pt-6">
                        <form onSubmit={handleUpdateSkill} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Skill</label>
                              <select
                                value={editForm.skill_id}
                                onChange={(event) => setEditForm({ ...editForm, skill_id: event.target.value })}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                              >
                                {data.available_skills.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Proficiency</label>
                              <select
                                value={editForm.proficiency_level}
                                onChange={(event) => setEditForm({ ...editForm, proficiency_level: event.target.value })}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                              >
                                {proficiencyOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={saving}>
                              {saving ? 'Saving…' : 'Save changes'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSkillId(null)}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                          <div className="flex-1">
                            <CardTitle className="text-base">{skill.skill_name}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Proficiency: {skill.proficiency_level}
                            </p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            {skill.proficiency_level}
                          </Badge>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(skill)}
                            disabled={saving}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleDeleteSkill(skill.id)}
                            disabled={saving}
                          >
                            Remove
                          </Button>
                        </CardContent>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Add Skill Form */}
        <Card className="h-fit dark:bg-card dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add a skill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="skill-select" className="text-sm font-medium">
                  Skill
                </label>
                <select
                  id="skill-select"
                  value={newSkillForm.skill_id}
                  onChange={(event) => setNewSkillForm({ ...newSkillForm, skill_id: event.target.value })}
                  required
                  disabled={addableSkills.length === 0}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm disabled:opacity-50"
                >
                  <option value="">Select a skill</option>
                  {addableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="proficiency-select" className="text-sm font-medium">
                  Proficiency
                </label>
                <select
                  id="proficiency-select"
                  value={newSkillForm.proficiency_level}
                  onChange={(event) => setNewSkillForm({ ...newSkillForm, proficiency_level: event.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  {proficiencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {addableSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All available skills are already in your profile.
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={saving || addableSkills.length === 0}
                className="w-full"
              >
                {saving ? 'Adding…' : 'Add skill'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
