const nest = require('depnest')
const { h, Value, onceTrue } = require('mutant')

exports.gives = nest('message.html.layout')

exports.needs = nest({
  'about.html.image': 'first',
  'app.sync.goTo': 'first', // TODO generalise - this is patchbay only
  'keys.sync.id': 'first',
  'message.html.backlinks': 'first',
  'message.html.author': 'first',
  'message.html.meta': 'map',
  'message.html.timestamp': 'first',
  'post.html.subject': 'first',
  'sbot.obs.connection': 'first'
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
    const recps = (msgRollup.value.content.recps || [])
      .map(recp => {
        // TODO check these things are feed links!!!
        if (typeof recp === 'string') return recp

        if (recp.link) return recp.link
      })
      .filter(key => key !== myId)
      .filter(Boolean)
      .reduce((sofar, el) => sofar.includes(el) ? sofar : [...sofar, el], []) // .uniq

    const showNewMsg = newMsg // && newMsg.value.author !== myId

    const openMessage = ev => {
      ev.preventDefault()
      ev.stopPropagation()
      api.app.sync.goTo({ key: rootMsg.key })
    }

    return h('Message -inbox-card', { // class Message is required for patchbay keyboard shortcut 'o'
      attributes: { tabindex: '0' },
      style: { '--card-font-color': `hsl(${Math.floor(Math.random() * 360)}, 59%, 37%)` }
    }, [
      h('section.recps', {}, [
        h('div.recps', recps.map(api.about.html.image))
        // h('div.spacer', { className: getSpacerClass(recps) })
      ]),
      h('div.spacer'),
      h('section.content', { 'ev-click': openMessage }, [
        h('header', { className: isReadClass(api.sbot.obs.connection, newMsg || rootMsg) }, [
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

function isReadClass (connection, msg) {
  const _class = Value('')

  onceTrue(connection, sbot => {
    if (!sbot.unread) return

    if (msg.value.author === sbot.id) return

    sbot.unread.isRead(msg.key, (err, isRead) => {
      if (err) return console.error(err)

      _class.set(isRead ? '-read' : '-unread')
    })
  })

  return _class
}
