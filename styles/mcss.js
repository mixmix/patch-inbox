const nest = require('depnest')

exports.gives = nest('styles.mcss')

const inboxMcss = `
Message -inbox-card {
  padding: .5rem
  display: flex

  section.recps {
    width: 8rem
    margin-right: 1rem

    display: flex

    div.spacer {
      -quarter {
        width: 2rem 
      }

      -half {
        width: 4rem 
      }
    }

    div.recps {
      flex-grow: 1

      // width: 4rem
      height: 4rem

      display: flex
      flex-wrap: wrap
      justify-content: flex-end

      img.Avatar {
        width: 1.9rem
        height: 1.9rem
        margin: 0 0 .1rem .1rem
      }

      -inbox-large {
        // width: 8rem

        img.Avatar {
          width: 3.8rem
          height: 3.8rem
          margin: 0 0 0 .2rem
        }
      }
    }
  }

  section.content {
    max-width: 40rem
    margin: 0

    header {
      display: flex
      align-items: baseline

      span {
        color: #666
        word-break: normal
        margin-right: .5rem
      }
      $markdownSmall
    }

    div.update {
      $markdownTiny

      display: flex
      flex-wrap: wrap
      margin-left: 2rem

      span.replySymcol {
        color: #666
        margin-right: .3rem
      }

      a.Timestamp {
        font-size: .8rem
        flex-basis: 100%
      }
    }
  }
}

Scroller {
  div.wrapper {
    section.content {
      div.Message {
        -inbox-card {
          border-bottom: initial 
        }
      }
    }
  }
}

$markdownSmall {
  div.Markdown {
    h1, h2, h3, h4, h5, h6, p {
      font-size: 1rem
      font-weight: 300
      margin: 0

      (img) { max-width: 100% }
    }
  }
}

$markdownTiny {
  div.Markdown {
    h1, h2, h3, h4, h5, h6, p {
      color: #666
      font-size: .9rem
      font-weight: 300
      margin: 0

      (a) { color: #666 }
      (img) { max-width: 100% }
    }
  }
}
`

exports.create = (api) => {
  return nest('styles.mcss', mcss)

  function mcss (sofar = {}) {
    sofar['patchInbox.app.page.inbox'] = inboxMcss

    return sofar
  }
}

