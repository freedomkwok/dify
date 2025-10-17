import type { FC } from 'react'
import React from 'react'
import type { LLMNodeType } from '../llm/types'
import type { NodeProps } from '@/app/components/workflow/types'

const Node: FC<NodeProps<LLMNodeType>> = ({
  data,
}: NodeProps<LLMNodeType>) => {
  const { provider, name: modelId } = data.model || {}
  const hasSetModel = provider && modelId

  if (!hasSetModel)
    return null

  return (
    <div className='mb-1 px-3 py-1'>
      {hasSetModel && (
        <div className='flex h-6 items-center rounded-md bg-background-default-dimmed px-2 text-xs text-text-secondary'>
          <div className='mr-1 h-3 w-3 rounded-full bg-blue-500' />
          Custom Webserver: {provider}/{modelId}
        </div>
      )}
    </div>
  )
}

export default React.memo(Node)
