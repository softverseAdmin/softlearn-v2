import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, apiRequest } from '@/lib/api'

type AccountSecurityCardProps = {
  csrfToken: string | null
  title?: string
  description?: string
  helperText?: string
  submitLabel?: string
  cardClassName?: string
}

export function AccountSecurityCard({
  csrfToken,
  title = 'Account security',
  description = 'Use the same session-protected password flow as the rest of the platform.',
  helperText = 'Password rules are enforced by the backend validator, so weak passwords are rejected before they are saved.',
  submitLabel = 'Update password',
  cardClassName,
}: AccountSecurityCardProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!currentPassword.trim()) {
      setError('Current password is required.')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setSaving(true)

    try {
      await apiRequest<{ message: string }>('/auth/password/change', {
        method: 'POST',
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
        csrfToken,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully.')
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={cardClassName}>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div> : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Current password</span>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value)
                setError(null)
              }}
              autoComplete="current-password"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">New password</span>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setError(null)
              }}
              autoComplete="new-password"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Confirm new password</span>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setError(null)
              }}
              autoComplete="new-password"
            />
          </label>
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-muted-foreground">{helperText}</p>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
