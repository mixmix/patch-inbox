const nest = require('depnest')
const Composer = require('../../../views/composer.js')

exports.gives = nest('post.html.new')

exports.needs = nest({
  'about.html.avatar': 'first',
  'about.async.suggest': 'first',
  'channel.async.suggest': 'first',
  'emoji.async.suggest': 'first',
  'message.html.markdown': 'first',
  'sbot.async.publish': 'first',
  'keys.sync.id': 'first'
})

exports.create = function (api) {
  return nest('post.html.new', newComposer)

  function newComposer (isOpen, afterPublish = noop) {
    const opts = {
      // initialRecps: [],
      myKey: api.keys.sync.id(),
      // initialText = '',
      suggest: {
        about: api.about.async.suggest,
        channel: api.channel.async.suggest,
        emoji: api.emoji.async.suggest
      },
      // extraFeedIds = [],
      // beforePublish,
      i18n,
      avatar: api.about.html.avatar,
      patchcorePublish: api.sbot.async.publish,
      onCancel: () => isOpen.set(false)
    }

    return Composer(opts, afterPublish)
  }
}

function i18n (key) {
  const t = {
    'composer.placeholder.subject': 'Subject (optional)',
    'composer.placeholder.textarea': 'Your message',
    'composer.label.recipients': '', // 'To',
    'composer.label.subject': '',
    'composer.label.textarea': '',
    'composer.action.addMoreRecps': '+ Add recipients',
    'composer.action.publish': 'Send encrypted message',
    'composer.action.publishing': 'Publishing',
    'composer.action.cancel': 'Cancel',
    'composer.alert.one-way': 'Note: you are not currently a recipient, so you will not be able to read this later. This can be useful for sending secrets you cannot hold on to.',
    'error.recps': 'An encrypted message requires at least one recipient'
  }
  return typeof t[key] === 'string' ? t[key] : key
}

function noop () {}
