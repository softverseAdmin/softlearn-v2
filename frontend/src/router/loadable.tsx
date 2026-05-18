import { Suspense, lazy, type ComponentType } from 'react'

import { FullPageState } from '@/components/FullPageState'

type LoadableComponentType = ComponentType<object>
type Loader<TProps extends object> = () => Promise<{ default: ComponentType<TProps> }>
type PropsOf<TComponent> = TComponent extends ComponentType<infer TProps> ? TProps : never

const routeFallback = (
  <FullPageState
    title="Loading page"
    description="Preparing the next workspace view."
  />
)

export function loadable<TProps extends object>(loader: Loader<TProps>) {
  const LazyComponent = lazy(loader) as ComponentType<TProps>

  function LoadableComponent(props: TProps) {
    return (
      <Suspense fallback={routeFallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }

  LoadableComponent.displayName = 'LoadableRoute'

  return LoadableComponent
}

export function loadableNamed<
  Module extends Record<string, LoadableComponentType>,
  Key extends keyof Module,
>(loader: () => Promise<Module>, exportName: Key) {
  return loadable<PropsOf<Module[Key]>>(async () => {
    const module = await loader()
    return { default: module[exportName] as ComponentType<PropsOf<Module[Key]>> }
  })
}
