import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyProfile, CompanyHiringPreferences, CompanyMember } from './types'

const emptyProfile: CompanyProfile = {
  company_id: 0,
  name: '',
  description: '',
  profile_complete: false,
}

const emptyHiringPrefs: CompanyHiringPreferences = {
  default_experience_level: '',
  preferred_skills: [],
  min_salary: null,
  max_salary: null,
}

const experienceLevelOptions = [
  { value: '', label: 'Not specified' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'director', label: 'Director' },
]

const memberRoleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

export function CompanyProfilePage() {
  const { csrfToken, refreshSession } = useAuth()
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile)
  const [hiringPrefs, setHiringPrefs] = useState<CompanyHiringPreferences>(emptyHiringPrefs)
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingMembers, setSavingMembers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newSkillInput, setNewSkillInput] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [memberRoleInput, setMemberRoleInput] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [profileData, prefsData, membersData] = await Promise.all([
          apiRequest<CompanyProfile>('/company/profile'),
          apiRequest<CompanyHiringPreferences>('/company/hiring-preferences'),
          apiRequest<CompanyMember[]>('/company/members'),
        ])
        if (active) {
          setProfile(profileData)
          setHiringPrefs(prefsData)
          setMembers(membersData)
          const roleMap: { [key: number]: string } = {}
          membersData.forEach((member) => {
            roleMap[member.id] = member.role
          })
          setMemberRoleInput(roleMap)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load company data.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadData()
    return () => {
      active = false
    }
  }, [])

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await apiRequest<CompanyProfile>('/company/profile', {
        method: 'PUT',
        body: {
          name: profile.name,
          description: profile.description,
        },
        csrfToken,
      })
      setProfile(updated)
      await refreshSession()
      setSuccess('Company profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save company profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleHiringPrefsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingPrefs(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await apiRequest<CompanyHiringPreferences>('/company/hiring-preferences', {
        method: 'PUT',
        body: {
          default_experience_level: hiringPrefs.default_experience_level,
          preferred_skills: hiringPrefs.preferred_skills,
          min_salary: hiringPrefs.min_salary,
          max_salary: hiringPrefs.max_salary,
        },
        csrfToken,
      })
      setHiringPrefs(updated)
      setSuccess('Hiring preferences updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save hiring preferences.')
    } finally {
      setSavingPrefs(false)
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingMembers(true)
    setError(null)
    setSuccess(null)

    try {
      const newMember = await apiRequest<CompanyMember>('/company/members', {
        method: 'POST',
        body: {
          email: newMemberEmail,
          role: 'member',
        },
        csrfToken,
      })
      setMembers([...members, newMember])
      setMemberRoleInput({ ...memberRoleInput, [newMember.id]: newMember.role })
      setNewMemberEmail('')
      setSuccess('Team member added successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to add team member.')
    } finally {
      setSavingMembers(false)
    }
  }

  async function handleUpdateMemberRole(memberId: number) {
    setSavingMembers(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await apiRequest<CompanyMember>(`/company/members/${memberId}`, {
        method: 'PUT',
        body: {
          role: memberRoleInput[memberId],
        },
        csrfToken,
      })
      setMembers(members.map((m) => (m.id === memberId ? updated : m)))
      setSuccess('Member role updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update member role.')
    } finally {
      setSavingMembers(false)
    }
  }

  async function handleRemoveMember(memberId: number) {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    setSavingMembers(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest(`/company/members/${memberId}`, {
        method: 'DELETE',
        csrfToken,
      })
      setMembers(members.filter((m) => m.id !== memberId))
      const { [memberId]: removedRole, ...remaining } = memberRoleInput
      void removedRole
      setMemberRoleInput(remaining)
      setSuccess('Team member removed successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to remove team member.')
    } finally {
      setSavingMembers(false)
    }
  }

  function addPreferredSkill() {
    if (newSkillInput.trim() && !hiringPrefs.preferred_skills.includes(newSkillInput.trim())) {
      setHiringPrefs({
        ...hiringPrefs,
        preferred_skills: [...hiringPrefs.preferred_skills, newSkillInput.trim()],
      })
      setNewSkillInput('')
    }
  }

  function removePreferredSkill(skill: string) {
    setHiringPrefs({
      ...hiringPrefs,
      preferred_skills: hiringPrefs.preferred_skills.filter((s) => s !== skill),
    })
  }

  if (loading) {
    return <section className="page"><div className="card">Loading company profile…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company profile</p>
          <h1>Company overview</h1>
          <p className="lead">Maintain the organization identity, hiring preferences, and team members for candidate review and hiring workflows.</p>
        </div>
        <div className="card compact-card">
          <strong>Profile completeness</strong>
          <p className="muted">{profile.profile_complete ? 'Complete' : 'Incomplete'}</p>
        </div>
      </div>

      <div className="card form-card">
        <h2>Company Information</h2>
        <form className="form" onSubmit={handleProfileSubmit}>
          <label>
            <span>Company name</span>
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
          </label>
          <label>
            <span>Company description</span>
            <textarea
              value={profile.description}
              onChange={(event) => setProfile({ ...profile, description: event.target.value })}
              rows={6}
              placeholder="Describe the company, hiring focus, and student opportunities."
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save company profile'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h2>Hiring Preferences</h2>
        <form className="form" onSubmit={handleHiringPrefsSubmit}>
          <label>
            <span>Default experience level</span>
            <select
              value={hiringPrefs.default_experience_level}
              onChange={(event) =>
                setHiringPrefs({ ...hiringPrefs, default_experience_level: event.target.value })
              }
            >
              {experienceLevelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Preferred skills</span>
            <div className="skill-input-group">
              <input
                type="text"
                value={newSkillInput}
                onChange={(event) => setNewSkillInput(event.target.value)}
                placeholder="Enter a skill name"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addPreferredSkill()
                  }
                }}
              />
              <button type="button" onClick={addPreferredSkill} className="secondary-button">
                Add
              </button>
            </div>
            {hiringPrefs.preferred_skills.length > 0 ? (
              <div className="skill-tags">
                {hiringPrefs.preferred_skills.map((skill) => (
                  <div key={skill} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(skill)}
                      className="skill-tag-close"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No preferred skills yet.</p>
            )}
          </label>

          <div className="form-row">
            <label>
              <span>Minimum salary (annual)</span>
              <input
                type="number"
                value={hiringPrefs.min_salary ?? ''}
                onChange={(event) => setHiringPrefs({ ...hiringPrefs, min_salary: event.target.value ? parseInt(event.target.value) : null })}
                placeholder="e.g., 300000"
                min="0"
              />
            </label>
            <label>
              <span>Maximum salary (annual)</span>
              <input
                type="number"
                value={hiringPrefs.max_salary ?? ''}
                onChange={(event) => setHiringPrefs({ ...hiringPrefs, max_salary: event.target.value ? parseInt(event.target.value) : null })}
                placeholder="e.g., 600000"
                min="0"
              />
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button className="primary-button" type="submit" disabled={savingPrefs}>
            {savingPrefs ? 'Saving…' : 'Save hiring preferences'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h2>Team Members</h2>
        
        <form className="form" onSubmit={handleAddMember}>
          <label>
            <span>Add team member by email</span>
            <div className="member-input-group">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(event) => setNewMemberEmail(event.target.value)}
                placeholder="Enter team member email"
                required
              />
              <button type="submit" className="secondary-button" disabled={savingMembers}>
                {savingMembers ? 'Adding…' : 'Add'}
              </button>
            </div>
          </label>
        </form>

        {members.length > 0 ? (
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-row">
                <div className="member-info">
                  <strong>{member.full_name}</strong>
                  <p className="muted">{member.email}</p>
                </div>
                <div className="member-controls">
                  <select
                    value={memberRoleInput[member.id] || member.role}
                    onChange={(event) => {
                      setMemberRoleInput({ ...memberRoleInput, [member.id]: event.target.value })
                    }}
                    onBlur={() => {
                      if (memberRoleInput[member.id] !== member.role) {
                        void handleUpdateMemberRole(member.id)
                      }
                    }}
                  >
                    {memberRoleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleRemoveMember(member.id)}
                    className="danger-button"
                    disabled={savingMembers}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No team members yet. Add your first team member above.</p>
        )}

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}
      </div>
    </section>
  )
}
