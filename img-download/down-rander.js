import {
  SubPub,
  CHAPTERLISTCHANGEKEY,
  LOADINGPROGRESSCHANGEKEY,
  CONTENTERRORKEY,
  CONTENTRENDERKEY
} from './eventBus.js'
var contentDom = null
var subPub = null
document.addEventListener('DOMContentLoaded', initRender)
document.getElementById('toread').addEventListener('click', async () => {
  event.preventDefault()
  chrome.tabs.create({ url: `file-read.html` })
})
function initRender() {
  contentDom = document.getElementById('content')
  subPub = new SubPub()
  subPub.on(CHAPTERLISTCHANGEKEY, renderChapterList)
  subPub.on(LOADINGPROGRESSCHANGEKEY, renderLoadingProgress)
  subPub.on(CONTENTERRORKEY, renderContentError)
  subPub.on(CONTENTRENDERKEY, renderContent)
}

function renderChapterList({ chapterUrl, chapterName }) {
  const chapterItem = document.createElement('div')
  chapterItem.className = 'chapter-item'
  const itemBg = document.createElement('div')
  itemBg.className = 'item-bg'
  chapterItem.appendChild(itemBg)
  const itemLink = document.createElement('a')
  itemLink.href = chapterUrl
  itemLink.target = '_blank'
  itemLink.innerHTML = chapterName
  chapterItem.appendChild(itemLink)
  contentDom.appendChild(chapterItem) // 将 <li> 标签添加到页面
}

function renderLoadingProgress({ chapterId = '', progress = '', index } = {}) {
  const chapterItems = document.querySelectorAll('.chapter-item')
  updateProgress(chapterItems[index], progress)
}

function updateProgress(element, progress) {
  if (!element || !progress) return
  const bgElement = element.querySelector('.item-bg')
  bgElement.style.width = `${progress}%`
  bgElement.style.transition = 'width 0.2s ease-in-out'
}

function renderContentError({ error }) {
  contentDom.innerHTML = `Error: ${error.message}`
}

function renderContent({ content }) {
  contentDom.innerHTML = content
}
