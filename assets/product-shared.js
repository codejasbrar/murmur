$(function () {
  // ---------- //
  // Accordions //
  // ---------- //

  // Active States
  $('body').on('click', '.accordion-title', function () {
    $(this).parent().toggleClass('active')
  })

  // Positioning
  function positionAccordions() {
    const accordian = document.getElementById('product_accordion')
    const media_wrapper = document.getElementById('product_media_wrapper')
    const info_wrapper = document.getElementById('product_info_wrapper')
    if (window.innerWidth <= 1024) {
      info_wrapper.appendChild(accordian)
    } else {
      media_wrapper.appendChild(accordian)
    }
  }

  // Debounced window.resize event listener
  let timeout
  window.addEventListener('resize', function () {
    // clear the timeout
    clearTimeout(timeout)
    // start timing for event "completion"
    timeout = setTimeout(positionAccordions, 200)
  })

  // position on initial page load
  positionAccordions()

  // Image Preview

  // Populate the main media div
  const firstMedia = $('.product__media-list.--custom > *:first-child img')
  const firstMediaSrc = firstMedia.attr('src')
  const firstMediaSrcSet = firstMedia.attr('srcset')
  const firstMediaId = firstMedia.attr('data-media-id')
  const firstModalId = firstMedia.closest('.custom-product__modal-opener').attr('data-modal')
  $('.product-media-main .product__modal-opener').attr('data-modal', firstModalId)
  $('.product-media-main button.product__media-toggle').attr('data-media-id', firstMediaId)
  $('.product-media-main .product__media img').attr('src', firstMediaSrc)
  $('.product-media-main .product__media img').attr('srcset', firstMediaSrcSet)

  // Hide thumnbails if there's only 1
  const mediaLength = $('.product__media-list.--custom .product__media').length
  if (mediaLength === 1) {
    $('.product__media-list.--custom').hide()
  }

  // When clicking thumbnails, repopulate the main media div
  $(document).on('click', '.product__media-list.--custom .product__media img', function (e) {
    const src = $(this).attr('src')
    const srcset = $(this).attr('srcset')
    const mediaId = $(this).attr('data-media-id')
    const modalId = $(this).closest('.custom-product__modal-opener').attr('data-modal')
    //console.log(mediaId)
    //console.log(modalId)
    $('.product-media-main .product__modal-opener').attr('data-modal', modalId)
    $('.product-media-main button.product__media-toggle').attr('data-media-id', mediaId)
    $('.product-media-main .product__media img').attr('src', src)
    $('.product-media-main .product__media img').attr('srcset', srcset)
    $('.product__media-list.--custom .custom-product__modal-opener').removeClass('active')
    $(this).closest('.custom-product__modal-opener').addClass('active')
    //document.querySelector('.product-media-main').scrollIntoView({ behavior: 'smooth' })
  })

  // Initialise Owl Carousel
  $('.owl-carousel').owlCarousel({
    loop: false,
    margin: 0,
    nav: true,
    dots: false,
    rewind: false,
    lazyLoadEager: 15,
    slideBy: 5,
    items: 5,
  })
})
