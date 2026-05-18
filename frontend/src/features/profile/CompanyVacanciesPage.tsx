import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../lib/api'
import { emptyCompanyVacanciesResponse, fetchCompanyVacancies, retireCompanyVacancy, saveCompanyVacancy } from './companyVacanciesApi'

const workStyleOptions = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

const languageLevelOptions = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'business', label: 'Business' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
]

type RequirementType = 'none' | 'required' | 'preferred'

export function CompanyVacanciesPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState(emptyCompanyVacanciesResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [location, setLocation] = useState('')
  const [workStyle, setWorkStyle] = useState('onsite')
  const [relocationSupport, setRelocationSupport] = useState(false)
  const [status, setStatus] = useState('draft')
  const [requiredSkillIds, setRequiredSkillIds] = useState<number[]>([])
  const [preferredSkillIds, setPreferredSkillIds] = useState<number[]>([])
  const [japaneseRequirementType, setJapaneseRequirementType] = useState<RequirementType>('none')
  const [japaneseLevel, setJapaneseLevel] = useState('business')
  const [englishRequirementType, setEnglishRequirementType] = useState<RequirementType>('none')
  const [englishLevel, setEnglishLevel] = useState('business')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedVacancy = useMemo(
    () => data.vacancies.find((vacancy) => vacancy.vacancy_id === selectedVacancyId) ?? null,
    [data.vacancies, selectedVacancyId],
  )

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        const response = await fetchCompanyVacancies()
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load vacancies.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadVacancies()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedVacancy) {
      setTitle('')
      setDescription('')
      setEmploymentType('')
      setExperienceLevel('')
      setLocation('')
      setWorkStyle('onsite')
      setRelocationSupport(false)
      setStatus('draft')
      setRequiredSkillIds([])
      setPreferredSkillIds([])
      setJapaneseRequirementType('none')
      setJapaneseLevel('business')
      setEnglishRequirementType('none')
      setEnglishLevel('business')
      return
    }

    setTitle(selectedVacancy.title)
    setDescription(selectedVacancy.description)
    setEmploymentType(selectedVacancy.employment_type)
    setExperienceLevel(selectedVacancy.experience_level)
    setLocation(selectedVacancy.location)
    setWorkStyle(selectedVacancy.work_style)
    setRelocationSupport(selectedVacancy.relocation_support)
    setStatus(selectedVacancy.status)
    setRequiredSkillIds(
      selectedVacancy.skill_requirements
        .filter((requirement) => requirement.requirement_type === 'required')
        .map((requirement) => requirement.skill_id),
    )
    setPreferredSkillIds(
      selectedVacancy.skill_requirements
        .filter((requirement) => requirement.requirement_type === 'preferred')
        .map((requirement) => requirement.skill_id),
    )

    const japaneseRequirement = selectedVacancy.language_requirements.find(
      (requirement) => requirement.language === 'japanese',
    )
    const englishRequirement = selectedVacancy.language_requirements.find(
      (requirement) => requirement.language === 'english',
    )

    setJapaneseRequirementType((japaneseRequirement?.requirement_type as RequirementType | undefined) ?? 'none')
    setJapaneseLevel(japaneseRequirement?.minimum_level ?? 'business')
    setEnglishRequirementType((englishRequirement?.requirement_type as RequirementType | undefined) ?? 'none')
    setEnglishLevel(englishRequirement?.minimum_level ?? 'business')
  }, [selectedVacancy])

  async function refreshVacancies() {
    const response = await fetchCompanyVacancies()
    setData(response)
  }

  function toggleSkill(skillId: number, requirementType: 'required' | 'preferred') {
    if (requirementType === 'required') {
      setRequiredSkillIds((current) =>
        current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId],
      )
      setPreferredSkillIds((current) => current.filter((id) => id !== skillId))
      return
    }

    setPreferredSkillIds((current) =>
      current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId],
    )
    setRequiredSkillIds((current) => current.filter((id) => id !== skillId))
  }

  function buildLanguageRequirementsPayload() {
    const requirements: Array<{ language: string; minimum_level: string; requirement_type: string }> = []
    if (japaneseRequirementType !== 'none') {
      requirements.push({
        language: 'japanese',
        minimum_level: japaneseLevel,
        requirement_type: japaneseRequirementType,
      })
    }
    if (englishRequirementType !== 'none') {
      requirements.push({
        language: 'english',
        minimum_level: englishLevel,
        requirement_type: englishRequirementType,
      })
    }
    return requirements
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        title,
        description,
        employment_type: employmentType,
        experience_level: experienceLevel,
        location,
        work_style: workStyle,
        relocation_support: relocationSupport,
        status,
        required_skill_ids: requiredSkillIds,
        preferred_skill_ids: preferredSkillIds,
        language_requirements: buildLanguageRequirementsPayload(),
      }

      if (selectedVacancy) {
        await saveCompanyVacancy({
          vacancyId: selectedVacancy.vacancy_id,
          payload: body,
          csrfToken,
        })
        setSuccess('Vacancy updated successfully.')
      } else {
        await saveCompanyVacancy({
          payload: body,
          csrfToken,
        })
        setSuccess('Vacancy created successfully.')
      }

      await refreshVacancies()
      if (!selectedVacancy) {
        setSelectedVacancyId(null)
      }
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save vacancy.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRetire(vacancyId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await retireCompanyVacancy(vacancyId, csrfToken)
      await refreshVacancies()
      if (selectedVacancyId === vacancyId) {
        setSelectedVacancyId(null)
      }
      setSuccess('Vacancy retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire vacancy.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading vacancies…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company vacancies</p>
          <h1>Vacancy management</h1>
          <p className="lead">Create, update, and retire structured vacancies that later applications and matching flows can understand.</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedVacancy ? 'Edit vacancy' : 'Create vacancy'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              <span>Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required />
            </label>
            <label>
              <span>Employment type</span>
              <input value={employmentType} onChange={(event) => setEmploymentType(event.target.value)} placeholder="full_time" required />
            </label>
            <label>
              <span>Experience level</span>
              <input value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} placeholder="junior" required />
            </label>
            <label>
              <span>Location</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} required />
            </label>
            <label>
              <span>Work style</span>
              <select value={workStyle} onChange={(event) => setWorkStyle(event.target.value)}>
                {workStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="toggle-field">
              <span>Relocation support available</span>
              <input
                type="checkbox"
                checked={relocationSupport}
                onChange={(event) => setRelocationSupport(event.target.checked)}
              />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <div className="card compact-card">
              <strong>Skill requirements</strong>
              <p className="muted">Choose required and preferred skills from the shared taxonomy.</p>
              <div className="stack-list">
                {data.available_skills.map((skill) => (
                  <div key={skill.id} className="actions">
                    <span>{skill.name}</span>
                    <label>
                      <input
                        type="checkbox"
                        checked={requiredSkillIds.includes(skill.id)}
                        onChange={() => toggleSkill(skill.id, 'required')}
                      />
                      <span> Required</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={preferredSkillIds.includes(skill.id)}
                        onChange={() => toggleSkill(skill.id, 'preferred')}
                      />
                      <span> Preferred</span>
                    </label>
                  </div>
                ))}
                {data.available_skills.length === 0 ? <p className="muted">No skills are available yet.</p> : null}
              </div>
            </div>

            <div className="card compact-card">
              <strong>Language requirements</strong>
              <div className="stack-list">
                <label>
                  <span>Japanese requirement</span>
                  <select
                    value={japaneseRequirementType}
                    onChange={(event) => setJapaneseRequirementType(event.target.value as RequirementType)}
                  >
                    <option value="none">Not specified</option>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                </label>
                {japaneseRequirementType !== 'none' ? (
                  <label>
                    <span>Japanese minimum level</span>
                    <select value={japaneseLevel} onChange={(event) => setJapaneseLevel(event.target.value)}>
                      {languageLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label>
                  <span>English requirement</span>
                  <select
                    value={englishRequirementType}
                    onChange={(event) => setEnglishRequirementType(event.target.value as RequirementType)}
                  >
                    <option value="none">Not specified</option>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                </label>
                {englishRequirementType !== 'none' ? (
                  <label>
                    <span>English minimum level</span>
                    <select value={englishLevel} onChange={(event) => setEnglishLevel(event.target.value)}>
                      {languageLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </div>

            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedVacancy ? 'Update vacancy' : 'Create vacancy'}
              </button>
              {selectedVacancy ? (
                <button className="secondary-button inline-button" type="button" onClick={() => setSelectedVacancyId(null)} disabled={saving}>
                  New vacancy
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Vacancies</h2>
          <div className="stack-list">
            {data.vacancies.map((vacancy) => (
              <article key={vacancy.vacancy_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{vacancy.title}</h3>
                    <p className="muted">
                      {vacancy.employment_type} · {vacancy.experience_level} · {vacancy.location} · {vacancy.work_style_label}
                    </p>
                  </div>
                  <span className={`status-pill ${vacancy.status === 'active' ? 'status-success' : 'status-muted'}`}>
                    {vacancy.status}
                  </span>
                </div>
                <p>{vacancy.description}</p>
                <p className="muted">{vacancy.relocation_support ? 'Relocation supported' : 'No relocation support listed'}</p>
                {vacancy.skill_requirements.length ? (
                  <p className="muted">
                    Skills:{' '}
                    {vacancy.skill_requirements
                      .map((requirement) => `${requirement.skill_name} (${requirement.requirement_type})`)
                      .join(', ')}
                  </p>
                ) : null}
                {vacancy.language_requirements.length ? (
                  <p className="muted">
                    Languages:{' '}
                    {vacancy.language_requirements
                      .map(
                        (requirement) =>
                          `${requirement.language_label} ${requirement.minimum_level_label} (${requirement.requirement_type})`,
                      )
                      .join(', ')}
                  </p>
                ) : null}
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedVacancyId(vacancy.vacancy_id)}>
                    Edit
                  </button>
                  {vacancy.status === 'active' ? (
                    <Link className="secondary-button inline-button" to={`/company/vacancies/${vacancy.vacancy_id}/matches`}>
                      View matches
                    </Link>
                  ) : null}
                  {vacancy.status !== 'inactive' ? (
                    <button className="danger-button inline-button" type="button" onClick={() => void handleRetire(vacancy.vacancy_id)} disabled={saving}>
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.vacancies.length === 0 ? <p className="muted">No vacancies yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
