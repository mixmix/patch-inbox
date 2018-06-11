// 'blob.html.input': 'first',

// TODO - private attachments ////////////////////
// var fileInput
// if (!resolve(recps)) {
//   fileInput = api.blob.html.input(file => {
//     filesById[file.link] = file

//     var imgPrefix = file.type.match(/^image/) ? '!' : ''
//     var spacer = imgPrefix ? '\n' : ' '
//     var insertLink = spacer + imgPrefix + '[' + file.name + ']' + '(' + file.link + ')' + spacer

//     var pos = textArea.selectionStart
//     var newText = text().slice(0, pos) + insertLink + text().slice(pos)
//     textArea.value = newText
//     text.set(newText)

//     console.log('added:', file)
//   })

//   fileInput.onclick = () => hasContent.set(true)
// }
// if fileInput is null, send button moves to the left side
// and we don't want that.
// else { fileInput = h('input', { style: {visibility: 'hidden'} }) }
