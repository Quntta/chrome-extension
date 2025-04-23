var config = {}
const FORM_KEY = 'clipboard_form_key'
initConfig()
function getItem(key) {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function initConfig() {
  const defaultConfig = getItem(FORM_KEY)
  if (defaultConfig) {
    config = defaultConfig
  }
}
function getHost(url = '') {
  const url_ = new URL(url)
  return url_.host || url_.hostname || ''
}

function canModify() {
  return config.filterHostUrl === getHost(window.location.href) && config.isOpen
}

function proxyInit() {
  if (canModify()) {
    console.log('当前域名允许修改复制内容')
    initSystem()
  }
}

proxyInit()

function initSystem() {
  console.log('初始化系统-----------------')
  // 重写 document.execCommand 方法
  const originalExecCommand = document.execCommand
  document.execCommand = function (command, ...args) {
    if (command === 'copy') {
      const selection = window.getSelection().toString()
      const modifiedText = transformText(selection)
      const clipboardData = event.clipboardData || window.clipboardData
      clipboardData.setData('text/plain', modifiedText)
      console.log('复制内容已修改:', modifiedText)
    }
    return originalExecCommand.call(this, command, ...args)
  }

  // 监听复制事件，使用捕获阶段
  document.addEventListener(
    'copy',
    (event) => {
      const selection = window.getSelection().toString()
      const modifiedText = transformText(selection)
      event.clipboardData.setData('text/plain', modifiedText)
      event.preventDefault()
      console.log('捕获阶段 - 复制内容已修改1:', modifiedText)
      console.log('window.location.href', getHost(window.location.href))
    },
    true // 使用捕获阶段
  )

  // 监听粘贴事件，处理 Shadow DOM
  document.addEventListener(
    'paste',
    (event) => {
      const clipboardData = event.clipboardData.getData('text/plain')
      const modifiedText = transformText(clipboardData)
      event.target.value = modifiedText
      event.preventDefault()
      console.log('捕获阶段 - 粘贴内容已修改2:', modifiedText)
    },
    true // 使用捕获阶段
  )

  // 使用 MutationObserver 动态监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          attachListenersToShadowRoots(node) // 处理新增节点的 Shadow DOM
        }
      })
    })
  })

  // 配置 MutationObserver 监听整个文档
  observer.observe(document, {
    childList: true,
    subtree: true
  })

  // 修改 attachListenersToShadowRoots 函数，确保递归处理所有子节点
  function attachListenersToShadowRoots(node) {
    if (node.shadowRoot) {
      node.shadowRoot.addEventListener(
        'copy',
        (event) => {
          const selection = node.shadowRoot.getSelection
            ? node.shadowRoot.getSelection().toString()
            : window.getSelection().toString()
          const modifiedText = transformText(selection)
          event.clipboardData.setData('text/plain', modifiedText)
          event.preventDefault()
          console.log('Shadow DOM - 复制内容已修改:', modifiedText)
        },
        true
      )

      node.shadowRoot.addEventListener(
        'paste',
        (event) => {
          const clipboardData = event.clipboardData.getData('text/plain')
          const modifiedText = transformText(clipboardData)
          event.target.value = modifiedText
          event.preventDefault()
          console.log('Shadow DOM - 粘贴内容已修改:', modifiedText)
        },
        true
      )

      // 递归处理 Shadow DOM 内部的子节点
      node.shadowRoot.childNodes.forEach((child) => attachListenersToShadowRoots(child))
    }
    // 递归处理普通子节点
    node.childNodes.forEach((child) => attachListenersToShadowRoots(child))
  }

  // 初始调用
  attachListenersToShadowRoots(document)
}

// 监听来自 popup.js 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateClipboardConfig') {
    console.log('Received message from popup.js:', message.data)
    config = message.data // 更新配置
    setItem(FORM_KEY, config) // 保存配置到 localStorage
    proxyInit() // 重新初始化系统
  }
})

function transformText(text) {
  // 实现文本转换逻辑
  // position: absolute;
  // left: 0px;
  // top: 0px;
  // width: 580px;
  // height: 940px;
  // opacity: 1;
  // 根据isPx2Px和isPx2Rem，来决定是否对px进行转换，如何值等于1，则进行转换
  // 根据px2Px和px2Rem，的比例进行转换
  try {
    // 1 对属性进行分割，分割成数组，支持 ; 和换行符
    const attrArray = text.split(/;|\n/).filter((attr) => attr.trim() !== '') // 去除空白行
    let result = []
    // 2 对数组进行遍历
    for (let i = 0; i < attrArray.length; i++) {
      const attr = attrArray[i].trim() // 去除首尾空格
      // 3 对属性进行分割，分割成数组
      const attrKeyValue = attr.split(':')
      // 4 对属性进行判断，如果属性值包含px，则进行转换
      if (attrKeyValue[1]?.includes('px')) {
        // 5 对属性值进行转换
        const pxValue = parseFloat(attrKeyValue[1].replace('px', ''))
        if (config.isPx2Px) {
          // px2px的转换
          const px2PxValue = pxValue * config.px2Px
          result.push(`${attrKeyValue[0]}: ${px2PxValue}px`)
        } else if (config.isPx2Rem) {
          // px2rem的转换
          const px2RemValue = (pxValue / config.px2Rem).toFixed(4)
          result.push(`${attrKeyValue[0]}: ${px2RemValue}rem`)
        } else {
          // 如果不需要转换，则直接添加
          result.push(attr)
        }
      } else {
        result.push(attr)
      }
    }
    // 5 将数组转换成字符串
    const resultString = result.join(';\n') // 每个属性后添加换行符
    return resultString + ';' // 添加分号结尾
  } catch (error) {
    console.error('转换文本时出错:', error)
    return text // 如果发生错误，返回原始文本
  }
}
