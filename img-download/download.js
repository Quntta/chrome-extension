import {
  SubPub,
  CHAPTERLISTCHANGEKEY,
  LOADINGPROGRESSCHANGEKEY,
  CONTENTERRORKEY,
  CONTENTRENDERKEY
} from './eventBus.js'
var subPub = new SubPub()
var searchOrigin = null
var cartoonObj = {
  title: '',
  id: uuid(),
  chapterList: [],
  downLoadCache: {},
  zip: new JSZip()
}
import { uuid, getElementAttr } from './utils.js'
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = getUrlQuery()
  searchOrigin = getOrigin(urlParams.searchUrl)
  await fetchCartoonContent(urlParams.searchUrl)
})

function getUrlQuery() {
  const query = window.location.search.substring(1)
  const params = {}
  const regex = /([^&=]+)=([^&]*)/g
  let match
  while ((match = regex.exec(query))) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2])
  }
  return params
}

function getOrigin(url) {
  const urlParser = new URL(url)
  return urlParser.origin
}

async function fetchCartoonContent(url) {
  subPub.emit(CONTENTRENDERKEY, { content: 'Fetching...' })
  try {
    const response = await fetch(url)
    const text = await response.text()
    const cartoonDoc = parseHtml(text)
    await parseCartoonContent(cartoonDoc)
  } catch (error) {
    subPub.emit(CONTENTERRORKEY, { error })
  }
}

async function parseCartoonContent(doc) {
  console.log('doc', doc)
  const { title, cover } = getCartoonInfo(doc)
  cartoonObj.title = title
  cartoonObj.cover = cover
  const chapterList = doc.querySelectorAll('#playlistbox .content_playlist li')
  subPub.emit(CONTENTRENDERKEY, { content: '' })
  chapterList.forEach((li) => {
    const anchor = li.querySelector('a') // 获取 <a> 标签
    if (anchor) {
      const chapterUrl = searchOrigin + anchor.getAttribute('href') // 提取 href 的值
      const chapterName = anchor.textContent // 提取 <a> 标签的内容
      cartoonObj.chapterList.push({ chapterUrl, chapterName, chapterId: uuid() })
      subPub.emit(CHAPTERLISTCHANGEKEY, { chapterUrl, chapterName })
    }
  })
  console.log('cartoonObj', cartoonObj)
  // 使用 Promise.all 并行处理所有章节内容
  await downloadCoverImageAsZip()
  const chapterPromises = cartoonObj.chapterList.map((chapter, index) => fetchCharpterContent(chapter, index))
  await Promise.all(chapterPromises)
  fileDownload()
}

function getCartoonInfo(doc) {
  const title = doc.querySelector('.detail_list_box .content_detail .pannel_head .title').innerHTML || '漫画标题'
  const cover = getElementAttr(doc.querySelector('.content_box .content_thumb .vodlist_thumb'), 'data-original')
  return {
    title,
    cover
  }
}

async function fetchCharpterContent({ chapterUrl, chapterName, chapterId }, chapterIndex) {
  var chapterImgList = []
  try {
    const response = await fetch(chapterUrl)
    const text = await response.text()
    const chapternDoc = parseHtml(text)
    const imgList = chapternDoc.querySelectorAll('.container img')
    imgList.forEach((img, index) => {
      chapterImgList.push({
        src: getElementAttr(img, 'data-original') || img.getAttribute('src'),
        name: img.getAttribute('alt') + 'sort-' + index + '.jpg'
      })
    })
    await downloadImagesAsZip({ chapterId, chapterName, chapterImgList, chapterIndex })
  } catch (error) {
    console.log('error', chapterName, error)
  }
}

async function downloadImagesAsZip({ chapterId, chapterName, chapterImgList, chapterIndex }) {
  let folder = cartoonObj.zip.folder(chapterName + 'sort-' + (chapterIndex + 1)) // 创建第一个文件夹
  for (let i = 0; i < chapterImgList.length; i++) {
    const { src, name } = chapterImgList[i]
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      folder.file(name, blob) // 将图片添加到当前文件夹
      // 更新进度
      subPub.emit(LOADINGPROGRESSCHANGEKEY, {
        chapterId,
        progress: Math.floor(((i + 1) / chapterImgList.length) * 100),
        index: chapterIndex
      })
    } catch (error) {
      console.error(`Failed to fetch image: ${src}`, error)
    }
  }
}

async function downloadCoverImageAsZip() {
  try {
    const response = await fetch(cartoonObj.cover)
    const blob = await response.blob()
    cartoonObj.zip.file(`${cartoonObj.title}.jpg`, blob) // 将封面图片添加到 ZIP 文件
  } catch (error) {
    console.error(`Failed to fetch cover image: ${cartoonObj.cover}`, error)
  }
}

function fileDownload() {
  cartoonObj.zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = `${cartoonObj.title}.zip` // 设置 ZIP 文件名
    a.click()
  })
}

function parseHtml(htmlstr) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlstr, 'text/html') // 将字符串解析为 HTML 文档
  return doc
}
