const nest = require('depnest')

exports.gives = nest('router.sync.routes')

exports.needs = nest({
  'post.page.inbox': 'first'
})

exports.create = (api) => {
  return nest('router.sync.routes', (sofar = []) => {
    const pages = api.post.page

    // loc = location
    const routes = [
      [ loc => loc.page === 'inbox', pages.inbox ],
      // [ loc => loc.page === 'private', pages.private ],
    ]

    return [...routes, ...sofar]
  })
}

