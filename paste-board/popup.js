import { FORM_KEY, getItem, setItem } from './utils.js'
const defaultForm = {
  isPx2Px: 0,
  isPx2Rem: 0,
  isOpen: 0,
  filterHostUrl: 'mastergo.com' // 默认对mastergo.com生效
}
const transKeys = ['isPx2Px', 'isPx2Rem', 'isOpen'] // 需要转换的键
init()
function init() {
  const form = document.getElementById('clipboardConfigForm')
  const formData = getItem(FORM_KEY) || {}
  // 填充表单
  for (const key in formData) {
    const input = form.querySelector(`[name="${key}"]`)
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = formData[key] == '1' // 将字符串转换为布尔值
      } else {
        input.value = formData[key]
      }
    }
  }
  sentMessage(formData)
}
function saveFormData(data) {
  setItem(FORM_KEY, data)
}
document.addEventListener('DOMContentLoaded', () => {
  const isPx2PxCheckbox = document.getElementById('isPx2Px')
  const isPx2RemCheckbox = document.getElementById('isPx2Rem')

  isPx2PxCheckbox.addEventListener('change', () => {
    if (isPx2PxCheckbox.checked) {
      isPx2RemCheckbox.checked = false
    }
  })

  isPx2RemCheckbox.addEventListener('change', () => {
    if (isPx2RemCheckbox.checked) {
      isPx2PxCheckbox.checked = false
    }
  })
})
document.getElementById('submitBtn').addEventListener('click', async function () {
  const form = document.getElementById('clipboardConfigForm')
  const formData = new FormData(form)
  const data = {
    ...defaultForm // 使用默认值填充
  }

  formData.forEach((value, key) => {
    // 检查是否是复选框，并转换值
    if (transKeys.includes(key)) {
      // 处理复选框的值
      data[key] = value === 'on' ? 1 : 0 // 转换为数字 1 或 0
    } else {
      data[key] = value // 其他字段保持原样
    }
  })
  saveFormData(data)
  sentMessage(data)
  // 关闭弹出窗口
  setTimeout(() => {
    window.close()
  }, 300)
})

function sentMessage(data) {
  // 发送数据到 content-script.js
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id }
        },
        () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'updateClipboardConfig', data })
        }
      )
    } else {
      console.error('No active tab found or content script not injected.')
    }
  })
}
