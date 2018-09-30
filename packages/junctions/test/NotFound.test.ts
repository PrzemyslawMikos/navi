import { createSwitch, createPage, NotFoundError, createMemoryNavigation } from '../src'

describe("pageMap", () => {
  const rootSwitch = createSwitch({
    paths: {
      '/declared/:id': createPage({
        title: 'Junctions',
        async getContent({ params }) {
          if (params.id !== "1") {
            throw new NotFoundError()
          }
        },
      })
    }
  })

  test("accessing a undeclared path results in a NotFoundError", async () => {
      let navi = createMemoryNavigation({ rootSwitch, url: '/undeclared' })
      let { route } = await navi.getSteadySnapshot()
      expect(route.error).toBeInstanceOf(NotFoundError)
      expect(route.error.pathname).toBe('/undeclared/')
  })

  test("getContent can choose not to throw a NotFoundError", async () => {
    let navi = createMemoryNavigation({ rootSwitch, url: '/declared/1' })
    let { route } = await navi.getSteadySnapshot()
    expect(route.error).toBeFalsy()
  })
   
  test("accessing a declared path that throws NotFoundError results in a NotFoundError", async () => {
    let navi = createMemoryNavigation({ rootSwitch, url: '/declared/2' })
    let { route } = await navi.getSteadySnapshot()
    expect(route.error).toBeInstanceOf(NotFoundError)
    expect(route.error.pathname).toBe('/declared/2/')
  })
})