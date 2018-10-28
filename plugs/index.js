const nest = require('depnest')

module.exports = {
  patchInbox: nest({
    'message.html.layout': require('./message/html/layout/inbox'),
    'message.html.render': require('./message/html/render/post'),
    'post.html.new': require('./post/html/new'),
    'post.html.subject': require('./post/html/subject'),
    'post.page.inbox': require('./post/page/inbox'),
    'router.sync.routes': require('./router/sync/routes'),
    'styles.mcss': require('./styles/mcss')
  })
}
