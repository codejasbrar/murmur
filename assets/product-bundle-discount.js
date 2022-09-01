const $wrapper = document.querySelector('.product-metafields-bundle-discount')

if ($wrapper) {
  const discountPercentage = parseFloat(
    $wrapper.querySelector('.product-metafields-bundle-discount__value').textContent
  )

  const currencySymbol = Shopify.currency.active === 'GBP' ? '£' : '€'

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const price = mutation.target.textContent.trim()
      const amount = parseFloat(price.split(',').join('').substring(1)).toFixed(2)

      $wrapper.querySelector('.product-metafields-bundle-discount__original').textContent = calculateOriginalPrice(
        amount,
        discountPercentage,
        currencySymbol
      )
    })
  })

  observer.observe(document.querySelector('.price__regular > .price-item'), {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  })

  function calculateOriginalPrice(amount, percentage, currencySymbol = '£') {
    const calculatedAmount = amount / ((100 - percentage) / 100)
    return `${currencySymbol}${calculatedAmount}`
  }
}
