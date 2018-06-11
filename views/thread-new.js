const nest = require('depnest')
const { h, Struct, Value, Array: MutantArray, computed, map, resolve } = require('mutant')
const suggestBox = require('suggest-box')
const isEmpty = require('lodash/isEmpty')
const get = require('lodash/get')
const { isFeed } = require('ssb-ref')

exports.gives = nest('app.page.threadNew')

exports.needs = nest({
  'about.async.suggest': 'first',
  'about.html.avatar': 'first',
  'about.obs.name': 'first',
  'app.html.sideNav': 'first',
  'app.html.thread': 'first',
  'history.sync.push': 'first',
  'keys.sync.id': 'first',
  'message.html.compose': 'first',
  'message.sync.unbox': 'first',
  'translations.sync.strings': 'first'
})

exports.create = (api) => {
  return nest('app.page.threadNew', threadNew)

  function threadNew (location) {
    const strings = api.translations.sync.strings()

    // methods to extract
    const i18n = (path) => get(strings, path)
    const name = (feedId) => resolve(api.about.obs.name(feedId))
    const avatar = api.about.html.avatar
    const myId = api.keys.sync.id()
    const aboutSuggester = api.about.async.suggest
    const onPublish = (err, msg) => {
      if (err) return api.histort.sync.push(err)

      api.about.history.push(api.message.sync.unbox(msg))
    }
    ////

    const participants = (location.participants || []).filter(isFeed)

    const meta = Struct({
      type: 'post',
      recps: MutantArray([
        myId,
        ...participants.map(p => {
          return {
            link: p,
            name: name(p)
          }
        })
      ]),
      subject: Value()
    })



    function Composer (meta) {
      return api.message.html.compose(
        { meta, shrink: false },
        onPublish
      )
    }
  }
}
