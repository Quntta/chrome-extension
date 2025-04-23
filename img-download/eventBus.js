export const CHAPTERLISTCHANGEKEY = 'chapterListChange'
export const LOADINGPROGRESSCHANGEKEY = 'loadingProgresschange'
export const CONTENTERRORKEY = 'contentError'
export const CONTENTRENDERKEY = 'contentRender'
export class SubPub {
  constructor() {
    this.events = {}
    if (!SubPub.instance) {
      SubPub.instance = this
    }
    return SubPub.instance
  }
  on(event, fn) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(fn)
  }
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((fn) => {
        fn(...args)
      })
    }
  }
  off(event, fn) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((f) => f !== fn)
    }
  }
  clear() {
    this.events = {}
  }
}
