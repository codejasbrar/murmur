class CartNotification extends HTMLElement {
  constructor() {
    super()

    this.notification = document.getElementById('cart-notification')
    this.header = document.querySelector('sticky-header')
    this.onBodyClick = this.handleBodyClick.bind(this)

    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close())
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    )
  }

  open() {
    this.notification.classList.add('animate', 'active')

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus()
        trapFocus(this.notification)
      },
      { once: true }
    )

    document.body.addEventListener('click', this.onBodyClick)
  }

  close() {
    this.notification.classList.remove('active')

    document.body.removeEventListener('click', this.onBodyClick)

    removeTrapFocus(this.activeElement)
  }

  renderContents(parsedState) {
    // If product is bundle
    if (parsedState.items) {
      this.getSectionsToRender().forEach((section) => {
        document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id])
      })
      this.querySelector('.cart-notification__heading > span').innerHTML = 'Items added to your cart'
    } else {
      this.productId = parsedState.id
      this.getSectionsToRender().forEach((section) => {
        document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.id],
          section.selector
        )
      })
    }

    // if (this.header) this.header.reveal()
    this.open()
  }

  // Section Rendering API
  // https://shopify.dev/api/ajax/reference/cart#bundled-section-rendering
  // https://shopify.dev/api/section-rendering

  /**
   * Render Cart Notification Product
   * For: Product Group (main-product-group.liquid, product-grouped.js)
   *
   * References:
   *  https://shopify.dev/api/ajax/reference/cart#bundled-section-rendering
   *  https://shopify.dev/api/section-rendering
   *
   * @param {object} parsedState
   *
   */

  renderContentsGroup(parsedState) {
    const { sections } = parsedState

    document.getElementById('cart-notification-product').innerHTML = sections['cart-notification-product']

    document.getElementById('cart-notification-button').innerHTML = sections['cart-notification-button']

    document.getElementById('cart-icon-bubble').innerHTML = sections['cart-icon-bubble']

    this.open()
  }

  renderContentsError(parsedState) {
    const { message, description } = parsedState

    this.errorMessageWrapper = document.querySelector('.product-form__error-message-wrapper')
    this.errorMessage = this.errorMessageWrapper.querySelector('.product-form__error-message')

    this.errorMessageWrapper.toggleAttribute('hidden', !description)

    if (description) {
      this.errorMessage.textContent = description
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product',
        selector: `#cart-notification-product-${this.productId}`,
      },
      {
        id: 'cart-notification-button',
      },
      {
        id: 'cart-icon-bubble',
      },
    ]
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML
  }

  getCartNotificationBundleInnerHTML(url = window.location.pathname) {
    return fetch(`${url}?section_id=cart-notification-bundle`, {
      method: 'GET',
    })
      .then((response) => response.text())
      .then((response) => response)
  }

  handleBodyClick(evt) {
    const target = evt.target
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure')
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null
      this.close()
    }
  }

  setActiveElement(element) {
    this.activeElement = element
  }
}

customElements.define('cart-notification', CartNotification)
