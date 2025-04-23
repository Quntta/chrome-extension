import { setItem, getItem } from './utils'
export const HISTORYKEY = 'history'
export const store = {
  history: [],
  setHistory(data) {
    this.history = data
    setItem('HISTORYKEY', data)
  },
  getHistory() {
    const history = getItem('HISTORYKEY')
    if (history) {
      this.history = history
    }
    return this.history
  }
}
