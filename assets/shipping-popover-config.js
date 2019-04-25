$(function() {
  var shippingBtn = $('#shipping-popover-button-mobile, #shipping-popover-button-desktop'),
  shippingCover = $('.shipping-popover-cover'),
  shippingWrapper = $('#shipping-popover-wrapper'),
  shippingContents = shippingWrapper.find(".shipping-contents"),
  backBtn = shippingWrapper.find('.countries-back-btn'),
  continentItems = shippingWrapper.find('.continent-item'),
  countriesWrapper = shippingWrapper.find('.countries-wrap'),
  countryWraps = shippingWrapper.find('.country-wrap'),
  closeBtn = shippingWrapper.find('.close-x'),
  currentLayout;

  window.languageToCurrency = {};

  setUpLanguageCountryCurrency();

  shippingBtn.on("click", function(e) {
    currentLayout = $(this).data("layout");

    unbindEvents();
    bindEvents( currentLayout );
    setLayout( currentLayout );
    loadBackgrounds();
    showShippingPopover();
  });

  bindGeneralEvents();

  setTimeout(function() {
    loadCountry();
  }, 500);

  enquire.register("(min-width: 767px", {
    match: function() {
      unbindEvents();
      bindDesktopEvents();
    },
    unmatch: function() {
      unbindEvents();
      bindMobileEvents();
    }
  });

  function setLayout(layout) {
    if( layout == "mobile" ) {
      shippingWrapper.removeClass("popover-desktop").addClass("popover-mobile");
      // unloadBackgrounds();
    } else {
      shippingWrapper.removeClass("popover-mobile").addClass("popover-desktop");
      // loadBackgrounds();
    }
  }


  $countryLinks = $('.country-list-item:not(.country-list-item-empty)');
  
  // store country on splash screen country selection
  (function storeCountryOnSplashSelection() {
    $countryLinks.on('click', function(event) {
      var countryName = event.target.textContent,
      countryCode = getLanguageCodeForCountry(countryName);
      storeCountry(countryName, countryCode);

    });
  })();

// mobile Change Flag on splash screen
(function changeFlagOnSplashSelectionMobile() {
  $(".country-list-item:not(.country-list-item-empty)").click(function() {
   var myClass = $(this).find( ".flag-icon" ).attr("class");
   $("#shipping-popover-button-mobile").addClass(myClass);
   storeCountry2(myClass,myClass);
 });

})();

function storeCountry2(country, countryCode) {
  if(countryCode != null)
    localStorage["shipping_selected_country_code"] = countryCode;
}






function unbindEvents() {
  continentItems.off();
}
function bindEvents(layout) {
  if( layout == "mobile" ) {
    bindMobileEvents();
  } else {
    bindDesktopEvents();
  }
  backBtn.on("click", function() {
    returnToContinents();
  });
}
function bindGeneralEvents() {
  countryWraps.on("click", "li", function() {
    var $this = $(this),
          countryName = $this.data("value").trim(), // lots of trailing whitespace for these values
          classes = $this.find(".flag-icon").attr("class").split(" "),
          countryCode = "us";

          for(var i = 0; i < classes.length; ++i) {
            if (classes[i].indexOf("flag-icon-") !== -1) {
              countryCode = classes[i].split("-").pop();
            }
          }

          selectCountry(countryName, countryCode);
        });
  closeBtn.on("click", function() {
    closeShippingPopover();
  });
  shippingCover.on("click", function() {
    closeShippingPopover();
  });
}
function bindDesktopEvents() {
  continentItems.on("mouseover", function() {
    var $this = $(this),
    targetSelector = $this.data("target"),
    target = $(targetSelector);

    continentItems.removeClass("continent-open");
    $this.addClass("continent-open");

      // slide everything to the left
      showCountries(target);
    });
}
function bindMobileEvents() {

  continentItems.on("click", function(e) {
    var $this = $(this),
    targetSelector = $this.data("target"),
    target = $(targetSelector);

      // slide everything to the left
      showCountries(target);
    });
}
function selectCountry(countryName, countryCode) {
  var languageSelector = $('#ly-languages-switcher'),
  languageOptions = [],
  options = languageSelector.find("option"),
  selectedValue,
  selectedCountry,
  countryFound = false,
  languages = [],
  languageCode,
  languageCountryList;

  languageOptions = loadLanguageOptions(languageSelector);

  storeCountry(countryName, countryCode);

  languageCountryList = getLanguageCountryList(countryName);
  if(languageCountryList)
    selectedCountry = getCountryInLanguageSelector(languageCountryList, languageOptions);
  if(selectedCountry) {
    selectedValue = getSelectedValueForLanguageSelector(selectedCountry, languageSelector);
  } else {
    selectedCountry = "United States";
    selectedValue = getSelectedValueForLanguageSelector(selectedCountry, languageSelector);
  }

  selectLanguageByCountry(selectedValue, languageSelector);
}
function showCountries(target) {
  countryWraps.hide();
  target.show();
  shippingContents.addClass("open");
}
function showFirstCountry() {
  var targetSelector = continentItems.first().data("target"),
  target = $(targetSelector);

  showCountries(target);
}
function returnToContinents() {
  shippingContents.removeClass("open");
  shippingWrapper.scrollTop(0);

    // to match the animation time in styles.css
    if( currentLayout == "mobile" ) {
      setTimeout(function() {
        countryWraps.hide();
      }, 500);
    }
  }
  function showShippingPopover() {
    showTallestCountryWrap();
    shippingCover.show();
    returnToContinents();

    if( currentLayout == "desktop" ) {
      continentItems.first().addClass("continent-open");
      showFirstCountry();
    } else {
      continentItems.first().removeClass("continent-open");
    }
    shippingWrapper.fadeIn();
  }
  function closeShippingPopover() {
    shippingWrapper.fadeOut();
    shippingCover.hide();
  }
  function showTallestCountryWrap() {
    var myCountry;

    shippingWrapper.show();
    countryWraps.show();

    countryWraps.each(function() {
      var $this = $(this);

      if( myCountry ) {
        myCountry = myCountry.height() > $this.height() ? myCountry : $this;
      } else {
        myCountry = $this;
      }
    });

    countryWraps.hide();
    myCountry.show();
    shippingWrapper.height( shippingWrapper.height() );
    myCountry.hide();
    shippingWrapper.hide();
  }
  function loadBackgrounds () {
    var listItems = countriesWrapper.find("li");

    listItems.each(function() {
      var $this = $(this),
      assetUrlFirst = "http://cdn.shopify.com/s/files/1/0648/6175/t/4/assets/",
      assetUrlLast = ".png?4730",
      backgroundURL = assetUrlFirst + encodeURI( $this.text() ) + assetUrlLast;

      if($this.data("background-url")) {
        $this.css({
          "background-image": "url(" + backgroundURL + ")"
        });
      }
    });
  }
  function unloadBackgrounds() {
    var listItems = countriesWrapper.find("li");

    listItems.css({
      "background-image": "none"
    });
  }

  function storeCountry(country, countryCode) {
    if(country != null)
      localStorage["shipping_selected_country"] = country;
    if(countryCode != null)
      localStorage["shipping_selected_country_code"] = countryCode;
  }

  function loadCountry() {

    var storedCountry = localStorage["shipping_selected_country"] || "Australia",
    countryCode = localStorage["shipping_selected_country_code"] || "au",
    shippingIcon = $('.icon-shipping'),
    currencySelector = $('#currencies'),
    countryCurrency = getCurrencyForCountry(storedCountry),
    defaultCurrency = "AUD",
    currentShippingElem = $('.current-shipping'),
    hasCurrency,
    mobileFlagIconElem = $('.icon-shipping'),
    flagImageName;

    if( typeof(storedCountry) === "undefined" ) {
      storedCountry = "Australia";
    }
    if( typeof(countryCurrency) === "undefined" ) {
      countryCurrency = defaultCurrency;
    }

    // find if currency is available in converter
    hasCurrency = false;

    currencySelector.find("option").each(function() {
      if( !hasCurrency && $(this).val() === countryCurrency ) {
        hasCurrency = true;
      }
    });
    // else use shop default
    if(!hasCurrency) {
      countryCurrency = defaultCurrency;
    }
    // set new currency
    currencySelector.val(countryCurrency).change();

    // set new country name
    currentShippingElem.text(storedCountry);

    // set correct flag for mobile
    shippingIcon.addClass('flag-icon-' + countryCode);
  }

  /***********************************************************/
  /* Sync shipping popover selection with language selection */
  /***********************************************************/

  function getCurrencyForCountry(countryName) {
    var countryList = getLanguageCountryList(countryName);

    for(var i = 0; i < countryList.length; ++i) {
      if( Object.keys(countryList[i])[0] === countryName ) {
        return countryList[i][countryName];
      }
    }
  }

  function loadLanguageOptions(languageSelector) {
    var languageOptions = [];

    languageSelector.find('option').each(function() {
      languageOptions.push( $(this).text() );
    });

    return languageOptions;
  }

  function getLanguageCountryList(countryName) {
    var languageCountryList,
    found = false;

    $.each(window.languageToCurrency, function(key) {
      if(!found) {
        // list of countries related to this language
        languageCountryList = this;
        for(var i = 0; i < languageCountryList.length; ++i) {
          if( countryName in languageCountryList[i] ) {
            found = true;
          }
        }
      }
    });

    return languageCountryList || false;
  }

  function getLanguageCodeForCountry(countryName) {
    var found = false,
    languageKey;

    $.each(window.languageToCurrency, function(key) {
      if(!found) {
        // list of countries related to this language
        languageCountryList = this;

        for(var i = 0; i < languageCountryList.length; ++i) {
          if( countryName in languageCountryList[i] ) {
            languageKey = key;
            found = true;
          }
        }
      }
    });
  }
  function getCountryInLanguageSelector(languageCountryList, languageOptions) {
    for(var i = 0; i < languageCountryList.length; ++i) {
      var languageName = Object.keys(languageCountryList[i])[0];
      if( languageOptions.indexOf(languageName) != -1 ) {
        return languageName;
      }
    }

    return false;
  }

  function getSelectedValueForLanguageSelector(selectedCountry, languageSelector) {
    return languageSelector.find('option').filter(function() {
      return $(this).text() === selectedCountry;
    }).val();
  }

  function selectLanguageByCountry(selectedValue, languageSelector) {
    languageSelector.val(selectedValue).change();
  }

  function setUpLanguageCountryCurrency() {
    window.languageToCurrency = {
      "en": [
      {"United States": "USD"},
      {"Canada": "CAD"},
      {"United Kingdom": "GBP"},
      {"Australia": "AUD"},
      {"New Zealand": "NZD"},
      {"Germany (EN)": "EUR"},
      {"Guernsey": "EUR"},
      {"Malta": "EUR"},
      {"Ireland": "EUR"},
      {"Isle of Man": "GBP"},
      {"Switzerland (EN)": "CHF"},
      {"Japan (EN)": "JPY"}
      ],
      "de": [
      {"Deutschland (DE)": "EUR"},
      {"Austria": "EUR"},
      {"Belgium": "EUR"},
      {"Schweiz (DE)": "CHF"}
      ],
      "fr": [
      {"France (FR)": "EUR"},
      {"Luxembourg": "EUR"},
      {"Jersey": "JEP"},
      {"Suisse (FR)": "EUR"}
      ],
      "zh": [
      {"中国大陆 (SC)": "CNY"}
      ],
      "sp": [
      {"Spain": "EUR"},
      {"Mexico": "MXN"},
      {"Colombia": "COP"},
      {"Argentina": "ARS"},
      {"Bolivia": "BOL"}
      ],
      "br": [
      {"Brasil (PT)": "BRL"}
      ],
      "ca": [
      {"Andorra": "EUR"}
      ],
      "bg": [
      {"Bulgaria": "BGN"}
      ],
      "hr": [
      {"Croatia": "HRK"}
      ],
      "lv": [
      {"Latvia": "EUR"}
      ],
      "lt": [
      {"Lithuania": "EUR"}
      ],
      "tr": [
      {"Cyprus": "EUR"}
      ],
      "cs": [
      {"Czech Republic": "CZK"}
      ],
      "da": [
      {"Denmark": "DKK"}
      ],
      "se": [
      {"Sweden": "SEK"}
      ],
      "no": [
      {"Norway": "NOK"}
      ],
      "fi": [
      {"Finland": "EUR"}
      ],
      "et": [
      {"Estonia": "EUR"}
      ],
      "el": [
      {"Greece": "EUR"}
      ],
      "hu": [
      {"Hungary": "HUF"}
      ],
      "is": [
      {"Iceland": "ISK"}
      ],
      "it": [
      {"Italy": "EUR"},
      {"San Marino": "EUR"},
      {"Vatican City": "EUR"}
      ],
      "jp": [
      {"日本 (JE)": "JPY"}
      ],
      "li": [
      {"Monaco": "EUR"}
      ],
      "nl": [
      {"Netherlands": "EUR"}
      ],
      "pl": [
      {"Poland": "PLN"}
      ],
      "pt": [
      {"Portugal": "EUR"}
      ],
      "ro": [
      {"Romania": "RON"}
      ],
      "sk": [
      {"Slovakia": "EUR"},
      {"Slovenia": "EUR"}
      ],
      "sg": [
      {"Singapore": "SGD"}
      ]
    };
  }
});