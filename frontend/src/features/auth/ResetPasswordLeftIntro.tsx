import { BookOpen } from 'lucide-react'

export function ResetPasswordLeftIntro() {
  return (
    <section className="w-full max-w-[640px] px-4 py-6 sm:px-6 md:max-w-[560px] md:px-0 md:py-0">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sl-primary)] text-white shadow-sm">
            <BookOpen aria-hidden="true" className="h-5 w-5" />
          </div>

          <span className="text-xl font-bold tracking-tight text-[var(--sl-text)] sm:text-2xl">
            Soft<span className="text-[var(--sl-primary)]">Learn</span>
          </span>
        </div>

        <div className="mt-8 space-y-5 sm:mt-10">
          <h2 className="max-w-[12ch] text-[clamp(2.25rem,4.1vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--sl-text)]">
            Create a New Password.
            Re-enter <span className="text-[var(--sl-primary)]">Confidently.</span>
          </h2>

          <p className="max-w-[34rem] text-sm leading-7 text-[var(--sl-muted)] sm:text-base md:text-[17px]">
            Update your SoftLearn password with a secure new credential so you can return to your learning or hiring flow right away.
          </p>
        </div>
      </div>
    </section>
  )
}
