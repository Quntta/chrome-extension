export const FORM_KEY = 'clipboard_form_key'

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getItem(key) {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

export function removeItem(key) {
  localStorage.removeItem(key)
}

export function clear() {
  localStorage.clear()
}
