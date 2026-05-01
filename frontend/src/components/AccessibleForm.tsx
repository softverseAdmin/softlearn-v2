import React from 'react'
import { generateId } from '../lib/accessibility'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio'
  required?: boolean
  disabled?: boolean
  placeholder?: string
  description?: string
  error?: string
  value?: string | number | boolean
  options?: Array<{ label: string; value: string }>
  rows?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  validationMessage?: string
}

export interface AccessibleFormProps {
  fields: FormField[]
  onSubmit: (formData: Record<string, any>) => void
  submitLabel?: string
  isLoading?: boolean
  formTitle?: string
  formDescription?: string
  onFieldChange?: (name: string, value: any) => void
}

export function AccessibleForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  isLoading = false,
  formTitle,
  formDescription,
  onFieldChange,
}: AccessibleFormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const formId = generateId('form')

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }))
    onFieldChange?.(name, value)
  }

  const validateField = (field: FormField, value: any): string => {
    if (field.required && !value) {
      return `${field.label} is required`
    }
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }
    if (field.minLength && value.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`
    }
    if (field.maxLength && value.length > field.maxLength) {
      return `${field.label} must be at most ${field.maxLength} characters`
    }
    if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
      return field.validationMessage || `${field.label} format is invalid`
    }
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    for (const field of fields) {
      const error = validateField(field, formData[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-labelledby={formTitle ? `${formId}-title` : undefined}
      aria-describedby={formDescription ? `${formId}-description` : undefined}
    >
      {formTitle && (
        <h2 id={`${formId}-title`} className="text-2xl font-bold text-gray-900">
          {formTitle}
        </h2>
      )}
      {formDescription && (
        <p id={`${formId}-description`} className="text-gray-600">
          {formDescription}
        </p>
      )}

      {fields.map(field => {
        const fieldId = generateId(`field-${field.name}`)
        const errorId = errors[field.name] ? generateId(`error-${field.name}`) : undefined
        const descriptionId = field.description ? generateId(`desc-${field.name}`) : undefined

        if (field.type === 'textarea') {
          return (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={fieldId}
                className="block text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && (
                  <span aria-label="required" className="text-red-600 ml-1">
                    *
                  </span>
                )}
              </label>
              <textarea
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={e => handleFieldChange(field.name, e.target.value)}
                disabled={isLoading || field.disabled}
                rows={field.rows || 4}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={field.label}
                aria-required={field.required}
                aria-invalid={!!errors[field.name]}
                aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
              />
              {field.description && (
                <p id={descriptionId} className="text-xs text-gray-500">
                  {field.description}
                </p>
              )}
              {errors[field.name] && (
                <p id={errorId} className="text-sm text-red-600" role="alert">
                  {errors[field.name]}
                </p>
              )}
            </div>
          )
        }

        if (field.type === 'select') {
          return (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={fieldId}
                className="block text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && (
                  <span aria-label="required" className="text-red-600 ml-1">
                    *
                  </span>
                )}
              </label>
              <select
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={e => handleFieldChange(field.name, e.target.value)}
                disabled={isLoading || field.disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={field.label}
                aria-required={field.required}
                aria-invalid={!!errors[field.name]}
                aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {field.description && (
                <p id={descriptionId} className="text-xs text-gray-500">
                  {field.description}
                </p>
              )}
              {errors[field.name] && (
                <p id={errorId} className="text-sm text-red-600" role="alert">
                  {errors[field.name]}
                </p>
              )}
            </div>
          )
        }

        if (field.type === 'checkbox') {
          return (
            <div key={field.name} className="flex items-center space-y-2">
              <input
                id={fieldId}
                name={field.name}
                type="checkbox"
                checked={formData[field.name] || false}
                onChange={e => handleFieldChange(field.name, e.target.checked)}
                disabled={isLoading || field.disabled}
                className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                aria-label={field.label}
                aria-required={field.required}
                aria-describedby={descriptionId}
              />
              <label htmlFor={fieldId} className="text-sm text-gray-900">
                {field.label}
                {field.required && (
                  <span aria-label="required" className="text-red-600 ml-1">
                    *
                  </span>
                )}
              </label>
              {field.description && (
                <p id={descriptionId} className="text-xs text-gray-500">
                  {field.description}
                </p>
              )}
            </div>
          )
        }

        // Default input types (text, email, password, number, tel, url)
        return (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-gray-900"
            >
              {field.label}
              {field.required && (
                <span aria-label="required" className="text-red-600 ml-1">
                  *
                </span>
              )}
            </label>
            <input
              id={fieldId}
              name={field.name}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={e => handleFieldChange(field.name, e.target.value)}
              disabled={isLoading || field.disabled}
              placeholder={field.placeholder}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={field.label}
              aria-required={field.required}
              aria-invalid={!!errors[field.name]}
              aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
            />
            {field.description && (
              <p id={descriptionId} className="text-xs text-gray-500">
                {field.description}
              </p>
            )}
            {errors[field.name] && (
              <p id={errorId} className="text-sm text-red-600" role="alert">
                {errors[field.name]}
              </p>
            )}
          </div>
        )
      })}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={isLoading}
      >
        {isLoading ? 'Loading...' : submitLabel}
      </button>
    </form>
  )
}

export default AccessibleForm
