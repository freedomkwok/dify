import type { NodeDefault, PromptItem } from '../../types'
import type { LLMNodeType } from '../llm/types'
import { genNodeMetaData } from '@/app/components/workflow/utils'
import { BlockEnum, PromptRole } from '@/app/components/workflow/types'
import { BlockClassificationEnum } from '@/app/components/workflow/block-selector/types'

const RETRIEVAL_OUTPUT_STRUCT = `{
  "content": "",
  "title": "",
  "url": "",
  "icon": "",
  "metadata": {
    "dataset_id": "",
    "dataset_name": "",
    "document_id": [],
    "document_name": "",
    "document_data_source_type": "",
    "segment_id": "",
    "segment_position": "",
    "segment_word_count": "",
    "segment_hit_count": "",
    "segment_index_node_hash": "",
    "score": ""
  }
}`

const i18nPrefix = 'workflow.errorMsg'

const metaData = genNodeMetaData({
  classification: BlockClassificationEnum.Default,
  sort: 1,
  type: BlockEnum.CustomWebserver,
})

const nodeDefault: NodeDefault<LLMNodeType> = {
  metaData,
  defaultValue: {
    model: {
      provider: '',
      name: '',
      mode: 'chat',
      completion_params: {
        temperature: 0.7,
      },
    },
    prompt_template: [{
      role: PromptRole.system,
      text: '',
    }],
    context: {
      enabled: false,
      variable_selector: [],
    },
    vision: {
      enabled: false,
    },
  },
  defaultRunInputData: {
    '#context#': [RETRIEVAL_OUTPUT_STRUCT],
    '#files#': [],
  },
  checkValid(payload: LLMNodeType, t: any) {
    let errorMessages = ''
    const { model, prompt_template } = payload

    // if (!errorMessages && !model?.provider)
    //   errorMessages = t(`${i18nPrefix}.fieldRequired`, { field: t('workflow.nodes.llm.model') })

    // if (!errorMessages && !model?.name)
    //   errorMessages = t(`${i18nPrefix}.fieldRequired`, { field: t('workflow.nodes.llm.model') })

    // if (!errorMessages && !Array.isArray(prompt_template) && !prompt_template)
    //   errorMessages = t(`${i18nPrefix}.fieldRequired`, { field: t('workflow.nodes.llm.promptTemplate') })

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault
