const { h, resolve, computed, Value, Struct, Array: MutantArray, when } = require('mutant')
const { isFeed } = require('ssb-ref')

const Recipients = require('./components/recipients')
const Subject = require('./components/subject')
const TextArea = require('./components/textarea')
const publish = require('./publish')

function Composer (opts, afterPublish) {
  const {
    initialRecps = [],
    myKey,
    initialText = '',
    suggest,
    extraFeedIds = [],
    beforePublish,
    i18n = identity,
    avatar = identity,
    patchcorePublish,
    onCancel = noop
  } = opts

  const state = Struct({
    recps: MutantArray(buildRecps(initialRecps, myKey)),
    subject: Value(),
    text: Value(resolve(initialText)),
    isPublishing: Value(false)
  })
  const errors = computed(state, ({ recps }) => {
    if (recps.length) return null
    else return [ i18n('error.recps') ]
  })

  const textArea = TextArea({ state, i18n, suggest, extraFeedIds })
  textArea.publish = handlePublish // crude external API

  const oneWayAlertClass = computed(state.recps, recps => {
    if (!recps.length) return '-hidden' // error will be displayed in this case, hide this error
    return recps.some(isMe) ? '-hidden' : ''
  })

  return h('Composer', [
    h('section.recps', [
      h('label.recps', i18n('composer.label.recipients')),
      Recipients({ state, suggest, avatar, i18n })
    ]),
    h('section.subject', [
      h('label.subject', i18n('composer.label.subject')),
      Subject({ state, i18n })
    ]),
    h('section.one-way', { className: oneWayAlertClass }, [
      h('label.recps', ''),
      h('div.alert', i18n('composer.alert.one-way'))
    ]),
    // TODO subject field
    // h('div.field -subject', [
    //   h('div.label', i18n('threadNew.field.subject')),
    //   h('input', {
    //     'ev-input': e => meta.subject.set(e.target.value),
    //     placeholder: i18n('optionalField')
    //   })
    // ]),
    h('section.textArea', [
      h('label.textArea', i18n('composer.label.textarea')),
      textArea
    ]),
    // TODO preview
    // h('section.preview', [
    //   preview,
    // ]),
    h('section.actions', [
      h('div.errors', computed(errors, errors => {
        if (!errors) return

        return h('ul', [
          errors.map(error => h('li', error))
        ])
      })),
      h('div.actions', [
        h('button -subtle',
          { 'ev-click': handleCancel },
          i18n('composer.action.cancel')
        ),
        when(state.isPublishing,
          h('button -primary', [
            h('i.fa.fa-spinner.fa-pulse'),
            i18n('composer.action.publishing')
          ]),
          h('button -primary',
            { disabled: errors, 'ev-click': handlePublish },
            i18n('composer.action.publish')
          )
        )
      ])
    ])
  ])

  function handlePublish () {
    publish({ state, myKey, beforePublish, afterPublish, patchcorePublish })
  }

  function handleCancel () {
    state.set(resolve(initialText))
    state.recps.set(buildRecps(initialRecps, myKey))
    state.isPublishing.set(false)
    onCancel()
  }

  function isMe (recp) {
    return recp === myKey || recp.link === myKey
  }

  function buildRecps (initialRecps, myKey) {
    if (!isFeed(myKey)) throw new Error('Composer requires myKey to be a valid feedId')

    const otherFeeds = resolve(initialRecps)
      .filter(recp => isFeed(recp.link))
      .filter(recp => !isMe(recp))

    return [myKey, ...otherFeeds]
  }
}

module.exports = Composer

function identity (t) {
  return t
}

function noop () {}
