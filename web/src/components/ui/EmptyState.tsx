import type { ReactNode } from 'react'

interface Props {
  title: string
  body?: string
  action?: ReactNode
  icon?: ReactNode
}

export default function EmptyState({ title, body, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-paper/60 px-6 py-14 text-center">
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-olive">
        {icon}
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-terracotta" />
      </div>
      <h3 className="font-display text-xl text-olive">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
