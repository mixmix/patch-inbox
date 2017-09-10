const nest = require('depnest')
const { h, Value } = require('mutant')
const pull = require('pull-stream')
const Scroller = require('pull-scroll')
const next = require('pull-next-step')
const ref = require('ssb-ref')

exports.gives = nest({
  'post.page.inbox': true, 
  'app.html.menuItem': true
})

exports.needs = nest({
  'app.html': {
    filter: 'first',
    scroller: 'first'
  },
  'app.sync.goTo': 'first',
  'feed.pull.private': 'first',
  'feed.pull.rollup': 'first',
  'keys.sync.id': 'first',
  'message.html': {
    // compose: 'first',
    render: 'first'
  }
})

exports.create = function (api) {
  return nest({
    'post.page.inbox': page, 
    'app.html.menuItem': menuItem
  })

  function menuItem () {
    return h('a', {
      style: { order: 2 },
      'ev-click': () => api.app.sync.goTo({ page: 'inbox' })
    }, '/inbox')
  }

  function page (location) {
    const id = api.keys.sync.id()

    // TODO - create a postNew page
    // const composer = api.message.html.compose({
    //   meta: { type: 'post' },
    //   prepublish: meta => {
    //     meta.recps = [id, ...(meta.mentions || [])]
    //       .filter(m => ref.isFeed(typeof m === 'string' ? m : m.link))
    //     return meta
    //   },
    //   placeholder: 'Write a private message. \n\n@mention users in the first message to start a private thread.'}
    // )
 
    const newMsgCount = Value(0)
    const { filterMenu, filterDownThrough, filterUpThrough, resetFeed } = api.app.html.filter(draw)
    const { container, content } = api.app.html.scroller({ prepend: [
      h('div', { style: {'margin-left': '9rem', display: 'flex', 'align-items': 'baseline'} },  [
        h('button', { 'ev-click': draw, stlye: {'margin-left': 0} }, 'REFRESH'),
        h('span', ['New Messages: ', newMsgCount]), 
      ]),
      filterMenu 
    ] })

    function draw () {
      newMsgCount.set(0)
      resetFeed({ container, content })

      pull(
        next(api.feed.pull.private, {old: false, limit: 100, property: ['value', 'timestamp']}),
        filterDownThrough(),
        pull.drain(msg => newMsgCount.set(newMsgCount() + 1))
        // TODO - better NEW MESSAGES
      )

      pull(
        next(api.feed.pull.private, {reverse: true, limit: 100, live: false}, ['value', 'timestamp']),
        filterUpThrough(),
        pull.filter(msg => msg.value.content.recps),
        api.feed.pull.rollup(),
        Scroller(container, content, render, false, false)
      )
    }
    draw()

    function render (msgRollup) {
      return api.message.html.render(msgRollup, { layout: 'inbox' })
    }

    container.title = '/inbox'
    return container
  }
}


