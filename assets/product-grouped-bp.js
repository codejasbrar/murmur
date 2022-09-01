const $cartNotification = document.querySelector('cart-notification')

$(function () {
  let choiceSize
  let buttons
  const queryVariant = getQueryVariable('variant')

  // Make sure the container's contents are loaded before firing this JS
  var checkExists = setInterval(function () {
    if ($('.cbb-also-bought-container select').length) {
      console.log('Container Loaded')
      clearInterval(checkExists)

      let tabOptions = []

      document.querySelectorAll('variant-radios > fieldset > label').forEach((label) => {
        tabOptions.push(label.innerText)
      })

      $('body')
        .find('.cbb-also-bought-product-price-container')
        .after(
          '<div class="num-block skin-2"><div class="num-in"><span class="minus dis"></span><input type="text" name="quantity" class="in-num" value="0"><span class="plus"></span></div></div>'
        )

      let addToCartForm = document.querySelector('.custom-product-form')

      const inputInNum = document.querySelectorAll('.cbb-also-bought-slider-container input.in-num')

      console.log(addToCartForm)

      // Create Variant Buttons
      const cbbSelects = document.querySelectorAll('.cbb-recommendations-variant-select')

      cbbSelects.forEach((select, index) => {
        const options = select.querySelectorAll('option')
        if (!options.length) return

        if (!Array.from(options).includes('-')) {
          const arrayOptions = Array.from(options).map((option) => option.innerText)

          // if (arrayOptions.some((option) => tabOptions.includes(option))) return
        }

        const container = document.createElement('div')
        container.classList.add('button-container')
        select.before(container)

        const selectVariantLabel = document.createElement('div')
        selectVariantLabel.classList.add('select-variant-label', 'text-tiny')
        selectVariantLabel.textContent = options[0].textContent
        container.before(selectVariantLabel)
          

        options.forEach((option) => {
          // colour-swatch-cloud-grey
          console.log("option_data",`${option.textContent.split('/')}`);
          var option_data = `${option.textContent.split('/')[1].trim().replace(' ', '-').toLowerCase()}`;
           option_data = `colour-swatch-${option_data}`;
          option.removeAttribute('selected')
          const button = document.createElement('button')
          button.classList.add('colour-swatch')
          button.classList.add(option_data)
          console.log("option.dataset",option.dataset);
// console.log("bg_option",option.textContent.split('-').pop().replace(/ /g, ''));
          button.name = option.textContent
          button.title = option.textContent
          button.dataset.variantImage = option.dataset.variantImage
          button.dataset.variantId = option.dataset.variantId
          button.textContent = option.textContent
          button.style.background = `linear-gradient(#f2eeee,${option.textContent.split('-').pop().replace(/ /g, '')})`

          container.appendChild(button)
        })
      })

      ///
      // Get default size and colour from <variant-radios>, first item for each
      if (queryVariant) {
        console.warn(`Query Variant ID: ${queryVariant}`)
        const variants = document.querySelector('variant-radios').getVariantData()
        const currentVariant = variants.find((element) => element.id === parseInt(queryVariant))
        choiceSize = currentVariant.option1

        ///
        const selects = document.querySelectorAll('select.cbb-recommendations-variant-select')

        selects.forEach((select) => {
          const options = select.querySelectorAll('option')

          if (!options.length) return

          if (!Array.from(options).includes('-')) {
            const arrayOptions = Array.from(options).map((option) => option.innerText)

            // if (arrayOptions.some((option) => tabOptions.includes(option))) return
          }

          const index = Array.from(options).findIndex((option) => option.textContent.includes(choiceSize))

          // if undefined, exit
          if (index === -1) return

          select.value = options[index].value

          // dispatch 'change' event on the select
          const eventChange = new Event('change')
          select.dispatchEvent(eventChange)

          // setting text label of current selected variant
          select.parentNode.querySelector('.select-variant-label').textContent = options[index].textContent
        })
        ///

        // console.log(`Size: ${choiceSize}`)
      } else {
        choiceSize = document.querySelector('variant-radios > fieldset > input[type="radio"][name="Size"]').value
      }
      ///

      buttons = document.body.querySelectorAll('li.cbb-also-bought-product .button-container button')

      //
      toggleProductContainer()
      //

      toggleButtons(buttons)

      // submit cart event
      addToCartForm.addEventListener('submit', (evt) => {
        evt.preventDefault()
        // Update to create an object based on the multiple input rows
        let items = []
        let rows = $('body').find('.cbb-also-bought-product').toArray()
        console.log(rows)
exit();
        for (let i = 0; i < rows.length; i++) {
          // Get the variant ID and quantity for each row.
          let itemData = rows[i]
          let id = parseInt(
            $(itemData).find('.cbb-recommendations-variant-select').find(':selected').attr('data-variant-id')
          )
          let qty = parseInt(itemData.querySelector('[name="quantity"]').value)
          // We don't care about any rows with a quantity of 0
          if (id && qty > 0) {
            items.push({ id: id, quantity: qty })
          }
          console.log(id + ' ' + items)
        }
        if (!items.length) {
          // Do something to tell the customer that there's nothing to add if all quantities were 0
          return
        }

        return (
          fetch('/cart/add.js', {
            method: 'POST',
            body: JSON.stringify({
              items: items,
              sections: ['cart-notification-product', 'cart-notification-button', 'cart-icon-bubble'],
            }),
            headers: { 'Content-type': 'application/json' },
            credentials: 'include',
            // Note: Including credentials sends the cart cookie, which is important to make sure that the items go into the shopper's cart and not into a void
          })
            .then((response) => {
              return response.json()
            })
            // display CartNotification dialog box
            .then((response) => {
              console.log(response)
              // handling CartNotification errors for products being added
              $(".add_to_cart_error").hide();
              if(response.status == 422){
                if($(".custom-product-form").siblings(".add_to_cart_error").length > 0){
                  $(".add_to_cart_error").html(response.description);
                }else{
                  $(".custom-product-form").before('<div class="cbb-also-bought-error add_to_cart_error" style="/* display: none; */background-color: rgb(255, 182, 193);border-radius: 4px;padding: 1em;margin-bottom: 10px;">'+response.description+'</div>');
                }
              }
              if (response.status) {
                $cartNotification.renderContentsError(response)
                return
              }

              $cartNotification.renderContentsGroup(response)

              // Reset quantity of input.in-num elements to zero
              inputInNum.forEach((input) => (input.value = 0))
            })
            .catch((error) => {
              console.error('Error:', error)
            })
        )
      })

      // Tabs (Sizes)
      $('body').on('click', '.variant-selection .product-form__input:nth-of-type(1) input', function (e) {
        // reset all <option> values, remove "selected" attribute
        $('body').find('.cbb-recommendations-variant-select option').removeAttr('selected')

        // Set Size
        choiceSize = $(this).val()

        const selects = document.querySelectorAll('select.cbb-recommendations-variant-select')
        selects.forEach((select) => {
          const options = select.querySelectorAll('option')

          if (!options.length) return

          if (!Array.from(options).includes('-')) {
            const arrayOptions = Array.from(options).map((option) => option.innerText)

            // if (arrayOptions.some((option) => tabOptions.includes(option))) return
          }

          const index = Array.from(options).findIndex((option) => option.textContent.includes(choiceSize))

          // if undefined, exit
          if (index === -1) return

          select.value = options[index].value

          // dispatch 'change' event on the select
          const eventChange = new Event('change')
          select.dispatchEvent(eventChange)

          // setting text label of current selected variant
          select.parentNode.querySelector('.select-variant-label').textContent = options[index].textContent
        })

        // hide unrelated buttons based on choiceSize
        toggleButtons(buttons)
        // hide products based on choiceSize
        toggleProductContainer()
      })

      // Buttons Event
      buttons.forEach((button) => {
        const buttonContainer = button.parentNode

        button.addEventListener('click', function () {
          // reset buttons
          buttonContainer.childNodes.forEach((button) => {
            button.classList.remove('active')
          })

          button.classList.add('active')

          // get variantId from button
          const { variantId } = button.dataset
          // console.log(variantId)
 var variantImage = button.dataset.variantImage
          
          $(button).parents('.cbb-also-bought-product').find(".cbb-also-bought-product-image").css("background-image","url('"+variantImage+"')")
          console.log("this.parentElement",variantImage);
          const select = this.parentElement.nextSibling
          const selectOptions = select.querySelectorAll('option')

          // remove selected attribute
          selectOptions.forEach((option) => option.removeAttribute('selected'))

          const correspondingOption = Array.from(selectOptions).find((option) => option.dataset.variantId == variantId)

          select.value = correspondingOption.value

          // dispatch 'change' event on the select
          const eventChange = new Event('change')
          select.dispatchEvent(eventChange)

          // change text of label
          this.parentElement.previousSibling.textContent = correspondingOption.textContent
        })
      })
    }
  }, 100) // check every 100ms

  // QTY buttons
  $('body').on('click', '.num-in span', function () {
    var $input = $(this).parents('.num-block').find('input.in-num')
    if ($(this).hasClass('minus')) {
      var count = parseInt($input.val()) - 1
      count = count < 1 ? 0 : count
      if (count < 2) {
        $(this).addClass('dis')
      } else {
        $(this).removeClass('dis')
      }
      $input.val(count)
    } else {
      var count = parseInt($input.val()) + 1
      $input.val(count)
      if (count > 1) {
        $(this).parents('.num-block').find('.minus').removeClass('dis')
      }
    }

    $input.change()
    return false
  })

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=')
      if (pair[0] == variable) {
        return pair[1]
      }
    }
    return false
  }

  function toggleButtons(buttons) {
    buttons.forEach((button) => {
      // reset all buttons
      button.classList.remove('active')

      const buttonContainer = button.parentNode
      const currentVariant = buttonContainer.previousSibling.textContent

      if (button.textContent == currentVariant) button.classList.add('active')

      // if (!button.textContent.includes('-')) return false

      // REGEX the button text string to match everything up to "-"
      let buttonText = button.textContent.match(/[^-]*/i)[0].trim()

      // Check if our string matches the current choice precisely
      // Also always show variant options for "Standard" sizes
      // const match = buttonText === choiceSize || buttonText === 'Standard' || buttonText === 'Square'

      // console.warn('Size = ' + choiceSize)
      // console.log('ButtonText = ' + buttonText)

      const newMatch =
        buttonText.includes(choiceSize) || buttonText.includes('Standard') || buttonText.includes('Square')
      // console.log(newMatch)
      // console.log(newMatch, buttonText, choiceSize)

      // button.classList.toggle('hidden', !match)
      button.classList.toggle('hidden', !newMatch)
    })
  }

  function toggleProductContainer() {
    const products = document.body.querySelectorAll('li.cbb-also-bought-product')

    products.forEach((product) => {
      // reset product container
      product.classList.remove('force-hidden')

      const buttonContainer = product.querySelector('.button-container')
      const buttons = Array.from(buttonContainer.querySelectorAll('button')).map(({ textContent }) =>
        textContent.split('/')[0].trim()
      )

      // if (buttons.lastIndexOf('Standard') > 0 || buttons.lastIndexOf('SquareOxford') > 0) {
      //   product.classList.remove('force-hidden')
      // } else if (buttons.lastIndexOf(choiceSize) === -1) {
      //   // product.classList.add('force-hidden')
      // }

      // skip product container which has "Standard" OR "SquareOxford" as the titles
      if (buttons.lastIndexOf('Standard') > 0 || buttons.lastIndexOf('Square Oxford') > 0) return

      console.log(buttons)

      if (buttons.lastIndexOf(choiceSize) === -1) {
        product.classList.add('force-hidden')
      }
    })
  }
})
