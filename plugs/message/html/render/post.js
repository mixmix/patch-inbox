var nest = require('depnest')
var h = require('mutant/h')

exports.needs = nest({
  'message.html.layout': 'first',
  'message.html.link': 'first'
})

exports.gives = nest('message.html.render')

exports.create = function (api) {
  return nest('message.html.render', function renderMessage (msg, opts) {
    if (msg.value.content.type !== 'post') return
    if (!opts || opts.layout !== 'inbox') return

    var element = api.message.html.layout(msg, Object.assign({}, {
      title: messageTitle(msg)
      // content: messageContent(msg), // not needed
    }, opts))

    // decorate locally
    if (msg.replies && msg.replies.length) {
      element.dataset.root = msg.key
      element.dataset.key = msg.replies[msg.replies.length - 1].key
    } else {
      element.dataset.key = msg.key
    }

    return element
  })

  function messageTitle (data) {
    var root = data.value.content && data.value.content.root
    return !root ? null : h('span', ['re: ', api.message.html.link(root)])
  }
}
