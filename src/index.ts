import type { Context } from '@deepseek-ai/cordis'
import { greetTool } from './tools/greet.js'
import { CounterService } from './services/counter.js'

export const name = 'dsh-plugin-starter'
export const inject = ['tools']

export function apply(ctx: Context): void {
  ctx.plugin(CounterService)
  ctx.tools.register(greetTool)

  ctx.effect(() => {
    console.log(`[${name}] Plugin initialized successfully in Cordis.`)
    return () => {
      console.log(`[${name}] Resources released.`)
    }
  })
}
