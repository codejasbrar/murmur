class CartRemoveButton extends HTMLElement {
  constructor() {
    super()

    this.cartItem = this.closest('.cart-item')
    this.isBundle = this.cartItem.querySelector('[data-is-bundle="true"]')
    ? JSON.parse(this.cartItem.querySelector('[data-is-bundle="true"]').getAttribute('data-is-bundle'))
    : false

    if (this.isBundle) {
      this.isBundleTooltip = this.parentNode.querySelector('.is-bundle-tooltip')

      this.addEventListener('mouseenter', () => {
                            this.isBundleTooltip.classList.remove('opacity-0')
    })

    this.addEventListener('mouseleave', () => {
                          this.isBundleTooltip.classList.add('opacity-0')
  })
}

this.addEventListener('click', (event) => {
  event.preventDefault()

  this.closest('cart-items').updateQuantity(this.dataset.index, 0)
})
}
}

customElements.define('cart-remove-button', CartRemoveButton)

class CartItems extends HTMLElement {
  constructor() {
    super()

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status')

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]')).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value),
      0
    )

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event)
    }, 300)

    this.addEventListener('change', this.debouncedOnChange.bind(this))

    // this.discountMessage()
  }

  discountMessage() {
    const elementDiscountMessage = this.querySelector('#discount-message')

    let observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          // Ignore text nodes
          if (!(node instanceof HTMLElement)) continue

          // Identify only the node that has been adeded to DOM from PickyStory ('.CartNoticeInline_picky-cart-notice')
          if (node.matches('div[class*="CartNoticeInline_picky-cart-notice"]')) {
            if (elementDiscountMessage.classList.contains('hidden')) elementDiscountMessage.classList.remove('hidden')
              }
        }
      }
    })
    observer.observe(document.querySelector('#main-cart-footer'), {
      childList: true,
      subtree: true,
    })
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'))
  }

  getSectionsToRender() {


 var cartContents = fetch('/cart.js')
      .then(response => response.json())
      .then(data => { 
      console.log("cartContentscartContents=>",data);      
      var total_val = $(".totals__subtotal-value").eq(1).data('totals__subtotal');
      console.log("total_val",total_val);
      var free_gift_reduce_total = 20000;
      var cartItems = data.items,
      qtyInTheCart = 0,
      qtyInTheCart_price = 0,
      cartUpdates = [],
      gift_added = false,
      variant_id = 41811311329440,
      cartTotal = data.original_total_price;
        
    for (var i=0; i<cartItems.length; i++) {
      if (cartItems[i].id === variant_id ) {
        qtyInTheCart = cartItems[i].quantity;
        qtyInTheCart_price = cartItems[i].final_price;
        console.log(cartItems[i]);
        break;
      }
    }
    // var free_gift_reduce_totals = cartTotal - qtyInTheCart_price;
      console.log("cartTotal",cartTotal);
      console.log("qtyInTheCart_price",qtyInTheCart_price);
      console.log("free_gift_reduce_total",free_gift_reduce_total);
    if (( qtyInTheCart > 0 ) && (cartTotal < free_gift_reduce_total ) ) {
      // cartUpdates =  "updates["+variant_id+"]=0";
      gift_added = false;
    }else if (( cartItems.length > 0 ) && (cartTotal >= free_gift_reduce_total )){
      if((qtyInTheCart < 1)){
      cartUpdates =  "updates["+variant_id+"]=1";
    }
      gift_added = true;
    }else {
      return;
    }
     console.log("cartUpdates=>",cartUpdates);   
    $.ajax({
      type: 'POST',
      url: "/cart/update.js",
      data: cartUpdates,
      beforeSend: function() {
        $(".loader1").addClass('show');
      },
      success: function(data) {
        $("#shopify-section-template--15663570714784__cart-items").load(location.href + " #shopify-section-template--15663570714784__cart-items");
        $("#order-summary").load(location.href + " #order-summary");
        setTimeout(function(){ 
          console.log("gift_added",gift_added)
        if(gift_added){
          $("#cart-errors").css('display','flex');
          document.getElementById('cart-errors').innerHTML = "<div class='block-content'><b>Gift Product Added</b><p>You are eligible to Gift Product!</p><a href='javascript:void(0)' class='close'>Close</a></div>";          
        // setTimeout(function(){$("#cart-errors").css('display','none')},10000);          
        }else{
          $("#cart-errors").css('display','flex');
          document.getElementById('cart-errors').innerHTML = "<div class='block-content'><b>You no longer qualify for a free gift</b><p>This has been removed from your cart. Free gifts apply for orders over £200</p><a href='javascript:void(0)' class='close'>Close</a></div>";
        // setTimeout(function(){$("#cart-errors").slideUp('slow')},10000);          
        }
        },2000);

      },
      error: function(xhr) { 
        console.log("Error occured.please try again");
      },
      complete: function() {
        $(".loader1").removeClass('show');			
      }
    });

  });      
    
    
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ]

}

updateQuantity(line, quantity, name,) {
  this.enableLoading(line)
  console.log("test",line, quantity);

  const body = JSON.stringify({
    line,
    quantity,
    sections: this.getSectionsToRender().map((section) => section.section),
    sections_url: window.location.pathname,
  })

  fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
  .then((response) => {
    return response.text()
  })
  .then((state) => {
    const parsedState = JSON.parse(state)
    this.classList.toggle('is-empty', parsedState.item_count === 0)
    const cartFooter = document.getElementById('main-cart-footer')
console.log("cartFooter=>",cartFooter);
    if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0)

    this.getSectionsToRender().forEach((section) => {
      const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id)

      elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector)
    })

    this.updateLiveRegions(line, parsedState.item_count)
    const lineItem = document.getElementById(`CartItem-${line}`)
    if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus()
    this.disableLoading()
  })
  .catch((datas) => {
//          this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'))
//   document.getElementById('cart-errors').textContent = window.cartStrings.error
  this.disableLoading()
})
}

updateLiveRegions(line, itemCount) {
  if (this.currentItemCount === itemCount) {
    document.getElementById(`Line-item-error-${line}`).querySelector('.cart-item__error-text').innerHTML =
      window.cartStrings.quantityError.replace('[quantity]', document.getElementById(`Quantity-${line}`).value)
  }

  this.currentItemCount = itemCount
  this.lineItemStatusElement.setAttribute('aria-hidden', true)

  const cartStatus = document.getElementById('cart-live-region-text')
  cartStatus.setAttribute('aria-hidden', false)

  setTimeout(() => {
             cartStatus.setAttribute('aria-hidden', true)
}, 1000)
}

getSectionInnerHTML(html, selector) {
  return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML
}

enableLoading(line) {
  document.getElementById('main-cart-items').classList.add('cart__items--disabled')
  this.querySelectorAll(`#CartItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'))
  document.activeElement.blur()
  this.lineItemStatusElement.setAttribute('aria-hidden', false)

}

disableLoading() {
  document.getElementById('main-cart-items').classList.remove('cart__items--disabled')
}
}
customElements.define('cart-items', CartItems)
$(document).on("click",".close",function(){
  $("#cart-errors").css('display','none');
});