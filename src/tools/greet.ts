import { defineTool } from '@deepseek-ai/dsh-tools'

export const greetTool = defineTool({
  name: 'dsh_plugin_starter_greet',
  description: 'Greet a person by name.',
  parameters: {
    name: {
      type: 'string',
      required: true,
      description: 'The name of the person to greet'
    }
  },
  output: {
    schema: {
      type: 'string'
    },
    render: (_args, value) => [{ type: 'text', text: value }]
  },
  async execute(args) {
    return `Hello, ${args.name}! Greetings from the dsh-plugin-starter plugin.`
  }
})
