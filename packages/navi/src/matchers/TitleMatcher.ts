import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment, Segment } from '../Segments'
import {
  Matcher,
  MatcherGenerator,
  MatcherGeneratorClass,
  MatcherResult,
  MatcherOptions,
  createMatcher,
} from '../Matcher'

export interface TitleMatcherGeneratorClass<
  Context extends object = any
> extends MatcherGeneratorClass<Context, TitleMatcherGenerator<Context>> {
  new (options: MatcherOptions<Context>): TitleMatcherGenerator<Context>

  childMatcherGeneratorClass: MatcherGeneratorClass<Context> | undefined
  getTitle: Resolvable<string, Context>
}

class TitleMatcherGenerator<Context extends object> extends MatcherGenerator<Context> {
  ['constructor']: TitleMatcherGeneratorClass<Context>

  last?: {
    matcherGenerator?: MatcherGenerator<any>
    matcherGeneratorClass?: MatcherGeneratorClass<Context>
  }

  constructor(options: MatcherOptions<Context>) {
    super(options)
    if (this.constructor.childMatcherGeneratorClass) {
      this.wildcard = true
    }
  }

  protected execute(): MatcherResult {
    let { id, error, status, value: title } = this.resolver.resolve(
      this.env,
      this.constructor.getTitle,
    )
    let segments: Segment[] =
      status === 'ready'
        ? (
          title
          ? [createSegment('title', this.env.request, { title })]
          : [createSegment('null', this.env.request)]
        )
        : [createNotReadySegment(this.env.request, error)]

    let childGeneratorClass = this.constructor.childMatcherGeneratorClass
    let result: MatcherResult | undefined
    if (childGeneratorClass) {
      // Memoize matcher so its env prop can be used as a key for the resolver
      let matcherGenerator: MatcherGenerator<Context>
      if (
        !this.last ||
        this.last.matcherGeneratorClass !== childGeneratorClass
      ) {
        matcherGenerator = new childGeneratorClass({
          env: this.env,
          resolver: this.resolver,
          appendFinalSlash: this.appendFinalSlash,
        })
        this.last = {
          matcherGeneratorClass: childGeneratorClass,
          matcherGenerator: matcherGenerator,
        }
      } else {
        matcherGenerator = this.last.matcherGenerator!
      }
      result = matcherGenerator.getResult()
    }

    return {
      resolutionIds: [id].concat(result ? result.resolutionIds : []),
      segments: segments.concat(result ? result.segments : []),
    }
  }
}

export function withTitle<Context extends object>(
  maybeResolvableTitle: string | undefined | Resolvable<string | undefined, Context>,
): Matcher<Context> {
  let getTitle: Resolvable<string, Context> =
    typeof maybeResolvableTitle === 'function'
      ? (maybeResolvableTitle as any)
      : () => maybeResolvableTitle

  return createMatcher(
    (
      childMatcherGeneratorClass?: MatcherGeneratorClass<Context>,
    ): TitleMatcherGeneratorClass<Context> =>
      class extends TitleMatcherGenerator<Context> {
        static getTitle = getTitle
        static childMatcherGeneratorClass = childMatcherGeneratorClass
      },
  )
}