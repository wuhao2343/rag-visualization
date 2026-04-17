export const LLM_CONFIG = {
  gpt4o: {name: 'GPT-4o', provider: 'OpenAI', ctx: '128K', latency: '~2.1s', cost: '$5/M', temp: 0.1},
  claude35: {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    ctx: '200K',
    latency: '~1.8s',
    cost: '$3/M',
    temp: 0.1
  },
  gemini: {name: 'Gemini 1.5 Pro', provider: 'Google', ctx: '1M', latency: '~2.5s', cost: '$3.5/M', temp: 0.1},
  llama3: {name: 'Llama-3.1 70B', provider: '自托管', ctx: '128K', latency: '~1.2s', cost: '自托管', temp: 0.1},
  qwen: {name: 'Qwen2.5 72B', provider: '阿里云', ctx: '128K', latency: '~1.5s', cost: '¥0.4/M', temp: 0.1},
};