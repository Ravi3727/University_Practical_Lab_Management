export class AbstractView {
    constructor(params) {
      this.params = params
    }
  
    setTitle(title) {
      document.title = `${title} | University Lab Management System`
    }
  
    async getHtml() {
      return ""
    }
  }
  