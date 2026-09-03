import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context {
    counterService: CounterService
  }
}

export class CounterService extends Service {
  private count = 0

  constructor(ctx: Context) {
    super(ctx, 'counterService')
  }

  public increment(): number {
    return ++this.count
  }

  public getCount(): number {
    return this.count
  }
}
