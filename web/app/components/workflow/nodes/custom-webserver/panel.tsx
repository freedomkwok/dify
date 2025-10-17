import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import LLMPanel from '../llm/panel'
import type { LLMNodeType } from '../llm/types'
import type { NodePanelProps } from '@/app/components/workflow/types'

const i18nPrefix = 'workflow.nodes.customWebserver'

const Panel: FC<NodePanelProps<LLMNodeType>> = (props: NodePanelProps<LLMNodeType>) => {
  const { t } = useTranslation()

  return (
    <div className='relative'>
      <div className='mb-2 flex items-center gap-2'>
        <div className='h-4 w-4 rounded-full bg-blue-500' />
        <div className='text-sm font-medium text-text-primary'>
          {t(`${i18nPrefix}.title`, 'Custom Webserver')}
        </div>
      </div>
      <div className='mb-3 text-xs text-text-tertiary'>
        {t(`${i18nPrefix}.description`, 'Configure your custom webserver LLM endpoint')}
      </div>
      <LLMPanel {...props} />
    </div>
  )
}

export default React.memo(Panel)
