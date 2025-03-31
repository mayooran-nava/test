const debounce = (func, delay) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

const ALL_TAB_ID = 'storyfeed-widget-tab-all'
const TODAY_SERVICES_ID = 'storyfeed-widget-tab-today-services'
const UPCOMING_SERVICES_ID = 'storyfeed-widget-tab-upcoming-services'
const BASE_URL = 'https://qa-api.storyfeed.io/api/v1/embed'

//open edit
function Widget(element) {
  this.url = ''
  this.baseURL = 'Krishna'
  this.perPage = null
  this.allFeeds = []
  this.widgetId = ''
  this.UPCOMING_SERVICES_ID = ''
  this.TODAY_SERVICES_ID = ''

  function init(element) {
    if (!element) return

    const widgetEleId = element.getAttribute('data-storyfeed-widget-id')

    if (!widgetEleId) return
    this.widgetId = widgetEleId
    this.UPCOMING_SERVICES_ID = `storyfeed-widget-tab-upcoming-services-${this.widgetId}`
    this.TODAY_SERVICES_ID = `storyfeed-widget-tab-today-services-${this.widgetId}`
    console.log(this)
    element.id = `storyfeed-widget-${this.widgetId}`
    element.className = 'storyfeed-widget'

    generateURL.call(this)
    renderLayout.call(this)
  }
  function generateURL() {
    widgetElement = document.getElementById(`storyfeed-widget-${this.widgetId}`)
    console.log('Widget Element', widgetElement)

    // Initialize the URL for each widget
    this.baseURL = BASE_URL
    let tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
    let serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
    let partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')
    console.log(this)

    // Get active tab from the DOM for each widget
    const activeTab = widgetElement.querySelector('.storyfeed-widget-active-tab')?.innerText || 'All'

    if (!serviceProviderId && !partnerIdentifier) {
      this.url = BASE_URL + `/${tenantId}`
    } else if (serviceProviderId) {
      this.url = BASE_URL + `/${tenantId}/sp/${serviceProviderId}`
    } else {
      this.url = BASE_URL + `/${tenantId}/partner/${partnerIdentifier}`
    }

    // Add endpoint based on active tab
    const embedOptions = this.embedOptions || {}
    if (activeTab === embedOptions.label_menu_today_services) {
      const today = new Date().toISOString().split('T')[0]
      this.url += `/today?date=${today}`
    } else if (activeTab === embedOptions.label_menu_upcoming) {
      this.url += '/upcoming'
    } else {
      this.url += '/feeds'
    }

    // Add common parameters for each widget
    const lang = widgetElement.getAttribute('data-storyfeed-widget-lang')
    const product_type = widgetElement.getAttribute('data-storyfeed-widget-product-type')
    const death_date_from = widgetElement.getAttribute('data-storyfeed-widget-death-date-from')
    const death_date_to = widgetElement.getAttribute('data-storyfeed-widget-death-date-to')
    const locations = widgetElement.getAttribute('data-storyfeed-widget-locations')
    const edition_slug = widgetElement.getAttribute('data-storyfeed-widget-edition-slug')

    if (lang !== '') this.url += `&lang=${lang}`
    if (product_type !== '') this.url += `&product_type=${product_type}`
    if (death_date_from !== '') this.url += `&death_date_from=${death_date_from}`
    if (death_date_to !== '') this.url += `&death_date_to=${death_date_to}`
    if (locations !== '') this.url += `&locations=${locations}`
    if (edition_slug !== '') this.url += `&edition=${edition_slug}`
  }

  function renderLayout() {
    const apiUrl = `${this.url}?&page=1`

    apiCall.call(this, apiUrl).then(data => {
      if (data.success && data.data?.per_page) {
        this.perPage = data.data.per_page
      }
    })
  }

  function apiCall(apiUrl) {
    // Render the loader while waiting for the response
    renderLoader.call(this)

    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          // Log detailed error if the fetch fails
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        removeLoader.call(this) // Remove the loader when data is fetched successfully
        if (data.success && data.data) {
          this.perPage = data.data.per_page || 15
          this.allFeeds = data.data?.feed
          renderWidget.call(this, data) // Render the widget with fetched data
        } else {
          console.error('Data format is not as expected:', data)
        }
      })
      .catch(error => {
        removeLoader.call(this) // Always remove the loader
        console.error('Error fetching the data:', error.message || error)
      })
  }

  //       const embedOptions = data.data?.embed
  //       if (!embedOptions) return

  //       this.embedOptions = embedOptions

  //       // to load the theme
  //       const widgetElement = document.querySelector('.storyfeed-widget');

  //       widgetElement.className = `storyfeed-widget-${embedOptions.theme}`

  //       if (embedOptions?.widget_margin) {
  //         widgetElement.style.margin = `${embedOptions.widget_margin}`
  //       }

  //       const isSiteBasedFontStyle = this.embedOptions?.is_site_based_font_style || false

  //       if (!isSiteBasedFontStyle) {
  //         widgetElement.style.fontFamily = "'Arial', sans-serif"
  //       } else {
  //         widgetElement.style.fontFamily = ''
  //       }
  //       // to create the layout
  //       const wrapper = document.createElement('div')
  //       wrapper.id = 'storyfeed-widget-wrapper'
  //       widgetElement.appendChild(wrapper)
  //       // Add border if outsideBorder is true
  //       if (embedOptions.outside_border === true) {
  //         wrapper.classList.add('show-border')
  //         // Apply border radius if provided in API response
  //         if (embedOptions.border_radius) {
  //           wrapper.style.borderRadius = `${embedOptions.border_radius}`
  //         }
  //       }

  //       const headerWrapper = document.createElement('div')
  //       headerWrapper.id = 'storyfeed-widget-header-wrapper'
  //       wrapper.appendChild(headerWrapper)

  //       //to load header data
  //       const title = document.createElement('div')
  //       title.id = 'storyfeed-widget-header-title'
  //       title.innerText = embedOptions.label_title
  //       headerWrapper.appendChild(title)

  //       //bookonline btn redirect
  //       if (embedOptions?.is_create_allowed) {
  //         const button = document.createElement('button')
  //         button.id = 'storyfeed-widget-header-button'
  //         button.innerText = embedOptions.label_cta_title
  //         button.addEventListener('click', () => {
  //           if (this.embedOptions?.is_blank_target) {
  //             window.open(embedOptions.cta_link, '_blank')
  //           } else {
  //             window.location.href = embedOptions.cta_link
  //           }
  //         })
  //         title.appendChild(button)
  //       }

  //       //searchbar
  //       if (embedOptions?.enable_search) {
  //         const searchContainer = document.createElement('div')
  //         searchContainer.id = 'storyfeed-widget-search-container'
  //         headerWrapper.appendChild(searchContainer)

  //         const searchInput = document.createElement('input')
  //         searchInput.id = 'storyfeed-widget-search-input'
  //         const searchIcon = document.createElement('div')
  //         const labelSearch = embedOptions.label_search
  //         searchIcon.id = 'storyfeed-widget-search-icon'
  //         searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  //   <path d="M17.9417 17.0583L14.7409 13.8575C15.8109 12.5883 16.4583 10.9525 16.4583 9.16667C16.4583 5.14583 13.1875 1.875 9.16667 1.875C5.14583 1.875 1.875 5.14583 1.875 9.16667C1.875 13.1875 5.14583 16.4583 9.16667 16.4583C10.9525 16.4583 12.5884 15.8108 13.8575 14.7408L17.0583 17.9417C17.18 18.0633 17.34 18.125 17.5 18.125C17.66 18.125 17.82 18.0642 17.9417 17.9417C18.1859 17.6983 18.1859 17.3025 17.9417 17.0583ZM3.125 9.16667C3.125 5.835 5.835 3.125 9.16667 3.125C12.4983 3.125 15.2083 5.835 15.2083 9.16667C15.2083 12.4983 12.4983 15.2083 9.16667 15.2083C5.835 15.2083 3.125 12.4983 3.125 9.16667Z" fill="#697586"/>
  // </svg>`
  //         searchContainer.appendChild(searchIcon)

  //         searchContainer.appendChild(searchInput)
  //         searchInput.setAttribute('type', 'text')
  //         searchInput.setAttribute('placeholder', labelSearch)

  //         //Close icon
  //         const closeIcon = document.createElement('div')
  //         closeIcon.id = 'storyfeed-widget-close-icon'
  //         closeIcon.innerHTML = `
  //       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.70089 17.0247C5.31422 17.4113 5.28215 18.0206 5.63016 18.3686C5.97817 18.7166 6.58743 18.6845 6.9741 18.2979L11.9996 13.2724L17.0299 18.3028C17.4166 18.6894 18.0259 18.7215 18.3739 18.3735C18.7219 18.0255 18.6898 17.4162 18.3031 17.0295L13.2728 11.9992L18.2915 6.98045C18.6782 6.59377 18.7103 5.98452 18.3623 5.63651C18.0142 5.2885 17.405 5.32056 17.0183 5.70724L11.9996 10.726L6.98572 5.71213C6.59904 5.32545 5.98979 5.29338 5.64178 5.64139C5.29377 5.9894 5.32583 6.59866 5.71251 6.98533L10.7264 11.9992L5.70089 17.0247Z" fill="#4B5565"></path></svg>`
  //         closeIcon.style.display = 'none'
  //         searchContainer.appendChild(closeIcon)

  //         searchInput.addEventListener(
  //           'input',
  //           debounce(e => {
  //             const query = e.target.value.trim()

  //             // If the input is empty, remove the empty card and show all feeds
  //             if (query.length >= 3) {
  //               // Call the appropriate search function based on the active tab
  //               const activeTab = document.querySelector('.storyfeed-widget-active-tab').id
  //               if (activeTab === UPCOMING_SERVICES_ID) {
  //                 searchAPI(query, 'upcoming')
  //               } else if (activeTab === TODAY_SERVICES_ID) {
  //                 searchAPI(query, 'todays')
  //               } else {
  //                 searchAPI(query, 'all') // Search in all feeds
  //               }
  //             } else if (query.length === 0) {
  //               // Clear the cards when the search input is empty
  //               const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //               if (cardsfeedWrapper) {
  //                 // Check if cardsfeedWrapper exists
  //                 while (cardsfeedWrapper.firstChild) {
  //                   cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
  //                 }
  //               }
  //               removeEmptyCard(wrapper)
  //               const activeTab = document.querySelector('.storyfeed-widget-active-tab').id
  //               if (activeTab === UPCOMING_SERVICES_ID) {
  //                 fetchUpcomingServices() // Fetch upcoming services
  //               } else if (activeTab === TODAY_SERVICES_ID) {
  //                 fetchTodaysServices() // Fetch today's services
  //               } else {
  //                 fetchAllFeeds() // Render all feeds
  //               }
  //             }

  //             // Toggle the visibility of the close icon based on the input length
  //             closeIcon.style.display = query.length > 0 ? 'block' : 'none'
  //           }, 500)
  //         )

  //         //Clear search when close icon is clicked
  //         closeIcon.addEventListener('click', () => {
  //           searchInput.value = ''
  //           closeIcon.style.display = 'none'

  //           const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //           if (cardsfeedWrapper) {
  //             // Check if cardsfeedWrapper exists
  //             while (cardsfeedWrapper.firstChild) {
  //               cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
  //             }
  //           }

  //           const activeTab = document.querySelector('.storyfeed-widget-active-tab').id

  //           // Reset the feeds based on the active tab
  //           if (activeTab === UPCOMING_SERVICES_ID) {
  //             fetchUpcomingServices()
  //           } else if (activeTab === TODAY_SERVICES_ID) {
  //             fetchTodaysServices()
  //           } else {
  //             fetchAllFeeds() // Render all feeds
  //           }
  //           removeEmptyCard(wrapper)
  //         })
  //       }

  //       //tabs
  //       const tabsContainer = document.createElement('div')
  //       tabsContainer.id = 'storyfeed-widget-tabs-container'
  //       // const tabs = ['All', 'Todays Services', 'Upcoming services']
  //       if (embedOptions?.enable_menu) {
  //         const tabs = []

  //         function removeTabActive() {
  //           const activeTabs = document.getElementsByClassName('storyfeed-widget-active-tab')
  //           for (let i = 0; i < activeTabs.length; i++) {
  //             activeTabs[i].classList.remove('storyfeed-widget-active-tab')
  //           }
  //           removeEmptyCard()
  //           removeSearchText()
  //         }

  //         // Add All Notices tab
  //         if (embedOptions.label_menu_all) {
  //           const allTab = document.createElement('div')
  //           allTab.id = 'storyfeed-widget-tab-all'
  //           allTab.innerText = embedOptions.label_menu_all
  //           allTab.classList.add('storyfeed-widget-active-tab')
  //           allTab.addEventListener('click', () => {
  //             removeTabActive()
  //             allTab.classList.add('storyfeed-widget-active-tab')
  //             // Clear existing content
  //             const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //             while (cardsfeedWrapper && cardsfeedWrapper.firstChild) {
  //               cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
  //             }
  //             // Clear existing footer when switching tabs
  //             const existingFooter = document.getElementById('storyfeed-widget-footer')
  //             if (existingFooter) {
  //               existingFooter.remove()
  //             }
  //             // Fetch all feeds
  //             fetchAllFeeds()
  //           })
  //           tabs.push(allTab)
  //         }

  //         // Add Today Services tab if enabled
  //         if (embedOptions.enable_menu_today_services && embedOptions.label_menu_today_services) {
  //           const todayTab = document.createElement('div')
  //           todayTab.id = 'storyfeed-widget-tab-today-services'
  //           todayTab.innerText = embedOptions.label_menu_today_services

  //           todayTab.addEventListener('click', () => {
  //             removeTabActive()
  //             todayTab.classList.add('storyfeed-widget-active-tab')

  //             // Clear existing content
  //             const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //             while (cardsfeedWrapper && cardsfeedWrapper.firstChild) {
  //               cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
  //             }
  //             // Clear existing footer when switching tabs
  //             const existingFooter = document.getElementById('storyfeed-widget-footer')
  //             if (existingFooter) {
  //               existingFooter.remove()
  //             }
  //             // Fetch today's services
  //             fetchTodaysServices()
  //           })
  //           tabs.push(todayTab)
  //         }

  //         // Add Upcoming Services tab if enabled
  //         if (embedOptions.enable_menu_upcoming && embedOptions.label_menu_upciming) {
  //           const upcomingTab = document.createElement('div')
  //           upcomingTab.id = 'storyfeed-widget-tab-upcoming-services'
  //           upcomingTab.innerText = embedOptions.label_menu_upciming

  //           upcomingTab.addEventListener('click', () => {
  //             removeTabActive()
  //             upcomingTab.classList.add('storyfeed-widget-active-tab')

  //             // Clear existing content
  //             const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //             while (cardsfeedWrapper && cardsfeedWrapper.firstChild) {
  //               cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
  //             }
  //             // Clear existing footer when switching tabs
  //             const existingFooter = document.getElementById('storyfeed-widget-footer')
  //             if (existingFooter) {
  //               existingFooter.remove()
  //             }
  //             // Fetch upcoming services
  //             fetchUpcomingServices()
  //           })
  //           tabs.push(upcomingTab)
  //         }

  //         // Append tabs to container
  //         tabs.forEach(tab => tabsContainer.appendChild(tab))
  //       }
  //       headerWrapper.appendChild(tabsContainer)

  //       //Cards feed condition
  //       const widgetFeeds = data.data?.feed || []
  //       console.log(widgetFeeds)

  //       if (widgetFeeds.length > 0) {
  //         renderCardsfeed(widgetFeeds, wrapper)
  //       } else {
  //         renderEmptyCard(wrapper)
  //       }

  //       renderfooter(data, wrapper)
  //     },

  function renderWidget(data) {
    // Get all instances of the .storyfeed-widget class

    const widgetElement = document.getElementById(`storyfeed-widget-${this.widgetId}`)
    if (!data.data?.embed) return

    this.embedOptions = data.data?.embed

    // To load the theme
    widgetElement.classList.add(`storyfeed-widget-${this.embedOptions.theme}`)

    if (this.embedOptions?.widget_margin) {
      widgetElement.style.margin = `${this.embedOptions.widget_margin}`
    }

    const isSiteBasedFontStyle = this.embedOptions?.is_site_based_font_style || false

    if (!isSiteBasedFontStyle) {
      widgetElement.style.fontFamily = "'Arial', sans-serif"
    } else {
      widgetElement.style.fontFamily = ''
    }

    // To create the layout
    const wrapper = document.createElement('div')
    wrapper.id = `storyfeed-widget-wrapper-${this.widgetId}`
    wrapper.className = 'storyfeed-widget-wrapper'
    widgetElement.appendChild(wrapper)

    // Add border if outsideBorder is true
    if (this.embedOptions.outside_border === true) {
      wrapper.classList.add('show-border')
      // Apply border radius if provided in API response
      if (this.embedOptions.border_radius) {
        wrapper.style.borderRadius = `${this.embedOptions.border_radius}`
      }
    }
    console.log(this.embedOptions.outside_border, 'ttttttttttttttttttttt')

    const headerWrapper = document.createElement('div')
    headerWrapper.id = `storyfeed-widget-header-wrapper-${this.widgetId}`
    headerWrapper.className = 'storyfeed-widget-header-wrapper'
    wrapper.appendChild(headerWrapper)

    // To load header data
    const title = document.createElement('div')
    title.id = `storyfeed-widget-header-title-${this.widgetId}`
    title.className = 'storyfeed-widget-header-title'
    title.innerText = this.embedOptions.label_title
    headerWrapper.appendChild(title)

    // Book online button redirect
    if (this.embedOptions?.is_create_allowed) {
      const button = document.createElement('button')
      button.className = 'storyfeed-widget-header-button'
      button.id = `storyfeed-widget-header-button-${this.widgetId}`
      button.innerText = this.embedOptions.label_cta_title
      button.addEventListener('click', () => {
        if (this.embedOptions?.is_blank_target) {
          window.open(this.embedOptions.cta_link, '_blank')
        } else {
          window.location.href = this.embedOptions.cta_link
        }
      })
      title.appendChild(button)
    }

    // Search bar
    if (this.embedOptions?.enable_search) {
      const searchContainer = document.createElement('div')

      searchContainer.id = `storyfeed-widget-search-container-${this.widgetId}`
      searchContainer.className = 'storyfeed-widget-search-container'
      headerWrapper.appendChild(searchContainer)

      const searchInput = document.createElement('input')
      searchInput.id = `storyfeed-widget-search-input-${this.widgetId}`
      const searchIcon = document.createElement('div')
      searchIcon.className = 'storyfeed-widget-search-icon'

      const labelSearch = this.embedOptions.label_search
      searchIcon.id = `storyfeed-widget-search-icon-${this.widgetId}`
      searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17.9417 17.0583L14.7409 13.8575C15.8109 12.5883 16.4583 10.9525 16.4583 9.16667C16.4583 5.14583 13.1875 1.875 9.16667 1.875C5.14583 1.875 1.875 5.14583 1.875 9.16667C1.875 13.1875 5.14583 16.4583 9.16667 16.4583C10.9525 16.4583 12.5884 15.8108 13.8575 14.7408L17.0583 17.9417C17.18 18.0633 17.34 18.125 17.5 18.125C17.66 18.125 17.82 18.0642 17.9417 17.9417C18.1859 17.6983 18.1859 17.3025 17.9417 17.0583ZM3.125 9.16667C3.125 5.835 5.835 3.125 9.16667 3.125C12.4983 3.125 15.2083 5.835 15.2083 9.16667C15.2083 12.4983 12.4983 15.2083 9.16667 15.2083C5.835 15.2083 3.125 12.4983 3.125 9.16667Z" fill="#697586"/></svg>`
      searchContainer.appendChild(searchIcon)
      searchContainer.appendChild(searchInput)
      searchInput.setAttribute('type', 'text')
      searchInput.setAttribute('placeholder', labelSearch)

      // Close icon
      const closeIcon = document.createElement('div')
      closeIcon.id = `storyfeed-widget-close-icon-${this.widgetId}`
      closeIcon.className = 'storyfeed-widget-close-icon'

      closeIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.70089 17.0247C5.31422 17.4113 5.28215 18.0206 5.63016 18.3686C5.97817 18.7166 6.58743 18.6845 6.9741 18.2979L11.9996 13.2724L17.0299 18.3028C17.4166 18.6894 18.0259 18.7215 18.3739 18.3735C18.7219 18.0255 18.6898 17.4162 18.3031 17.0295L13.2728 11.9992L18.2915 6.98045C18.6782 6.59377 18.7103 5.98452 18.3623 5.63651C18.0142 5.2885 17.405 5.32056 17.0183 5.70724L11.9996 10.726L6.98572 5.71213C6.59904 5.32545 5.98979 5.29338 5.64178 5.64139C5.29377 5.9894 5.32583 6.59866 5.71251 6.98533L10.7264 11.9992L5.70089 17.0247Z" fill="#4B5565"></path></svg>`
      closeIcon.style.display = 'none'
      searchContainer.appendChild(closeIcon)

      searchInput.addEventListener(
        'input',
        debounce(e => {
          const query = e.target.value.trim()

          // If the input is empty, remove the empty card and show all feeds
          if (query.length >= 3) {
            // Call the appropriate search function based on the active tab
            const activeTab = document.querySelector('.storyfeed-widget-active-tab').id
            if (activeTab === UPCOMING_SERVICES_ID) {
              searchAPI.call(this, query, 'upcoming')
            } else if (activeTab === TODAY_SERVICES_ID) {
              searchAPI.call(this, query, 'todays')
            } else {
              searchAPI.call(this, query, 'all')
            }
          } else if (query.length === 0) {
            // Clear the cards when the search input is empty
            const cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)
            if (cardsfeedWrapper) {
              // Check if cardsfeedWrapper exists
              while (cardsfeedWrapper.firstChild) {
                cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
              }
            }
            removeEmptyCard.call(this, wrapper)
            const activeTab = document.querySelectorAll('.storyfeed-widget-active-tab').id
            if (activeTab === UPCOMING_SERVICES_ID) {
              fetchUpcomingServices.call(this) // Fetch upcoming services
            } else if (activeTab === TODAY_SERVICES_ID) {
              fetchTodaysServices.call(this) // Fetch today's services
            } else {
              fetchAllFeeds.call(this) // Render all feeds
            }
          }

          // Toggle the visibility of the close icon based on the input length
          closeIcon.style.display = query.length > 0 ? 'block' : 'none'
        }, 500)
      )

      // Clear search when close icon is clicked
      closeIcon.addEventListener('click', () => {
        searchInput.value = ''
        closeIcon.style.display = 'none'

        const cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)
        if (cardsfeedWrapper) {
          // Check if cardsfeedWrapper exists
          while (cardsfeedWrapper.firstChild) {
            cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
          }
        }

        const activeTab = document.querySelector('.storyfeed-widget-active-tab').id

        // Reset the feeds based on the active tab
        if (activeTab === UPCOMING_SERVICES_ID) {
          fetchUpcomingServices.call(this)
        } else if (activeTab === TODAY_SERVICES_ID) {
          fetchTodaysServices.call(this)
        } else {
          fetchAllFeeds.call(this) // Render all feeds
        }
        removeEmptyCard.call(this, wrapper)
      })
    }

    // Tabs
    const tabsContainer = document.createElement('div')
    tabsContainer.className = 'storyfeed-widget-tabs-container'
    tabsContainer.id = `storyfeed-widget-tabs-container-${this.widgetId}`
    if (this.embedOptions?.enable_menu) {
      const tabs = []

      function removeTabActive() {
        const activeTabs = document.getElementsByClassName('storyfeed-widget-active-tab')
        for (let i = 0; i < activeTabs.length; i++) {
          activeTabs[i].classList.remove('storyfeed-widget-active-tab')
        }
        removeEmptyCard.call(this)
        removeSearchText.call(this)
      }

      // Add All Notices tab
      if (this.embedOptions.label_menu_all) {
        const allTab = document.createElement('div')
        allTab.className = 'storyfeed-widget-tab-all'
        allTab.id = `storyfeed-widget-tab-all-${this.widgetId}`
        allTab.innerText = this.embedOptions.label_menu_all
        allTab.classList.add('storyfeed-widget-active-tab')
        allTab.addEventListener('click', () => {
          removeTabActive.call(this)
          allTab.classList.add('storyfeed-widget-active-tab')
          // Clear existing content
          const cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)
          while (cardsfeedWrapper && cardsfeedWrapper.firstChild) {
            cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
          }
          // Clear existing footer when switching tabs
          const existingFooter = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
          if (existingFooter) {
            existingFooter.remove()
          }
          // Fetch all feeds
          fetchAllFeeds.call(this)
        })
        tabs.push(allTab)
      }

      // Add Today Services tab if enabled
      if (this.embedOptions.enable_menu_today_services && this.embedOptions.label_menu_today_services) {
        const todayTab = document.createElement('div')
        todayTab.className = 'storyfeed-widget-tab-today-services'
        todayTab.id = `storyfeed-widget-tab-today-services-${this.widgetId}`
        todayTab.innerText = this.embedOptions.label_menu_today_services

        todayTab.addEventListener('click', () => {
          removeTabActive.call(this)
          todayTab.classList.add('storyfeed-widget-active-tab')

          // Clear existing content
          const cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)
          while (cardsfeedWrapper && cardsfeedWrapper.firstChild) {
            cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
          }
          // Clear existing footer when switching tabs
          const existingFooter = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
          if (existingFooter) {
            existingFooter.remove()
          }
          // Fetch today's services
          fetchTodaysServices.call(this)
        })
        tabs.push(todayTab)
      }

      // Add Upcoming Services tab if enabled
      if (this.embedOptions.enable_menu_upcoming && this.embedOptions.label_menu_upciming) {
        const upcomingTab = document.createElement('div')
        upcomingTab.className = 'storyfeed-widget-tab-upcoming-services'
        upcomingTab.id = `storyfeed-widget-tab-upcoming-services-${this.widgetId}`
        upcomingTab.innerText = this.embedOptions.label_menu_upciming

        upcomingTab.addEventListener('click', () => {
          removeTabActive.call(this)
          upcomingTab.classList.add('storyfeed-widget-active-tab')

          // Clear existing content
          const cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)
          while (cardsfeedWrapper && cardsfeedWrapper.firstChild) {
            cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild)
          }
          // Clear existing footer when switching tabs
          const existingFooter = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
          if (existingFooter) {
            existingFooter.remove()
          }
          // Fetch upcoming services
          fetchUpcomingServices.call(this)
        })
        tabs.push(upcomingTab)
      }

      // Append tabs to container
      tabs.forEach(tab => tabsContainer.appendChild(tab))
    }
    headerWrapper.appendChild(tabsContainer)

    // Cards feed condition
    const widgetFeeds = data.data?.feed || []
    console.log(widgetFeeds)

    if (widgetFeeds.length > 0) {
      renderCardsfeed.call(this, widgetFeeds, wrapper)
    } else {
      renderEmptyCard.call(this, wrapper)
    }

    renderfooter.call(this, data, wrapper)
  }
  //   const embedOptions = data.data?.embed;
  //   if (!embedOptions) return;

  //   // Loop through all widgets
  //   const widgetElements = document.querySelectorAll('.storyfeed-widget');

  //   widgetElements.forEach((widgetElement) => {
  //     this.embedOptions = embedOptions;

  //     // Set the theme class
  //     widgetElement.className = `storyfeed-widget-${embedOptions.theme}`;

  //     // Set margin if specified
  //     if (embedOptions?.widget_margin) {
  //       widgetElement.style.margin = `${embedOptions.widget_margin}`;
  //     }

  //     const isSiteBasedFontStyle = this.embedOptions?.is_site_based_font_style || false;
  //     if (!isSiteBasedFontStyle) {
  //       widgetElement.style.fontFamily = "'Arial', sans-serif";
  //     } else {
  //       widgetElement.style.fontFamily = '';
  //     }

  //     // Create layout wrapper
  //     const wrapper = document.createElement('div');
  //     wrapper.id = 'storyfeed-widget-wrapper';
  //     widgetElement.appendChild(wrapper);

  //     // Add border if outsideBorder is true
  //     if (embedOptions.outside_border === true) {
  //       wrapper.classList.add('show-border');
  //       if (embedOptions.border_radius) {
  //         wrapper.style.borderRadius = `${embedOptions.border_radius}`;
  //       }
  //     }

  //     // Create header
  //     const headerWrapper = document.createElement('div');
  //     headerWrapper.id = 'storyfeed-widget-header-wrapper';
  //     wrapper.appendChild(headerWrapper);

  //     // Title of the widget
  //     const title = document.createElement('div');
  //     title.id = 'storyfeed-widget-header-title';
  //     title.innerText = embedOptions.label_title;
  //     headerWrapper.appendChild(title);

  //     // CTA Button if create is allowed
  //     if (embedOptions?.is_create_allowed) {
  //       const button = document.createElement('button');
  //       button.id = 'storyfeed-widget-header-button';
  //       button.innerText = embedOptions.label_cta_title;
  //       button.addEventListener('click', () => {
  //         if (this.embedOptions?.is_blank_target) {
  //           window.open(embedOptions.cta_link, '_blank');
  //         } else {
  //           window.location.href = embedOptions.cta_link;
  //         }
  //       });
  //       title.appendChild(button);
  //     }

  //     // Search bar if enabled
  //     if (embedOptions?.enable_search) {
  //       const searchContainer = document.createElement('div');
  //       searchContainer.id = 'storyfeed-widget-search-container';
  //       headerWrapper.appendChild(searchContainer);

  //       const searchInput = document.createElement('input');
  //       searchInput.id = 'storyfeed-widget-search-input';
  //       const searchIcon = document.createElement('div');
  //       const labelSearch = embedOptions.label_search;
  //       searchIcon.id = 'storyfeed-widget-search-icon';
  //       searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  //       <path d="M17.9417 17.0583L14.7409 13.8575C15.8109 12.5883 16.4583 10.9525 16.4583 9.16667C16.4583 5.14583 13.1875 1.875 9.16667 1.875C5.14583 1.875 1.875 5.14583 1.875 9.16667C1.875 13.1875 5.14583 16.4583 9.16667 16.4583C10.9525 16.4583 12.5884 15.8108 13.8575 14.7408L17.0583 17.9417C17.18 18.0633 17.34 18.125 17.5 18.125C17.66 18.125 17.82 18.0642 17.9417 17.9417C18.1859 17.6983 18.1859 17.3025 17.9417 17.0583ZM3.125 9.16667C3.125 5.835 5.835 3.125 9.16667 3.125C12.4983 3.125 15.2083 5.835 15.2083 9.16667C15.2083 12.4983 12.4983 15.2083 9.16667 15.2083C5.835 15.2083 3.125 12.4983 3.125 9.16667Z" fill="#697586"/>
  //       </svg>`;
  //       searchContainer.appendChild(searchIcon);

  //       searchContainer.appendChild(searchInput);
  //       searchInput.setAttribute('type', 'text');
  //       searchInput.setAttribute('placeholder', labelSearch);

  //       // Close icon logic
  //       const closeIcon = document.createElement('div');
  //       closeIcon.id = 'storyfeed-widget-close-icon';
  //       closeIcon.innerHTML = `
  //       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.70089 17.0247C5.31422 17.4113 5.28215 18.0206 5.63016 18.3686C5.97817 18.7166 6.58743 18.6845 6.9741 18.2979L11.9996 13.2724L17.0299 18.3028C17.4166 18.6894 18.0259 18.7215 18.3739 18.3735C18.7219 18.0255 18.6898 17.4162 18.3031 17.0295L13.2728 11.9992L18.2915 6.98045C18.6782 6.59377 18.7103 5.98452 18.3623 5.63651C18.0142 5.2885 17.405 5.32056 17.0183 5.70724L11.9996 10.726L6.98572 5.71213C6.59904 5.32545 5.98979 5.29338 5.64178 5.64139C5.29377 5.9894 5.32583 6.59866 5.71251 6.98533L10.7264 11.9992L5.70089 17.0247Z" fill="#4B5565"></path></svg>`;
  //       closeIcon.style.display = 'none';
  //       searchContainer.appendChild(closeIcon);

  //       // Search input event listener
  //       searchInput.addEventListener('input', debounce((e) => {
  //         const query = e.target.value.trim();

  //         if (query.length >= 3) {
  //           const activeTab = document.querySelector('.storyfeed-widget-active-tab')?.id;
  //           if (activeTab === 'UPCOMING_SERVICES_ID') {
  //             searchAPI(query, 'upcoming');
  //           } else if (activeTab === 'TODAY_SERVICES_ID') {
  //             searchAPI(query, 'todays');
  //           } else {
  //             searchAPI(query, 'all');
  //           }
  //         } else if (query.length === 0) {
  //           const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper');
  //           while (cardsfeedWrapper?.firstChild) {
  //             cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild);
  //           }
  //           removeEmptyCard(wrapper);
  //           const activeTab = document.querySelector('.storyfeed-widget-active-tab')?.id;
  //           if (activeTab === 'UPCOMING_SERVICES_ID') {
  //             fetchUpcomingServices();
  //           } else if (activeTab === 'TODAY_SERVICES_ID') {
  //             fetchTodaysServices();
  //           } else {
  //             fetchAllFeeds();
  //           }
  //         }

  //         closeIcon.style.display = query.length > 0 ? 'block' : 'none';
  //       }, 500));

  //       // Clear search when close icon is clicked
  //       closeIcon.addEventListener('click', () => {
  //         searchInput.value = '';
  //         closeIcon.style.display = 'none';

  //         const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper');
  //         while (cardsfeedWrapper?.firstChild) {
  //           cardsfeedWrapper.removeChild(cardsfeedWrapper.firstChild);
  //         }

  //         const activeTab = document.querySelector('.storyfeed-widget-active-tab')?.id;
  //         if (activeTab === 'UPCOMING_SERVICES_ID') {
  //           fetchUpcomingServices();
  //         } else if (activeTab === 'TODAY_SERVICES_ID') {
  //           fetchTodaysServices();
  //         } else {
  //           fetchAllFeeds();
  //         }
  //         removeEmptyCard(wrapper);
  //       });
  //     }

  //     // Render the widget content
  //     const widgetFeeds = data.data?.feed || [];
  //     if (widgetFeeds.length > 0) {
  //       renderCardsfeed(widgetFeeds, wrapper);
  //     } else {
  //       renderEmptyCard(wrapper);
  //     }

  //     renderfooter(data, wrapper);
  //   });
  // },

  function removeEmptyCard() {
    const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)
    const existingEmptyCard = document.getElementById(`storyfeed-widget-empty-card-${this.widgetId}`)
    if (existingEmptyCard) {
      wrapper.removeChild(existingEmptyCard)
    }
  }

  function removeSearchText() {
    const searchInput = document.getElementById(`storyfeed-widget-search-input-${this.widgetId}`)
    if (searchInput) {
      searchInput.value = ''
    }
  }

  function renderLoader() {
    const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)
    if (!wrapper) {
      console.warn('renderLoader called but wrapper is missing.')
      return // Don't try to add loader if wrapper doesn't exist
    }

    const footer = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
    if (footer) {
      footer.style.display = 'none'
    }

    let loader = document.getElementById(`storyfeed-widget-loader-${this.widgetId}`)
    if (!loader) {
      loader = document.createElement('div')
      loader.className = 'storyfeed-widget-loader'
      loader.id = `storyfeed-widget-loader-${this.widgetId}`
      loader.innerHTML = `<div class="spinner"></div> Loading`
    }
    if (footer) {
      wrapper.insertBefore(loader, footer)
    } else {
      wrapper.appendChild(loader)
    }
  }

  function removeLoader() {
    const loader = document.getElementById(`storyfeed-widget-loader-${this.widgetId}`)
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader)
    }

    const footer = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
    if (footer) {
      footer.style.display = 'flex'
    }
  }

  function fetchAllFeeds() {
    const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)
    renderLoader.call(this)

    const apiUrl = `${this.url}?page=1`
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch all feeds')
        }
        return response.json()
      })
      .then(data => {
        removeLoader.call(this)

        this.allFeeds = data.data?.feed || []
        const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)
        renderCardsfeed.call(this, this.allFeeds, wrapper)
      })
      .catch(error => {
        removeLoader.call(this)

        console.error('Error fetching all feeds:', error)
      })
  }

  //   const wrapper = document.getElementById('storyfeed-widget-wrapper')
  //   renderLoader()
  //   let upcomingServicesUrl

  //   const widgetElements = document.querySelector('.storyfeed-widget');
  //   const baseURL = this.baseURL
  //   const tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
  //   let serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
  //   let partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')
  //   console.log('Tenant ID:', tenantId)
  //   console.log('Service Provider ID:', serviceProviderId)
  //   console.log('Partner Identifier:', partnerIdentifier)

  //   const params = new URLSearchParams({
  //     lang: widgetElement.getAttribute('data-storyfeed-widget-lang') || '',
  //     product_type: widgetElement.getAttribute('data-storyfeed-widget-product-type') || '',
  //     death_date_from: widgetElement.getAttribute('data-storyfeed-widget-death-date-from') || '',
  //     death_date_to: widgetElement.getAttribute('data-storyfeed-widget-death-date-to') || '',
  //     locations: widgetElement.getAttribute('data-storyfeed-widget-locations') || '',
  //     edition: widgetElement.getAttribute('data-storyfeed-widget-edition-slug') || '',
  //   })

  //   // Append the query parameters to the URL
  //   upcomingServicesUrl += `?${params.toString()}`
  //   if (serviceProviderId) {
  //     upcomingServicesUrl = `${baseURL}/${tenantId}/sp/${serviceProviderId}/upcoming-services`
  //   } else if (partnerIdentifier) {
  //     upcomingServicesUrl = `${baseURL}/${tenantId}/partner/${partnerIdentifier}/upcoming-services`
  //   } else {
  //     upcomingServicesUrl = `${baseURL}/${tenantId}/upcoming-services`
  //   }

  //   fetch(upcomingServicesUrl)
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch upcoming services')
  //       }
  //       return response.json()
  //     })
  //     .then(data => {
  //       removeLoader()
  //       const widgetFeeds = data.data.feed || []
  //       removeEmptyCard(wrapper)
  //       renderCardsfeed(widgetFeeds, wrapper)
  //     })
  //     .catch(error => {
  //       removeLoader()
  //       console.error('Error upcoming services', error)
  //     })
  // },
  function fetchUpcomingServices() {
    // Select all elements with the class 'storyfeed-widget'
    const widgetElements = document.querySelectorAll('.storyfeed-widget')

    // Iterate over each widget element
    widgetElements.forEach(widgetElement => {
      const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)
      renderLoader.call(this)

      const baseURL = this.baseURL
      const tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
      const serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
      const partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')

      console.log('Tenant ID:', tenantId)
      console.log('Service Provider ID:', serviceProviderId)
      console.log('Partner Identifier:', partnerIdentifier)

      const params = new URLSearchParams({
        lang: widgetElement.getAttribute('data-storyfeed-widget-lang') || '',
        product_type: widgetElement.getAttribute('data-storyfeed-widget-product-type') || '',
        death_date_from: widgetElement.getAttribute('data-storyfeed-widget-death-date-from') || '',
        death_date_to: widgetElement.getAttribute('data-storyfeed-widget-death-date-to') || '',
        locations: widgetElement.getAttribute('data-storyfeed-widget-locations') || '',
        edition: widgetElement.getAttribute('data-storyfeed-widget-edition-slug') || '',
      })

      let upcomingServicesUrl = `${baseURL}/${tenantId}/upcoming-services` // Default URL

      if (serviceProviderId) {
        upcomingServicesUrl = `${baseURL}/${tenantId}/sp/${serviceProviderId}/upcoming-services`
      } else if (partnerIdentifier) {
        upcomingServicesUrl = `${baseURL}/${tenantId}/partner/${partnerIdentifier}/upcoming-services`
      }

      // Append the query parameters to the URL
      upcomingServicesUrl += `?${params.toString()}`

      // Fetch the data for upcoming services
      fetch(upcomingServicesUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch upcoming services')
          }
          return response.json()
        })
        .then(data => {
          removeLoader.call(this)
          const widgetFeeds = data.data.feed || []
          removeEmptyCard.call(this, wrapper)
          renderCardsfeed.call(this, widgetFeeds, wrapper)
        })
        .catch(error => {
          removeLoader.call(this)
          console.error('Error fetching upcoming services:', error)
        })
    })
  }

  //   const wrapper = document.getElementById('storyfeed-widget-wrapper')
  //   renderLoader()
  //   const today = new Date().toISOString().split('T')[0] // Get today's date in "YYYY-MM-DD" format

  //   const widgetElements = document.querySelector('.storyfeed-widget');
  //   const baseURL = this.baseURL
  //   const tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
  //   let serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
  //   let partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')

  //   let todaysServicesUrl

  //   // Construct the API URL based on the presence of serviceProviderId or partnerIdentifier
  //   if (serviceProviderId) {
  //     todaysServicesUrl = `${baseURL}/${tenantId}/sp/${serviceProviderId}/upcoming-services?&service_date=${today}`
  //   } else if (partnerIdentifier) {
  //     todaysServicesUrl = `${baseURL}/${tenantId}/partner/${partnerIdentifier}/upcoming-services?&service_date=${today}`
  //   } else {
  //     todaysServicesUrl = `${baseURL}/${tenantId}/upcoming-services?&service_date=${today}`
  //   }

  //   console.log(todaysServicesUrl)

  //   fetch(todaysServicesUrl)
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch todays services')
  //       }
  //       return response.json()
  //     })
  //     .then(data => {
  //       removeLoader()
  //       const widgetFeeds = data.data?.feed || []
  //       removeEmptyCard(wrapper)
  //       renderCardsfeed(widgetFeeds, wrapper)
  //     })
  //     .catch(error => {
  //       removeLoader()
  //       console.error('Error fetching todays services:', error)
  //     })
  // },
  function fetchTodaysServices() {
    // Select all elements with the class 'storyfeed-widget'
    const widgetElements = document.querySelectorAll('.storyfeed-widget')

    // Iterate over each widget element
    widgetElements.forEach(widgetElement => {
      const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)
      renderLoader.call(this)

      const today = new Date().toISOString().split('T')[0] // Get today's date in "YYYY-MM-DD" format

      const baseURL = this.baseURL
      const tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
      const serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
      const partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')

      let todaysServicesUrl

      // Construct the API URL based on the presence of serviceProviderId or partnerIdentifier
      if (serviceProviderId) {
        todaysServicesUrl = `${baseURL}/${tenantId}/sp/${serviceProviderId}/upcoming-services?&service_date=${today}`
      } else if (partnerIdentifier) {
        todaysServicesUrl = `${baseURL}/${tenantId}/partner/${partnerIdentifier}/upcoming-services?&service_date=${today}`
      } else {
        todaysServicesUrl = `${baseURL}/${tenantId}/upcoming-services?&service_date=${today}`
      }

      console.log(todaysServicesUrl)

      // Fetch today's services
      fetch(todaysServicesUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch todays services')
          }
          return response.json()
        })
        .then(data => {
          removeLoader.call(this)
          const widgetFeeds = data.data?.feed || []
          removeEmptyCard.call(this, wrapper)
          renderCardsfeed.call(this, widgetFeeds, wrapper)
        })
        .catch(error => {
          removeLoader.call(this)
          console.error('Error fetching todays services:', error)
        })
    })
  }

  //   const wrapper = document.getElementById('storyfeed-widget-wrapper')
  //   // renderLoader()
  //   if (!wrapper) {
  //     console.warn('search api called but wrapper is missing')
  //     return
  //   }

  //   if (query.trim() === '') {
  //     removeLoader()
  //     removeEmptyCard(wrapper)
  //     // If query is empty, reset and render all feeds
  //     renderCardsfeed(this.allFeeds, document.getElementById('storyfeed-widget-wrapper'))
  //     return
  //   }
  //   renderLoader()

  //   const widgetElements = document.querySelector('.storyfeed-widget');
  //   const baseURL = this.baseURL
  //   const tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
  //   let serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
  //   let partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')

  //   let lang = widgetElement.getAttribute('data-storyfeed-widget-lang')
  //   let product_type = widgetElement.getAttribute('data-storyfeed-widget-product-type')
  //   let death_date_from = widgetElement.getAttribute('data-storyfeed-widget-death-date-from')
  //   let death_date_to = widgetElement.getAttribute('data-storyfeed-widget-death-date-to')
  //   let locations = widgetElement.getAttribute('data-storyfeed-widget-locations')
  //   let edition_slug = widgetElement.getAttribute('data-storyfeed-widget-edition-slug')

  //   let apiSearchUrl = ''
  //   if (serviceProviderId) {
  //     apiSearchUrl = `${baseURL}/${tenantId}/sp/${serviceProviderId}`
  //   } else if (partnerIdentifier) {
  //     apiSearchUrl = `${baseURL}/${tenantId}/partner/${partnerIdentifier}`
  //   } else {
  //     apiSearchUrl = `${baseURL}/${tenantId}`
  //   }
  //   // https://qa-demosite.storyfeed.site/api/search/autocomplete?q=laya
  //   // https://ownstory.com/api/search/autocomplete?q=asl
  //   if (tabType === 'upcoming') {
  //     apiSearchUrl += `/upcoming-services?keyword=${query}`
  //   } else if (tabType === 'todays') {
  //     const today = new Date().toISOString().split('T')[0]
  //     apiSearchUrl += `/upcoming-services?keyword=${query}&service_date=${today}`
  //   } else {
  //     apiSearchUrl += `/feeds?keyword=${query}`
  //   }

  //   if (lang !== '') {
  //     apiSearchUrl += `&lang=${lang}`
  //   }
  //   if (product_type !== '') {
  //     apiSearchUrl += `&product_type=${product_type}`
  //   }
  //   if (death_date_from !== '') {
  //     apiSearchUrl += `&death_date_from=${death_date_from}`
  //   }
  //   if (death_date_to !== '') {
  //     apiSearchUrl += `&death_date_to=${death_date_to}`
  //   }
  //   if (locations !== '') {
  //     apiSearchUrl += `&locations=${locations}`
  //   }
  //   if (edition_slug !== '') {
  //     apiSearchUrl += `&edition=${edition_slug}`
  //   }

  //   const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //   if (cardsfeedWrapper) {
  //     wrapper.removeChild(cardsfeedWrapper)
  //   }

  //   fetch(apiSearchUrl)
  //     .then(response => response.json())
  //     .then(data => {
  //       removeLoader()

  //       const widgetFeeds = data.data.feed || []

  //       removeEmptyCard(wrapper)

  //       // const wrapper = document.getElementById('storyfeed-widget-wrapper')
  //       // const cardsfeedWrapper = document.getElementById('storyfeed-widget-cards-feedwrapper')
  //       // if (cardsfeedWrapper) {
  //       //   wrapper.removeChild(cardsfeedWrapper)
  //       // }

  //       if (widgetFeeds.length > 0) {
  //         renderCardsfeed(widgetFeeds, wrapper)
  //       } else {
  //         renderEmptyCard(wrapper)
  //       }
  //     })
  //     .catch(error => {
  //       removeLoader()

  //       console.error('Error during search API call:', error)
  //     })
  // },

  //date format
  function searchAPI(query, tabType) {
    // Select all elements with the class 'storyfeed-widget'
    const widgetElements = document.querySelectorAll('.storyfeed-widget')

    widgetElements.forEach(widgetElement => {
      const wrapper = document.getElementById(`storyfeed-widget-wrapper-${this.widgetId}`)

      if (!wrapper) {
        console.warn('Search API called but wrapper is missing')
        return
      }

      // If the query is empty, reset and render all feeds
      if (query.trim() === '') {
        removeLoader.call(this)
        removeEmptyCard.call(this, wrapper)
        renderCardsfeed.call(this, this.allFeeds, wrapper)
        return
      }

      renderLoader.call(this)

      const baseURL = this.baseURL
      const tenantId = widgetElement.getAttribute('data-storyfeed-widget-tenant-id')
      const serviceProviderId = widgetElement.getAttribute('data-storyfeed-widget-service-provider-id')
      const partnerIdentifier = widgetElement.getAttribute('data-storyfeed-widget-partner-id')

      const lang = widgetElement.getAttribute('data-storyfeed-widget-lang')
      const product_type = widgetElement.getAttribute('data-storyfeed-widget-product-type')
      const death_date_from = widgetElement.getAttribute('data-storyfeed-widget-death-date-from')
      const death_date_to = widgetElement.getAttribute('data-storyfeed-widget-death-date-to')
      const locations = widgetElement.getAttribute('data-storyfeed-widget-locations')
      const edition_slug = widgetElement.getAttribute('data-storyfeed-widget-edition-slug')

      let apiSearchUrl = ''

      if (serviceProviderId) {
        apiSearchUrl = `${baseURL}/${tenantId}/sp/${serviceProviderId}`
      } else if (partnerIdentifier) {
        apiSearchUrl = `${baseURL}/${tenantId}/partner/${partnerIdentifier}`
      } else {
        apiSearchUrl = `${baseURL}/${tenantId}`
      }

      if (tabType === 'upcoming') {
        apiSearchUrl += `/upcoming-services?keyword=${query}`
      } else if (tabType === 'todays') {
        const today = new Date().toISOString().split('T')[0]
        apiSearchUrl += `/upcoming-services?keyword=${query}&service_date=${today}`
      } else {
        apiSearchUrl += `/feeds?keyword=${query}`
      }

      // Append optional query parameters
      if (lang !== '') apiSearchUrl += `&lang=${lang}`
      if (product_type !== '') apiSearchUrl += `&product_type=${product_type}`
      if (death_date_from !== '') apiSearchUrl += `&death_date_from=${death_date_from}`
      if (death_date_to !== '') apiSearchUrl += `&death_date_to=${death_date_to}`
      if (locations !== '') apiSearchUrl += `&locations=${locations}`
      if (edition_slug !== '') apiSearchUrl += `&edition=${edition_slug}`

      const cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)
      if (cardsfeedWrapper) {
        wrapper.removeChild(cardsfeedWrapper)
      }

      // Fetch the data from the API
      fetch(apiSearchUrl)
        .then(response => response.json())
        .then(data => {
          removeLoader.call(this)

          const widgetFeeds = data.data?.feed || []

          removeEmptyCard.call(this, wrapper)

          if (widgetFeeds.length > 0) {
            renderCardsfeed.call(this, widgetFeeds, wrapper)
          } else {
            renderEmptyCard.call(this, wrapper)
          }
        })
        .catch(error => {
          removeLoader.call(this)
          console.error('Error during search API call:', error)
        })
    })
  }

  function formatEventDate(dateString) {
    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long' }
    const formattedDate = date.toLocaleDateString('en-GB', options)

    return formattedDate
  }
  //rendering cards if feed has card
  function renderCardsfeed(widgetFeeds, wrapper, activeTab) {
    let cardsfeedWrapper = document.getElementById(`storyfeed-widget-cards-feedwrapper-${this.widgetId}`)

    // Check if the cardsfeedWrapper already exists
    if (!cardsfeedWrapper) {
      // Create the wrapper if it doesn't exist
      cardsfeedWrapper = document.createElement('div')
      cardsfeedWrapper.className = 'storyfeed-widget-cards-feedwrapper'
      cardsfeedWrapper.id = `storyfeed-widget-cards-feedwrapper-${this.widgetId}`

      const widgetElement = document.getElementById(`storyfeed-widget-${this.widgetId}`)
      const displayType = widgetElement.getAttribute('data-storyfeed-widget-display-type')

      // Apply the appropriate styles based on the display type
      if (displayType === 'V') {
        cardsfeedWrapper.style.flexDirection = 'column'
      } else if (displayType === 'H') {
        cardsfeedWrapper.style.flexDirection = 'row'
        cardsfeedWrapper.style.overflowX = 'scroll'
        cardsfeedWrapper.style.scrollbarWidth = 'none'
      }

      wrapper.appendChild(cardsfeedWrapper)
    }

    widgetFeeds.forEach(feed => {
      if (!feed.content || !Array.isArray(feed.content)) return

      const cardContent = feed.content.find(item => item._name === 'notice' || item._name === 'page')
      if (!cardContent) return

      const card = document.createElement('div')
      card.className = 'storyfeed-widget-cards'
      card.id = `storyfeed-widget-cards-${this.widgetId}`

      const widgetElement = document.getElementById(`storyfeed-widget-${this.widgetId}`)
      const displayType = widgetElement.getAttribute('data-storyfeed-widget-display-type')
      if (displayType === 'H') {
        card.style.width = 'fit-content'
      } else if (displayType === 'V') {
      }

      //time format
      const publishedDate = feed.data.publishing.date
      const timeAgo = publishedDate ? formatTimeAgo(publishedDate) : ''
      if (this.embedOptions?.enable_notice_title_section === true) {
        if (publishedDate) {
          const cardtitle = document.createElement('div')
          cardtitle.className = 'storyfeed-widget-cardtitle'
          cardtitle.id = `storyfeed-widget-cardtitle-${this.widgetId}`
          if (this.embedOptions?.date_placement === 'top') {
            cardtitle.innerHTML = `
            <h1>${cardContent.data.title}</h1>
            <p>${timeAgo || ''}</p>`
          } else {
            cardtitle.innerHTML = `
            <h1>${cardContent.data.title}</h1>`
          }
          card.appendChild(cardtitle)
        }
      }
      const userdetails = document.createElement('div')
      userdetails.className = 'storyfeed-widget-userdetails'
      userdetails.id = `storyfeed-widget-userdetails-${this.widgetId}`

      const userProfile = document.createElement('img')
      userProfile.className = 'storyfeed-widget-userProfile'
      userProfile.id = `storyfeed-widget-userProfile-${this.widgetId}`
      if (displayType === 'V') {
        userProfile.style.width = '190px' // 130px width for vertical layout
        userProfile.style.height = '190px' // 130px height for vertical layout
      }
      userProfile.src = cardContent.data.page?.photo
      userProfile.addEventListener('click', () => {
        if (this.embedOptions?.is_blank_target) {
          window.open(cardContent.href, '_blank')
        } else {
          window.location.href = cardContent.href
        }
      })
      userdetails.appendChild(userProfile)

      const userContent = document.createElement('div')
      userContent.className = 'storyfeed-widget-card-usercontent'
      userContent.id = `storyfeed-widget-card-usercontent-${this.widgetId}`
      const locations = cardContent.data.page.line_3.map(location => location.name).join(', ')
      userContent.innerHTML = `
        <h1 class="truncate">${cardContent.data.page.name || ''}</h1>
        <p>${cardContent.data.page.line_1 || ''}</p>
        <h3>${cardContent.data.page.line_2 || ''}</h3>
        <h4>${locations || ''}</h4>
        <h5 class="truncate-multiline">${cardContent.data.page.line_4 || ''}</h5>`
      userContent.addEventListener('click', () => {
        if (this.embedOptions?.is_blank_target) {
          window.open(cardContent.href, '_blank')
        } else {
          window.location.href = cardContent.href
        }
      })
      userdetails.appendChild(userContent)

      const actionbutton = document.createElement('div')
      actionbutton.className = 'storyfeed-widget-card-action-btn'
      actionbutton.id = `storyfeed-widget-card-action-btn-${this.widgetId}`
      userContent.appendChild(actionbutton)
      const primaryBtn = document.createElement('button')
      primaryBtn.className = 'storyfeed-widget-card-primary-btn'
      primaryBtn.id = `storyfeed-widget-card-primary-btn-${this.widgetId}`
      primaryBtn.innerText = this.embedOptions?.label_view_notice

      // const viewNoticeHref = item.href
      primaryBtn.addEventListener('click', () => {
        if (this.embedOptions?.is_blank_target) {
          window.open(cardContent.href, '_blank')
        } else {
          window.location.href = cardContent.href
        }
      })
      actionbutton.appendChild(primaryBtn)

      //checking for displaying donate button
      const audienceActions = feed.content.find(item => item._name === 'audience_actions')
      if (audienceActions && audienceActions.data.length > 0) {
        const secondaryBtn = document.createElement('button')
        secondaryBtn.className = 'storyfeed-widget-card-secondary-btn'
        secondaryBtn.id = `storyfeed-widget-card-secondary-btn-${this.widgetId}`
        secondaryBtn.innerText = 'Donate'
        actionbutton.appendChild(secondaryBtn)
      }
      card.appendChild(userdetails)

      //conditionally render the notification
      if (cardContent.upcoming_event) {
        //Notification
        const notification = document.createElement('div')
        notification.className = 'storyfeed-widget-card-notification'
        notification.id = `storyfeed-widget-card-notification-${this.widgetId}`
        const formattedDate = formatEventDate(cardContent.upcoming_event.date)
        const activeTab = document.querySelector('.storyfeed-widget-active-tab').id

        // Set the innerHTML based on the active tab
        if (activeTab === TODAY_SERVICES_ID) {
          notification.innerHTML = `
              <h3>Today's Event: <span>${cardContent.upcoming_event.event_name} on ${formattedDate}</span></h3>`
        } else {
          notification.innerHTML = `
              <h3>Upcoming Event: <span>${cardContent.upcoming_event.event_name} on ${formattedDate}</span></h3>`
        }

        card.appendChild(notification)
      }
      const visits = document.createElement('div')
      visits.className = 'storyfeed-widget-card-visits'
      visits.id = `storyfeed-widget-card-visits-${this.widgetId}`
      const reach = document.createElement('div')
      reach.className = 'storyfeed-widget-card-reach'
      reach.id = `storyfeed-widget-card-reach-${this.widgetId}`
      if (this.embedOptions?.hide_view_count !== true) {
        reach.innerHTML = `
          <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="storyfeed-widget-eye-icon">
            <path d="M17.696 8.44861C16.6018 6.61611 14.1459 3.54199 10.0001 3.54199C5.85422 3.54199 3.3983 6.61611 2.30413 8.44861C1.73163 9.40528 1.73163 10.5945 2.30413 11.552C3.3983 13.3845 5.85422 16.4587 10.0001 16.4587C14.1459 16.4587 16.6018 13.3845 17.696 11.552C18.2685 10.5945 18.2685 9.40611 17.696 8.44861ZM16.6234 10.9104C15.6651 12.5154 13.5292 15.2087 10.0001 15.2087C6.47089 15.2087 4.33506 12.5162 3.37672 10.9104C3.04172 10.3487 3.04172 9.65114 3.37672 9.08948C4.33506 7.48448 6.47089 4.79118 10.0001 4.79118C13.5292 4.79118 15.6651 7.48364 16.6234 9.08948C16.9592 9.65198 16.9592 10.3487 16.6234 10.9104ZM10.0001 6.45866C8.04672 6.45866 6.45839 8.04783 6.45839 10.0003C6.45839 11.9528 8.04672 13.542 10.0001 13.542C11.9534 13.542 13.5417 11.9528 13.5417 10.0003C13.5417 8.04783 11.9534 6.45866 10.0001 6.45866ZM10.0001 12.292C8.73589 12.292 7.70839 11.2645 7.70839 10.0003C7.70839 8.73616 8.73589 7.70866 10.0001 7.70866C11.2642 7.70866 12.2917 8.73616 12.2917 10.0003C12.2917 11.2645 11.2642 12.292 10.0001 12.292Z"/>
          </svg>
          ${feed.data.stats.views}</h4>
          `
      }
      // if (this.embedOptions?.date_placement === 'bottom') {
      //   reach.innerHTML += `<h6>${timeAgo}</h6>`
      // }
      visits.appendChild(reach)
      const shareBtn = document.createElement('a')
      shareBtn.className = 'storyfeed-widget-card-share'
      // shareBtn.href = cardContent.href
      shareBtn.id = `storyfeed-widget-card-share-${this.widgetId}`
      if (this.embedOptions?.date_placement === 'bottom') {
        shareBtn.innerHTML += `<h6>${timeAgo}</h6>`
      }
      //         shareBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="storyfeed-widget-share-icon">
      //   <path d="M17.6516 8.38847L12.7116 3.16345C12.2999 2.72929 11.6733 2.59185 11.1208 2.81352C10.5658 3.03435 10.2075 3.56268 10.2083 4.15934V6.46525C4.8275 6.62609 1.875 8.90018 1.875 12.9093C1.875 14.286 2.2249 15.6577 2.8599 16.7719C3.04824 17.1027 3.38325 17.2927 3.74491 17.2927C3.83491 17.2927 3.92831 17.2811 4.01998 17.2561C4.47165 17.1336 4.77164 16.7361 4.76664 16.2661C4.75331 15.2536 4.85754 14.5128 5.41504 13.9478C6.16837 13.1844 7.77998 12.7685 10.2091 12.7085V14.997C10.2083 15.5936 10.5666 16.1228 11.1216 16.3436C11.6741 16.5644 12.3007 16.4268 12.7124 15.9926L17.6526 10.7676C18.2818 10.101 18.2816 9.05597 17.6516 8.38847ZM16.7434 9.90947L11.8034 15.1335C11.7251 15.216 11.6391 15.2044 11.5833 15.1819C11.5266 15.1594 11.4583 15.1086 11.4583 14.997V12.076C11.4583 11.731 11.1783 11.451 10.8333 11.451C7.61917 11.451 5.61411 11.9653 4.52494 13.0695C3.87661 13.7261 3.63332 14.5052 3.55082 15.3044C3.27332 14.5627 3.125 13.7385 3.125 12.9085C3.125 8.6077 7.31667 7.70528 10.8333 7.70528C11.1783 7.70528 11.4583 7.42528 11.4583 7.08028V4.15853C11.4583 4.0477 11.5258 3.99691 11.5833 3.97441C11.6058 3.96524 11.6342 3.95772 11.6642 3.95772C11.7084 3.95772 11.7567 3.97346 11.8034 4.02263L16.7434 9.24764C16.9192 9.43264 16.9192 9.72363 16.7434 9.90947Z"/>
      // </svg>
      // <p>Share</p>`
      visits.appendChild(shareBtn)
      card.appendChild(visits)
      cardsfeedWrapper.append(card)
    })
    setTimeout(() => {
      let widgetFooter = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
      if (widgetFooter) {
        wrapper.appendChild(widgetFooter)
      }
    }, 60)
    wrapper.appendChild(cardsfeedWrapper)
    renderfooter({ data: { feed: widgetFeeds, next_page_url: this.nextPageURLs?.[activeTab] } }, wrapper, activeTab)
  }
  //Function to time format
  function formatTimeAgo(publishedDate) {
    const publishedDateObj = new Date(publishedDate)
    const currentDate = new Date()
    const diffInSeconds = Math.floor((currentDate - publishedDateObj) / 1000)

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInSeconds < 60) {
      return 'a few seconds ago'
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? 'a minute' : `${diffInMinutes} minutes`
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? 'an hour' : `${diffInHours} hours`
    } else if (diffInDays === 1) {
      return '1 day'
    } else {
      return `${diffInDays} days`
    }
  }

  //rendering No record if there is no card
  function renderEmptyCard(wrapper) {
    const existingFooter = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
    if (existingFooter) {
      existingFooter.remove()
    }
    const existingEmptyCard = document.getElementById(`storyfeed-widget-empty-card-${this.widgetId}`)
    if (existingEmptyCard) {
      wrapper.removeChild(existingEmptyCard)
    }
    const emptyCard = document.createElement('div')
    emptyCard.className = 'storyfeed-widget-empty-card'
    emptyCard.id = `storyfeed-widget-empty-card-${this.widgetId}`
    const emptyCardContent = document.createElement('div')
    emptyCardContent.className = 'storyfeed-widget-empty-card-content'
    emptyCardContent.id = `storyfeed-widget-empty-card-content-${this.widgetId}`
    emptyCardContent.innerHTML = `
      <h1>No record found</h1>
      <p>There are no obituary notices available at the moment. Please check<br> back later or use the search function to find specific notices.</p>
      <button id="storyfeed-widget-create-btn">Create</button>`
    emptyCard.appendChild(emptyCardContent)
    wrapper.appendChild(emptyCard)
    setTimeout(() => {
      const createButton = document.getElementById(`storyfeed-widget-create-btn-${this.widgetId}`)
      if (createButton) {
        createButton.addEventListener('click', () => {
          const ctaLink = this.embedOptions?.cta_link
          const isBlankTarget = this.embedOptions?.is_blank_target || false

          if (isBlankTarget) {
            window.open(ctaLink, '_blank')
          } else {
            window.location.href = ctaLink
          }
        })
      }
    }, 100)
  }
  function renderfooter(data, wrapper, activeTab) {
    const nextPageURL = data.data.next_page_url
    const totalCards = data.data?.feed?.length || 0

    // Ensure nextPageUrls object exists
    this.nextPageUrls = this.nextPageUrls || {}

    // Store next page URL per tab if it exists
    if (nextPageURL) {
      this.nextPageUrls[activeTab] = nextPageURL
    }

    let widgetFooter = document.getElementById(`storyfeed-widget-footer-${this.widgetId}`)
    if (!widgetFooter) {
      widgetFooter = document.createElement('div')
      widgetFooter.className = 'storyfeed-widget-footer'
      widgetFooter.id = `storyfeed-widget-footer-${this.widgetId}`
      wrapper.appendChild(widgetFooter)
    }

    // Remove previous Load More button if it exists
    widgetFooter.innerHTML = ''

    // Retrieve stored next_page_url when switching tabs
    const storedNextPage = this.nextPageUrls[activeTab]

    if (storedNextPage && totalCards >= this.perPage) {
      let loadMoreBtn = document.createElement('button')
      loadMoreBtn.id = `storyfeed-load-more-btn-${this.widgetId}`
      loadMoreBtn.className = 'storyfeed-load-more-btn'

      loadMoreBtn.innerText = data.data.embed?.label_load_more || 'Load More'

      loadMoreBtn.addEventListener('click', () => {
        loadMoreData.call(this, storedNextPage, wrapper, activeTab)
      })

      widgetFooter.appendChild(loadMoreBtn)
    }
  }

  function loadMoreData(nextPageURL, wrapper, activeTab) {
    renderLoader.call(this)
    const scrollPosition = window.scrollY || document.documentElement.scrollTop
    fetch(nextPageURL)
      .then(response => response.json())
      .then(data => {
        removeLoader.call(this)
        renderCardsfeed.call(this, data.data?.feed, wrapper)

        // Ensure pagination works per tab
        renderfooter.call(this, data, wrapper, activeTab)

        window.scrollTo({ top: scrollPosition, behavior: 'instant' })
      })
      .catch(error => {
        removeLoader.call(this)
        console.error('Error fetching more data:', error)
      })
  }

  init.call(this, element)
}
document.addEventListener('DOMContentLoaded', () => {
  // Use querySelectorAll to select all matching elements by class
  const widgetElements = document.querySelectorAll('.storyfeed-widget')

  // If no widgets are found, log an error
  if (widgetElements.length === 0) {
    console.error('No widget elements found!')
    return
  }

  widgetElements.forEach(element => {
    console.log(element)
    const widget = new Widget(element)
    console.log(widget)
  })
})
