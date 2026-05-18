import { useId, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { FormOption } from './shared'

type FormFieldProps = {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  inputMode?: ComponentProps<typeof Input>['inputMode']
}

function buildDescribedByIds(descriptionId?: string, errorId?: string) {
  return [descriptionId, errorId].filter(Boolean).join(' ') || undefined
}

export function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
  error,
  required = false,
  className,
  inputMode,
}: FormFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-900" htmlFor={fieldId}>
            {label}
            {required ? <span className="ml-1 text-red-700">*</span> : null}
          </label>
          {description ? (
            <p id={descriptionId} className="text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="text-xs font-medium leading-5 text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <Input
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={buildDescribedByIds(descriptionId, errorId)}
          required={required}
        />
      </div>
    </div>
  )
}

type FormTextareaProps = {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
  error,
  required = false,
  className,
}: FormTextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-900" htmlFor={fieldId}>
            {label}
            {required ? <span className="ml-1 text-red-700">*</span> : null}
          </label>
          {description ? (
            <p id={descriptionId} className="text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="text-xs font-medium leading-5 text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <Textarea
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-28 rounded-2xl border-slate-200 bg-white shadow-sm"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={buildDescribedByIds(descriptionId, errorId)}
          required={required}
        />
      </div>
    </div>
  )
}

type FormSelectProps = {
  id?: string
  label: string
  value: string
  onValueChange: (value: string) => void
  options: FormOption[]
  placeholder?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
}

export function FormSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  description,
  error,
  required = false,
  className,
}: FormSelectProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const labelId = `${fieldId}-label`
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p id={labelId} className="text-sm font-medium text-slate-900">
            {label}
            {required ? <span className="ml-1 text-red-700">*</span> : null}
          </p>
          {description ? (
            <p id={descriptionId} className="text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="text-xs font-medium leading-5 text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            id={fieldId}
            className="h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm"
            aria-invalid={error ? 'true' : undefined}
            aria-labelledby={labelId}
            aria-describedby={buildDescribedByIds(descriptionId, errorId)}
            aria-required={required ? 'true' : undefined}
          >
            <SelectValue placeholder={placeholder ?? label} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

type ToggleFieldProps = {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function ToggleField({ label, description, checked, onCheckedChange, className }: ToggleFieldProps) {
  const fieldId = useId()
  const descriptionId = `${fieldId}-description`

  return (
    <div className={className ?? ''}>
      <label className="flex min-h-full cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <input
          id={fieldId}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-input"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-describedby={descriptionId}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-slate-900">{label}</span>
          <span id={descriptionId} className="block text-sm text-slate-500">
            {description}
          </span>
        </span>
      </label>
    </div>
  )
}
