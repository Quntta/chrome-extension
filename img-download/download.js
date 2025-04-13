var contentDom = null
var searchOrigin = null
var chapterObjList = []
document.addEventListener('DOMContentLoaded', async () => {
  contentDom = document.getElementById('content')
  contentDom.innerHTML = JSON.stringify(getUrlQuery(), null, 2)
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
  contentDom.textContent = 'Fetching...'
  try {
    const response = await fetch(url)
    const text = await response.text()
    const cartoonDoc = parseHtml(text)
    parseCartoonContent(cartoonDoc)
  } catch (error) {
    contentDom.textContent = 'Error: ' + error.message
  }
}

function parseCartoonContent(doc) {
  const chapterList = doc.querySelectorAll('#playlistbox .content_playlist li')
  contentDom.innerHTML = ''
  chapterList.forEach((li) => {
    const anchor = li.querySelector('a') // 获取 <a> 标签
    if (anchor) {
      const href = searchOrigin + anchor.getAttribute('href') // 提取 href 的值
      const text = anchor.textContent // 提取 <a> 标签的内容
      chapterObjList.push({ href, text })
      const chapterItem = document.createElement('div')
      chapterItem.className = 'chapter-item'
      chapterItem.innerHTML = `<a href="${href}" target="_blank">${text}</a>`
      contentDom.appendChild(chapterItem) // 将 <li> 标签添加到页面
    }
  })
  fetchCharpterContent(chapterObjList[0].href)
}

function parseHtml(htmlstr) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlstr, 'text/html') // 将字符串解析为 HTML 文档
  return doc
}

async function fetchCharpterContent(url) {
  const chapterDom = document.getElementById('chapterContent')
  chapterDom.innerHTML = 'Fetching...'
  var chapterImgList = []
  try {
    const response = await fetch(url)
    const text = await response.text()
    const chapternDoc = parseHtml(text)
    const imgList = chapternDoc.querySelectorAll('.container img')
    imgList.forEach((img, index) => {
      chapterImgList.push({
        src: img.getAttribute('data-original'),
        name: img.getAttribute('alt') + 'sort-' + index + '.jpg'
      })
    })
    downloadImagesAsZip(chapterImgList)
    console.log('chapterImgList', chapterImgList)
  } catch (error) {
    chapterDom.textContent = 'Error: ' + error.message
  }
}

async function downloadImagesAsZip(imgList) {
  const zip = new JSZip() // 创建 JSZip 实例
  for (const { src, name } of imgList) {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      zip.file(name, blob) // 将图片添加到 ZIP 包中
    } catch (error) {
      console.error(`Failed to fetch image: ${src}`, error)
    }
  }

  zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'images.zip' // 设置 ZIP 文件名
    a.click()
  })
}
