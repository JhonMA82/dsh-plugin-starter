import { defineTool } from '@deepseek-ai/dsh-tools'

export const greetTool = defineTool({
  name: 'greet',
  description: 'Saluda a una persona por su nombre.',
  parameters: {
    name: {
      type: 'string',
      required: true,
      description: 'El nombre de la persona a saludar'
    }
  },
  output: {
    schema: {
      type: 'string'
    },
    render: (_args, value) => [{ type: 'text', text: value }]
  },
  async execute(args) {
    return `¡Hola, ${args.name}! Bienvenido a DeepSeek Harness.`
  }
})
