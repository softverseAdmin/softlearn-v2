import type { ComponentProps } from 'react'

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
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  className?: string
  inputMode?: ComponentProps<typeof Input>['inputMode']
}

export function FormField({ label, value, onChange, placeholder, description, className, inputMode }: FormFieldProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

type FormTextareaProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  className?: string
}

export function FormTextarea({ label, value, onChange, placeholder, description, className }: FormTextareaProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-28 rounded-2xl border-slate-200 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

type FormSelectProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: FormOption[]
  placeholder?: string
  description?: string
  className?: string
}

export function FormSelect({ label, value, onValueChange, options, placeholder, description, className }: FormSelectProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm">
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
  return (
    <div className={className ?? ''}>
      <label className="flex min-h-full cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-input"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-slate-900">{label}</span>
          <span className="block text-sm text-slate-500">{description}</span>
        </span>
      </label>
    </div>
  )
}
