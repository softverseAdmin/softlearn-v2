import { z } from 'zod'

const loginRoles = ['student', 'company', 'teacher'] as const
const signupRoles = ['student', 'company', 'teacher'] as const

export const loginFormSchema = z.object({
  role: z.enum(loginRoles).optional(),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().trim().min(1, 'Password is required.'),
})

export const signupFormSchema = z
  .object({
    role: z.enum(signupRoles, { error: 'Choose whether this account is for a student, company, or teacher.' }),
    companyName: z.string(),
    name: z.string().trim().min(1, 'Name is required.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
  })
  .superRefine((value, context) => {
    if (value.role === 'company' && value.companyName.trim().length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['companyName'],
        message: 'Company name is required for company accounts.',
      })
    }
  })

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      })
    }
  })

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type SignupFormValues = z.infer<typeof signupFormSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>
