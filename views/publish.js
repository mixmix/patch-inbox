const resolve = require('mutant/resolve')
const ssbMentions = require('ssb-mentions')

module.exports = function publish (opts) {
  const {
    state,
    myKey,
    beforePublish = identityCb,
    afterPublish = noop,
    patchcorePublish
  } = opts

  const { recps, subject, text, isPublishing } = resolve(state)
  if (isPublishing) return

  const content = buildContent({ recps, subject, text })
  if (!content.text) return

  state.isPublishing.set(true)

  beforePublish(content, function (err, content) {
    if (err) return handleErr(err)

    patchcorePublish(content, (err, msg) => {
      state.isPublishing.set(false)
      if (err) return handleErr(err)
      else if (msg) {
        state.recps.set([myKey])
        state.subject.set('')
        state.text.set('')
      }

      if (afterPublish) afterPublish(err, msg)
    })
  })

  function handleErr (err) {
    state.isPublishing.set(false)
    if (afterPublish) afterPublish(err)
    else throw err
  }
}

function buildContent ({ recps, subject, text }) {
  return prune({
    type: 'post',
    recps,
    subject,
    text,
    mentions: getMentions(text)
  })
}

function getMentions (text) {
  // merge markdown-detected mention with file info
  ssbMentions(resolve(text))
    .map(mention => {
      // var file = filesById[mention.link] // TODO - private attachments
      // if (file) {
      //   if (file.type) mention.type = file.type
      //   if (file.size) mention.size = file.size
      // }
      return mention
    })
}

function prune (obj) {
  for (var k in obj) {
    const val = obj[k]

    if (val === undefined) delete obj[k]
    if (val === '') delete obj[k]
    if (Array.isArray(obj[k]) && val.length === 0) delete obj[k]
  }
  return obj
}

function noop () { }

function identityCb (content, cb) {
  cb(null, content)
}
