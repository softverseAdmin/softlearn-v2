import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentSkill, StudentSkillsResponse } from './types'

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
      <section className="page">
        <div className="card">Loading student skills…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student profile</p>
          <h1>Skills profile</h1>
          <p className="lead">Keep your skill set structured so later matching and candidate review can stay deterministic and explainable.</p>
        </div>
        <div className="card compact-card">
          <strong>Skill coverage</strong>
          <p className="muted">{data.skill_count} skill{data.skill_count === 1 ? '' : 's'} added</p>
        </div>
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Your skills</h2>
          <p className="muted">Add the technologies and domains you want companies to see during candidate review.</p>
          {data.skills.length === 0 ? <p className="muted">No skills added yet.</p> : null}
          <div className="stack-list">
            {data.skills.map((skill) => (
              <article key={skill.id} className="skill-card">
                {editingSkillId === skill.id ? (
                  <form className="form" onSubmit={handleUpdateSkill}>
                    <div className="inline-form-grid">
                      <label>
                        <span>Skill</span>
                        <select
                          value={editForm.skill_id}
                          onChange={(event) => setEditForm({ ...editForm, skill_id: event.target.value })}
                          required
                        >
                          {data.available_skills.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Proficiency</span>
                        <select
                          value={editForm.proficiency_level}
                          onChange={(event) => setEditForm({ ...editForm, proficiency_level: event.target.value })}
                          required
                        >
                          {proficiencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="actions">
                      <button className="primary-button" type="submit" disabled={saving}>
                        {saving ? 'Saving…' : 'Save changes'}
                      </button>
                      <button className="secondary-button" type="button" onClick={() => setEditingSkillId(null)} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="skill-card-header">
                      <div>
                        <h3>{skill.skill_name}</h3>
                        <p className="muted skill-meta">Proficiency: {skill.proficiency_level}</p>
                      </div>
                      <div className="actions">
                        <button className="secondary-button" type="button" onClick={() => startEditing(skill)} disabled={saving}>
                          Edit
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => void handleDeleteSkill(skill.id)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>

        <aside className="card form-card">
          <h2>Add a skill</h2>
          <form className="form" onSubmit={handleAddSkill}>
            <label>
              <span>Skill</span>
              <select
                value={newSkillForm.skill_id}
                onChange={(event) => setNewSkillForm({ ...newSkillForm, skill_id: event.target.value })}
                required
                disabled={addableSkills.length === 0}
              >
                <option value="">Select a skill</option>
                {addableSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Proficiency</span>
              <select
                value={newSkillForm.proficiency_level}
                onChange={(event) => setNewSkillForm({ ...newSkillForm, proficiency_level: event.target.value })}
              >
                {proficiencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {addableSkills.length === 0 ? <p className="muted">All available skills are already in your profile.</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success">{success}</p> : null}
            <button className="primary-button" type="submit" disabled={saving || addableSkills.length === 0}>
              {saving ? 'Saving…' : 'Add skill'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}
