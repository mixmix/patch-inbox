const nest = require('depnest')
const { h } = require('mutant')

exports.gives = nest('message.html.layout')

exports.needs = nest({
  'about.html.image': 'first',
  'keys.sync.id': 'first',
  'message.html.backlinks': 'first',
  'message.html.author': 'first',
  'message.html.meta': 'map',
  'message.html.timestamp': 'first',
  'post.html.subject': 'first',
  'app.sync.goTo': 'first' // TODO generalise - this is patchbay only
})

exports.create = (api) => {
  return nest('message.html.layout', inboxLayout)

  function inboxLayout (msgRollup, { layout, content } = {}) {
    if (layout !== 'inbox') return

    const { timestamp } = api.message.html

    const msgCount = msgRollup.replies.filter(r => r.value.content.type === 'post').length + 1
    const rootMsg = msgRollup
    const newMsg = getNewestMsg(msgRollup)

    const myId = api.keys.sync.id()
    const recps = msgRollup.value.content.recps
      .map(recp => {
        // TODO check these things are feed links!!!
        if (typeof recp === 'string') return recp

        if (recp.link) return recp.link
      })
      .filter(key => key !== myId)
      .filter(Boolean)
      .reduce((sofar, el) => sofar.includes(el) ? sofar : [...sofar, el], []) // .uniq

    const showNewMsg = newMsg && newMsg.value.author !== myId

    const openMessage = ev => {
      ev.preventDefault()
      ev.stopPropagation()
      api.app.sync.goTo({ key: rootMsg.key })
    }

    const card = h('Message -inbox-card', { // class Message is required for patchbay keyboard shortcut 'o'
      attributes: {
        tabindex: '0'
      }
    }, [
      h('section.recps', {}, [
        h('div.spacer', { className: getSpacerClass(recps) }),
        h('div.recps', { className: getRecpsClass(recps) }, recps.map(api.about.html.image))
      ]),
      h('section.content', { 'ev-click': openMessage }, [
        h('header', [
          h('span.count', `(${msgCount})`),
          api.post.html.subject(rootMsg)
        ]),
        showNewMsg
          ? h('div.update', [
            h('span.replySymbol', '►'),
            messageContent(newMsg),
            timestamp(newMsg || rootMsg)
          ]) : ''
      ])
    ])

    return card
  }

  function messageContent (msg) {
    if (!msg.value.content || !msg.value.content.text) return
    return api.post.html.subject(msg)
  }
}

function getNewestMsg (msg) {
  if (!msg.replies || msg.replies.length === 0) return

  return msg.replies[msg.replies.length - 1]
}

function getSpacerClass (recps) {
  switch (recps.length) {
    case 1:
      return '-half'
    case 3:
      return '-half'
    case 4:
      return '-half'
    case 5:
      return '-quarter'
    case 6:
      return '-quarter'
    default:
      return ''
  }
}

function getRecpsClass (recps) {
  switch (recps.length) {
    case 1:
      return '-inbox-large'
    case 2:
      return '-inbox-large'
    default:
      return '-inbox-small'
  }
}
