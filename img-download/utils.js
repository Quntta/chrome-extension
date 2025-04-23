export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getItem = (key) => {
  const value = localStorage.getItem(key)
  if (value) {
    return JSON.parse(value)
  }
  return null
}

export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const getElementAttr = (element, attr) => {
  if (element && element.hasAttribute(attr)) {
    return element.getAttribute(attr)
  }
  return null
}
