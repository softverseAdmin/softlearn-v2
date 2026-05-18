import type { Dispatch, SetStateAction } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { SkillOption, StudentEducationRecord, StudentExperienceRecord } from '../types'
import {
  emptyEducationDetailDraft,
  toEducationDraft,
  toExperienceDraft,
  type CertificateRecord,
  type EducationDetailDraft,
  type EducationDetailMap,
  type EducationDraft,
  type ExperienceDraft,
  type ExperienceSkillMap,
} from './shared'

type SetState<T> = Dispatch<SetStateAction<T>>

type SkillChipSelectorProps = {
  availableSkills: SkillOption[]
  selectedSkillIds: number[]
  onToggle: (skillId: number) => void
}

function SkillChipSelector({ availableSkills, selectedSkillIds, onToggle }: SkillChipSelectorProps) {
  if (availableSkills.length === 0) {
    return <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableSkills.map((skill) => {
        const isSelected = selectedSkillIds.includes(skill.id)

        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => onToggle(skill.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
            }`}
          >
            {skill.name}
          </button>
        )
      })}
    </div>
  )
}

type SkillsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableSkills: SkillOption[]
  skillDraftIds: number[]
  saving: boolean
  onToggleSkillDraft: (skillId: number) => void
  onSave: () => void
}

export function SkillsDialog({
  open,
  onOpenChange,
  availableSkills,
  skillDraftIds,
  saving,
  onToggleSkillDraft,
  onSave,
}: SkillsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit skills</DialogTitle>
          <DialogDescription>Select the skills you want to show on your profile.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {availableSkills.map((skill) => {
            const checked = skillDraftIds.includes(skill.id)

            return (
              <label
                key={skill.id}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-primary/30 hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleSkillDraft(skill.id)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
              </label>
            )
          })}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save skills'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type EducationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasEducation: boolean
  records: StudentEducationRecord[]
  educationDrafts: Record<number, EducationDraft>
  setEducationDrafts: SetState<Record<number, EducationDraft>>
  educationDetails: EducationDetailMap
  educationDetailDrafts: EducationDetailMap
  setEducationDetailDrafts: SetState<EducationDetailMap>
  newEducation: EducationDraft
  setNewEducation: SetState<EducationDraft>
  newEducationDetails: EducationDetailDraft
  setNewEducationDetails: SetState<EducationDetailDraft>
  availableSkills: SkillOption[]
  saving: boolean
  onToggleEducationSkill: (recordId: number, skillId: number) => void
  onToggleNewEducationSkill: (skillId: number) => void
  onDeleteEducation: (recordId: number) => void
  onUpdateEducation: (recordId: number) => void
  onCreateEducation: () => void
}

export function EducationDialog({
  open,
  onOpenChange,
  hasEducation,
  records,
  educationDrafts,
  setEducationDrafts,
  educationDetails,
  educationDetailDrafts,
  setEducationDetailDrafts,
  newEducation,
  setNewEducation,
  newEducationDetails,
  setNewEducationDetails,
  availableSkills,
  saving,
  onToggleEducationSkill,
  onToggleNewEducationSkill,
  onDeleteEducation,
  onUpdateEducation,
  onCreateEducation,
}: EducationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{hasEducation ? 'Manage education' : 'Add education'}</DialogTitle>
          <DialogDescription>Update your education history and add a new education entry from one place.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {records.map((record) => {
            const draft = educationDrafts[record.id] ?? toEducationDraft(record)
            const detailDraft = educationDetailDrafts[record.id] ?? educationDetails[record.id] ?? emptyEducationDetailDraft

            return (
              <div key={record.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{record.institution || 'Education entry'}</h3>
                    <p className="text-sm text-slate-500">{record.field_of_study || 'Field of study'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteEducation(record.id)}
                    disabled={saving}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Institution</label>
                    <Input
                      value={draft.institution}
                      onChange={(event) =>
                        setEducationDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, institution: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Field of study</label>
                    <Input
                      value={draft.field_of_study}
                      onChange={(event) =>
                        setEducationDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, field_of_study: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Start date</label>
                    <Input
                      type="date"
                      value={draft.start_date}
                      onChange={(event) =>
                        setEducationDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, start_date: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">End date</label>
                    <Input
                      type="date"
                      value={draft.end_date}
                      onChange={(event) =>
                        setEducationDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, end_date: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Completion status</label>
                    <select
                      value={draft.completion_status}
                      onChange={(event) =>
                        setEducationDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, completion_status: event.target.value },
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Grade</label>
                    <Input
                      value={detailDraft.grade}
                      onChange={(event) =>
                        setEducationDetailDrafts((current) => ({
                          ...current,
                          [record.id]: { ...detailDraft, grade: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Activities and societies</label>
                    <Input
                      value={detailDraft.activities}
                      onChange={(event) =>
                        setEducationDetailDrafts((current) => ({
                          ...current,
                          [record.id]: { ...detailDraft, activities: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <span className="text-xs text-slate-500">Saved with your profile</span>
                  </div>
                  <Textarea
                    rows={4}
                    value={detailDraft.description}
                    onChange={(event) =>
                      setEducationDetailDrafts((current) => ({
                        ...current,
                        [record.id]: { ...detailDraft, description: event.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Skills</label>
                  <SkillChipSelector
                    availableSkills={availableSkills}
                    selectedSkillIds={detailDraft.skillIds}
                    onToggle={(skillId) => onToggleEducationSkill(record.id, skillId)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => onUpdateEducation(record.id)} disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            )
          })}

          <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add education</h3>
              <p className="text-sm text-slate-500">Create a new education entry for your profile.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Institution</label>
                <Input value={newEducation.institution} onChange={(event) => setNewEducation({ ...newEducation, institution: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Field of study</label>
                <Input value={newEducation.field_of_study} onChange={(event) => setNewEducation({ ...newEducation, field_of_study: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start date</label>
                <Input type="date" value={newEducation.start_date} onChange={(event) => setNewEducation({ ...newEducation, start_date: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End date</label>
                <Input type="date" value={newEducation.end_date} onChange={(event) => setNewEducation({ ...newEducation, end_date: event.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Completion status</label>
                <select
                  value={newEducation.completion_status}
                  onChange={(event) => setNewEducation({ ...newEducation, completion_status: event.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Grade</label>
                <Input
                  value={newEducationDetails.grade}
                  onChange={(event) => setNewEducationDetails((current) => ({ ...current, grade: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Activities and societies</label>
                <Input
                  value={newEducationDetails.activities}
                  onChange={(event) => setNewEducationDetails((current) => ({ ...current, activities: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <span className="text-xs text-slate-500">Saved with your profile</span>
              </div>
              <Textarea
                rows={4}
                value={newEducationDetails.description}
                onChange={(event) => setNewEducationDetails((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Skills</label>
              <SkillChipSelector
                availableSkills={availableSkills}
                selectedSkillIds={newEducationDetails.skillIds}
                onToggle={onToggleNewEducationSkill}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Close
          </Button>
          <Button type="button" onClick={onCreateEducation} disabled={saving}>
            {saving ? 'Saving…' : 'Add education'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CertificateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasCertificates: boolean
  certificates: CertificateRecord[]
  certificateDrafts: Record<number, CertificateRecord>
  setCertificateDrafts: SetState<Record<number, CertificateRecord>>
  newCertificate: CertificateRecord
  setNewCertificate: SetState<CertificateRecord>
  availableSkills: SkillOption[]
  saving: boolean
  onToggleCertificateSkill: (recordId: number, skillId: number) => void
  onToggleNewCertificateSkill: (skillId: number) => void
  onDeleteCertificate: (recordId: number) => void
  onUpdateCertificate: (recordId: number) => void
  onCreateCertificate: () => void
}

export function CertificateDialog({
  open,
  onOpenChange,
  hasCertificates,
  certificates,
  certificateDrafts,
  setCertificateDrafts,
  newCertificate,
  setNewCertificate,
  availableSkills,
  saving,
  onToggleCertificateSkill,
  onToggleNewCertificateSkill,
  onDeleteCertificate,
  onUpdateCertificate,
  onCreateCertificate,
}: CertificateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{hasCertificates ? 'Manage certificates' : 'Add certificate'}</DialogTitle>
          <DialogDescription>Update your certificates, licenses, and achievements from one place.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {certificates.map((certificate) => {
            const draft = certificateDrafts[certificate.id] ?? certificate

            return (
              <div key={certificate.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{draft.name || 'Certificate entry'}</h3>
                    <p className="text-sm text-slate-500">{draft.issuer || 'Issuer'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteCertificate(certificate.id)}
                    disabled={saving}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Certificate name</label>
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, name: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Issuer</label>
                    <Input
                      value={draft.issuer}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, issuer: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Issue date</label>
                    <Input
                      type="date"
                      value={draft.issueDate}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, issueDate: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Expiry date</label>
                    <Input
                      type="date"
                      value={draft.expiryDate}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, expiryDate: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Credential ID</label>
                    <Input
                      value={draft.credentialId}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, credentialId: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Credential URL</label>
                    <Input
                      type="url"
                      value={draft.credentialUrl}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, credentialUrl: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    rows={4}
                    value={draft.description}
                    onChange={(event) =>
                      setCertificateDrafts((current) => ({
                        ...current,
                        [certificate.id]: { ...draft, description: event.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Skills</label>
                  <SkillChipSelector
                    availableSkills={availableSkills}
                    selectedSkillIds={draft.skillIds}
                    onToggle={(skillId) => onToggleCertificateSkill(certificate.id, skillId)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => onUpdateCertificate(certificate.id)} disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            )
          })}

          <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add certificate</h3>
              <p className="text-sm text-slate-500">Create a new certificate entry for your profile.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Certificate name</label>
                <Input value={newCertificate.name} onChange={(event) => setNewCertificate({ ...newCertificate, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Issuer</label>
                <Input value={newCertificate.issuer} onChange={(event) => setNewCertificate({ ...newCertificate, issuer: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Issue date</label>
                <Input type="date" value={newCertificate.issueDate} onChange={(event) => setNewCertificate({ ...newCertificate, issueDate: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Expiry date</label>
                <Input type="date" value={newCertificate.expiryDate} onChange={(event) => setNewCertificate({ ...newCertificate, expiryDate: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Credential ID</label>
                <Input value={newCertificate.credentialId} onChange={(event) => setNewCertificate({ ...newCertificate, credentialId: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Credential URL</label>
                <Input type="url" value={newCertificate.credentialUrl} onChange={(event) => setNewCertificate({ ...newCertificate, credentialUrl: event.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                rows={4}
                value={newCertificate.description}
                onChange={(event) => setNewCertificate({ ...newCertificate, description: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Skills</label>
              <SkillChipSelector
                availableSkills={availableSkills}
                selectedSkillIds={newCertificate.skillIds}
                onToggle={onToggleNewCertificateSkill}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Close
          </Button>
          <Button type="button" onClick={onCreateCertificate} disabled={saving}>
            {saving ? 'Saving…' : 'Add certificate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ExperienceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasExperience: boolean
  records: StudentExperienceRecord[]
  experienceDrafts: Record<number, ExperienceDraft>
  setExperienceDrafts: SetState<Record<number, ExperienceDraft>>
  experienceSkills: ExperienceSkillMap
  experienceSkillDrafts: ExperienceSkillMap
  newExperience: ExperienceDraft
  setNewExperience: SetState<ExperienceDraft>
  newExperienceSkillIds: number[]
  availableSkills: SkillOption[]
  saving: boolean
  onToggleExperienceSkill: (recordId: number, skillId: number) => void
  onToggleNewExperienceSkill: (skillId: number) => void
  onDeleteExperience: (recordId: number) => void
  onUpdateExperience: (recordId: number) => void
  onCreateExperience: () => void
}

export function ExperienceDialog({
  open,
  onOpenChange,
  hasExperience,
  records,
  experienceDrafts,
  setExperienceDrafts,
  experienceSkills,
  experienceSkillDrafts,
  newExperience,
  setNewExperience,
  newExperienceSkillIds,
  availableSkills,
  saving,
  onToggleExperienceSkill,
  onToggleNewExperienceSkill,
  onDeleteExperience,
  onUpdateExperience,
  onCreateExperience,
}: ExperienceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{hasExperience ? 'Edit experience' : 'Add experience'}</DialogTitle>
          <DialogDescription>Manage your work history and add a new experience entry from one place.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {records.map((record) => {
            const draft = experienceDrafts[record.id] ?? toExperienceDraft(record)

            return (
              <div key={record.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{record.role_title || 'Experience entry'}</h3>
                    <p className="text-sm text-slate-500">{record.organization || 'Organization'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteExperience(record.id)}
                    disabled={saving}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input
                      value={draft.role_title}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, role_title: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Company or organization</label>
                    <Input
                      value={draft.organization}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, organization: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Experience type</label>
                    <select
                      value={draft.experience_type}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, experience_type: event.target.value },
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="work">Work</option>
                      <option value="internship">Internship</option>
                      <option value="project">Project</option>
                      <option value="freelance">Freelance</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Start date</label>
                    <Input
                      type="date"
                      value={draft.start_date}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, start_date: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">End date</label>
                    <Input
                      type="date"
                      disabled={draft.is_current}
                      value={draft.end_date}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, end_date: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 md:self-end">
                    <input
                      type="checkbox"
                      checked={draft.is_current}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: {
                            ...draft,
                            is_current: event.target.checked,
                            end_date: event.target.checked ? '' : draft.end_date,
                          },
                        }))
                      }
                    />
                    I am currently working in this role
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    rows={5}
                    value={draft.summary}
                    onChange={(event) =>
                      setExperienceDrafts((current) => ({
                        ...current,
                        [record.id]: { ...draft, summary: event.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-slate-700">Skills</label>
                    <span className="text-xs text-slate-500">Saved with your profile</span>
                  </div>
                  <SkillChipSelector
                    availableSkills={availableSkills}
                    selectedSkillIds={experienceSkillDrafts[record.id] ?? experienceSkills[record.id] ?? []}
                    onToggle={(skillId) => onToggleExperienceSkill(record.id, skillId)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => onUpdateExperience(record.id)} disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            )
          })}

          <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add experience</h3>
              <p className="text-sm text-slate-500">Create a new work history entry for your profile.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input value={newExperience.role_title} onChange={(event) => setNewExperience({ ...newExperience, role_title: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company or organization</label>
                <Input value={newExperience.organization} onChange={(event) => setNewExperience({ ...newExperience, organization: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Experience type</label>
                <select
                  value={newExperience.experience_type}
                  onChange={(event) => setNewExperience({ ...newExperience, experience_type: event.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="work">Work</option>
                  <option value="internship">Internship</option>
                  <option value="project">Project</option>
                  <option value="freelance">Freelance</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start date</label>
                <Input type="date" value={newExperience.start_date} onChange={(event) => setNewExperience({ ...newExperience, start_date: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End date</label>
                <Input
                  type="date"
                  disabled={newExperience.is_current}
                  value={newExperience.end_date}
                  onChange={(event) => setNewExperience({ ...newExperience, end_date: event.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 md:self-end">
                <input
                  type="checkbox"
                  checked={newExperience.is_current}
                  onChange={(event) =>
                    setNewExperience({
                      ...newExperience,
                      is_current: event.target.checked,
                      end_date: event.target.checked ? '' : newExperience.end_date,
                    })
                  }
                />
                I am currently working in this role
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                rows={5}
                value={newExperience.summary}
                onChange={(event) => setNewExperience({ ...newExperience, summary: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">Skills</label>
                <span className="text-xs text-slate-500">Saved with your profile</span>
              </div>
              <SkillChipSelector
                availableSkills={availableSkills}
                selectedSkillIds={newExperienceSkillIds}
                onToggle={onToggleNewExperienceSkill}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Close
          </Button>
          <Button type="button" onClick={onCreateExperience} disabled={saving}>
            {saving ? 'Saving…' : 'Add experience'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
