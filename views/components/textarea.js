const h = require('mutant/h')
const addSuggest = require('suggest-box')

function TextArea (opts) {
  const {
    state,
    i18n,
    suggest = {},
    extraFeedIds = []
  } = opts

  if (typeof state.text !== 'function') throw new Error('TextArea requires an state.text to be an observeable')

  suggest.about = suggest.about || noop
  suggest.channel = suggest.channel || noop
  suggest.emoji = suggest.emoji || noop

  const textArea = h('textarea.ComposerTextarea', {
    value: state.text, // computed(text, t => t),  // CHECK - not sure why this computed was needed
    'ev-input': (ev) => state.text.set(ev.target.value),
    placeholder: i18n('composer.placeholder.textarea')
  })

  suggestify()

  function suggestify () {
    if (!textArea.parentElement) return setTimeout(suggestify, 100)

    addSuggest(textArea, (inputText, cb) => {
      const char = inputText[0]
      const wordFragment = inputText.slice(1)

      if (char === '@') suggest.about(wordFragment, extraFeedIds, cb)
      if (char === '#') suggest.channel(wordFragment, cb)
      if (char === ':') suggest.emoji(wordFragment, cb)
    }, { cls: 'PatchSuggest' })
  }

  return textArea
}

module.exports = TextArea

function noop () {
}
