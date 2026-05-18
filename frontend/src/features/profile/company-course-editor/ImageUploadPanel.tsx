import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { ImageUploadPanelProps } from './shared'

export function ImageUploadPanel({ label, image, alt, isLoading, onChange, onRemove }: ImageUploadPanelProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {image ? (
          <div className="relative">
            <img src={image} alt={alt} className="h-56 w-full rounded-xl object-cover" />
            <Button
              type="button"
              variant="inverse"
              size="icon-xs"
              className="absolute right-3 top-3 rounded-full bg-slate-950/80 text-white hover:bg-slate-950"
              onClick={onRemove}
              aria-label="Remove image"
            >
              <X />
            </Button>
          </div>
        ) : (
          <div className="flex min-h-44 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Upload image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP recommended.</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {isLoading ? <span className="text-xs text-muted-foreground">Loading preview…</span> : null}
        </div>
      </div>
    </div>
  )
}
