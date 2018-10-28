const h = require('mutant/h')

module.exports = function Subject (opts) {
  const {
    state,
    i18n
  } = opts

  return h('input.ComposerSubject', {
    value: state.subject,
    'ev-input': (ev) => state.subject.set(ev.target.value),
    placeholder: i18n('composer.placeholder.subject')
  })
}
