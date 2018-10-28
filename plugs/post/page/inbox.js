const nest = require('depnest')
const { h, Value, when } = require('mutant')
const pull = require('pull-stream')
const Scroller = require('pull-scroll')
const next = require('pull-next-query')

exports.gives = nest({
  'post.page.inbox': true,
  'app.html.menuItem': true
})

exports.needs = nest({
  'app.html.filter': 'first',
  'app.html.modal': 'first',
  'app.html.scroller': 'first',
  'app.sync.goTo': 'first', // TODO replace
  'feed.pull.private': 'first',
  'feed.pull.rollup': 'first',
  'keys.sync.id': 'first',
  'message.html.compose': 'first',
  'message.html.render': 'first',
  'message.sync.isBlocked': 'first',
  'post.html.new': 'first',
  'sbot.pull.stream': 'first'
})

exports.create = function (api) {
  return nest({
    'post.page.inbox': page,
    'app.html.menuItem': menuItem
  })

  function menuItem () {
    return h('a', {
      style: { order: 2 },
      'ev-click': () => api.app.sync.goTo({ page: 'inbox' }) // TODO goTo is patchbay
    }, '/inbox')
  }

  function page (location) {
    // const id = api.keys.sync.id()

    const composerOpen = Value(false)
    const composer = api.post.html.new(composerOpen, (err, msg) => {
      if (err) return console.log(err)
      composerOpen.set(false)
    })
    const modal = api.app.html.modal(composer, { isOpen: composerOpen, className: '-dark' })

    const newMsgCount = Value(0)
    const { filterMenu, filterDownThrough, filterUpThrough, resetFeed } = api.app.html.filter(draw) // TODO dep on patchbay
    const createNewMessage = () => composerOpen.set(true)

    const prepend = [ // TODO dep on patchbay
      modal,
      h('div.actions', [
        h('button.new.-primary', {
          'ev-click': createNewMessage
        }, 'New'),
        h('div.refresh', [
          newMsgCount, ' new messages',
          h('button', { 'ev-click': draw, className: when(newMsgCount, '-primary') }, 'Refresh')
        ])
      ]),
      filterMenu
    ]
    const { container, content } = api.app.html.scroller({ prepend, className: 'Inbox' })

    function draw () {
      newMsgCount.set(0)
      resetFeed({ container, content })

      pull(
        pullPosts({ reverse: true }),
        filterDownThrough(),
        api.feed.pull.rollup(),
        Scroller(container, content, render, false, false)
      )
    }
    function render (msgRollup) {
      return api.message.html.render(msgRollup, { layout: 'inbox' })
    }
    draw()

    pull(
      pullPosts({ reverse: false, live: true, old: false }),
      pull.filter(m => !m.sync),
      filterUpThrough(),
      pull.drain(msg => newMsgCount.set(newMsgCount() + 1))
      // TODO - better NEW MESSAGES
    )

    container.title = '/inbox'
    content.title = ''
    return container
  }

  function pullPosts (opts) {
    return api.sbot.pull.stream(server => {
      const query = [{
        $filter: {
          timestamp: { $gt: 0 },
          value: {
            content: {
              type: 'post',
              recps: { $truthy: true }
            }
          }
        }
      }]

      const _opts = Object.assign({ query, limit: 100 }, opts)

      return pull(
        next(server.private.read, _opts, ['timestamp']),
        pull.filter(m => !api.message.sync.isBlocked(m))
      )
    })
  }
}
