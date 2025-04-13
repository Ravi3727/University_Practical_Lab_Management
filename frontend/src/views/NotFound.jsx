import { AbstractView } from "./AbstractView"

export class NotFound extends AbstractView {
  constructor(params) {
    super(params)
    this.setTitle("Page Not Found")
  }

  async getHtml() {
    return `
      <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full text-center">
          <h1 class="text-6xl font-bold text-primary-600">404</h1>
          <p class="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</p>
          <p class="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
          <div class="mt-6">
            <a href="/" data-link class="btn btn-primary">Go to Home</a>
          </div>
        </div>
      </div>
    `
  }
}
