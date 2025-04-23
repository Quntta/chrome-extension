document.getElementById('fileInput').addEventListener('change', handleFileSelect)
var fileTree = { type: 'folder', name: 'root', children: [] }

function handleFileSelect(event) {
  const files = Array.from(event.target.files) // 将 FileList 转换为数组

  // 构建树形结构
  files.forEach((file) => {
    const pathParts = file.webkitRelativePath.split('/')
    let currentLevel = fileTree.children

    pathParts.forEach((part, index) => {
      const existingNode = currentLevel.find((node) => node.name === part)

      if (index === pathParts.length - 1) {
        // 最后一级是文件
        if (!existingNode) {
          currentLevel.push({ type: 'file', name: part, file, children: null })
        }
      } else {
        // 中间级是文件夹
        if (!existingNode) {
          const newFolder = { type: 'folder', name: part, children: [] }
          currentLevel.push(newFolder)
          currentLevel = newFolder.children
        } else {
          currentLevel = existingNode.children
        }
      }
    })
  })

  renderMenu()
}

function extractNumber(filename) {
  const match = filename.match(/sort-(\d+)/) // 匹配 "sort-" 和数字
  return match ? parseInt(match[1], 10) : 0 // 如果有数字，返回其数值；否则返回 0
}

function renderImg(files) {
  const sortedFiles = files.sort((a, b) => extractNumber(a.file.name) - extractNumber(b.file.name)) // 按数字大小排序
  for (const file of sortedFiles) {
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file.file) // 使用 URL.createObjectURL
    img.className = 'img-preview'
    img.alt = file.file.name // 设置 alt 属性为文件名
    document.getElementById('content').appendChild(img)
  }
}

var leftDom = document.getElementById('left')
var titleDom = document.querySelector('.title')
var coverDom = document.querySelector('.cover')
var chapterListDom = document.querySelector('.chapter-list')

function renderMenu() {
  const cartoonNode = fileTree.children[0]
  if (!cartoonNode) return

  const cartoonTitle = cartoonNode.name
  titleDom.innerHTML = cartoonTitle

  // 获取封面文件
  const coverFile = cartoonNode.children.find(
    (item) => item.type === 'file' && (item.file.type === 'image/jpeg' || item.file.type === 'image/png')
  )
  if (coverFile) {
    const coverUrl = URL.createObjectURL(coverFile.file)
    const coverImg = document.createElement('img')
    coverImg.src = coverUrl
    coverImg.className = 'cover-img'
    coverImg.alt = '封面'
    coverDom.appendChild(coverImg)
  }

  // 过滤出章节文件夹，渲染章节列表
  const chapterList = cartoonNode.children.filter((item) => item.type === 'folder')
  const sortedChapterList = chapterList.sort((a, b) => extractNumber(a.name) - extractNumber(b.name))
  sortedChapterList.forEach((chapter) => {
    const chapterItem = document.createElement('div')
    chapterItem.className = 'chapter-item'
    const itemBg = document.createElement('div')
    itemBg.className = 'item-bg'
    chapterItem.appendChild(itemBg)
    const itemLink = document.createElement('a')
    itemLink.href = '#'
    itemLink.innerHTML = chapter.name
    chapterItem.appendChild(itemLink)
    chapterListDom.appendChild(chapterItem) // 将章节项添加到页面
  })
  renderImg(sortedChapterList[0].children) // 渲染第一个章节的图片
  // 给每个章节项添加点击事件，点击后渲染对应章节的图片
  const chapterItems = document.querySelectorAll('.chapter-item')
  chapterItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const selectedChapter = sortedChapterList[index]
      const files = selectedChapter.children.filter((child) => child.type === 'file')
      document.getElementById('content').innerHTML = '' // 清空内容区域
      renderImg(files) // 渲染选中章节的图片
    })
  })
}
