const { h, resolve, Value, Struct, Array: MutantArray } = require('mutant')

const Recipients = require('./composer-recipients')
const TextArea = require('./composer-textarea')
const publish = require('./composer-publish')

function Composer (opts, afterPublish) {
  const {
    initialText = '',
    suggest,
    extraFeedIds = [],
    beforePublish,
    i18n = identity,
    avatar = identity,
    patchcorePublish
  } = opts

  const state = Struct({
    text: Value(resolve(initialText)),
    recps: MutantArray([]),
    publishing: Value(false)
  })

  const textArea = TextArea({ state, i18n, suggest, extraFeedIds })
  textArea.publish = handlePublish // crude external API

  return h('Composer', [
    h('section.recipients', [
      h('div.label', i18n('composer.field.recipients')),
      Recipients({ state, suggest, avatar, i18n })
    ]),
    // TODO subject field
    // h('div.field -subject', [
    //   h('div.label', i18n('threadNew.field.subject')),
    //   h('input', {
    //     'ev-input': e => meta.subject.set(e.target.value),
    //     placeholder: i18n('optionalField')
    //   })
    // ]),
    h('section.text', [
      textArea
    ]),
    // TODO preview
    // h('section.preview', [
    //   preview,
    // ]),
    h('section.actions', [
      h('Button -primary',
        { disabled: state.publishing, 'ev-click': handlePublish },
        i18n('composer.action.publish')
      )
    ])
  ])

  function handlePublish () {
    publish({ state, beforePublish, afterPublish, patchcorePublish })
  }
}

module.exports = Composer

// TODO - move over into modules

// exports.gives = nest('message.html.compose')

// exports.needs = nest({
//   'about.async.suggest': 'first',
//   'channel.async.suggest': 'first',
//   'emoji.async.suggest': 'first',
//   'message.async.publish': 'first',
//   // 'message.html.confirm': 'first'
//   'translations.sync.strings': 'first'
// })

// exports.create = function (api) {
//   return nest('message.html.compose', Composer)

//   function Composer (options, afterPublish) {
//     // TODO - extract methods
//     const strings = api.translations.sync.strings()
//     const suggest = {
//       about: api.about.async.suggest || noop,
//       channel: api.channel.async.suggest || noop,
//       emojoi: api.emoji.async.suggest || noop
//       // extraFeedIds
//     }
//     const patchcorePublish = api.message.async.publish
//     // includes:
//     //   - sbot.blobs.push (for public messages)
//     //   - content = ssbKeys.box(content, content.recps.map(e => {
//     //       return ref.isFeed(e) ? e : e.link
//     //     }))

//   }
// }

function identity (t) {
  return t
}
