/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.1.0
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowFuture: false,
      localeTitle: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },
    inWords: function(distanceMillis) {
      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
      return $.trim([prefix, words, suffix].join(separator));
    },
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    },
    isTime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
    }
  });

  // functions that can be called via $(el).timeago('action')
  // init is default when no action is given
  // functions are called with context of a single element
  var functions = {
    init: function(){
      var refresh_el = $.proxy(refresh, this);
      refresh_el();
      var $s = $t.settings;
      if ($s.refreshMillis > 0) {
        setInterval(refresh_el, $s.refreshMillis);
      }
    },
    update: function(time){
      $(this).data('timeago', { datetime: $t.parse(time) });
      refresh.apply(this);
    }
  };

  $.fn.timeago = function(action, options) {
    var fn = action ? functions[action] : functions.init;
    if(!fn){
      throw new Error("Unknown function name '"+ action +"' for timeago");
    }
    // each over objects here and call the requested function
    this.each(function(){
      fn.call(this, options);
    });
    return this;
  };

  function refresh() {
    var data = prepareData(this);
    if (!isNaN(data.datetime)) {
      $(this).text(inWords(data.datetime));
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if ($t.settings.localeTitle) {
        element.attr("title", element.data('timeago').datetime.toLocaleString());
      } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}));
// jump modal
$(function() {

    var all;
    var visible;
    var active = -1;
    var lastFilter = '';
    var $body = $('#x-jump-body');
    var $list = $('#x-jump-list');
    var $filter = $('#x-jump-filter');
    var $modal = $('#x-jump');

    var update = function(filter) {
        lastFilter = filter;
        if (active >= 0) {
            visible[active].e.removeClass('active');
            active = -1;
        }
        visible = []
        var re = new RegExp(filter.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "gi");
        all.forEach(function (id) {
            id.e.detach();
            var text = id.text;
            if (filter) {
                text = id.text.replace(re, function (s) { return '<b>' + s + '</b>'; });
                if (text == id.text) {
                    return
                }
            }
            id.e.html(text + ' ' + '<i>' + id.kind + '</i>');
            visible.push(id);
        });
        $body.scrollTop(0);
        if (visible.length > 0) {
            active = 0;
            visible[active].e.addClass('active');
        }
        $list.append($.map(visible, function(identifier) { return identifier.e; }));
    }

    var incrActive = function(delta) {
        if (visible.length == 0) {
            return
        }
        visible[active].e.removeClass('active');
        active += delta;
        if (active < 0) {
            active = 0;
            $body.scrollTop(0);
        } else if (active >= visible.length) {
            active = visible.length - 1;
            $body.scrollTop($body[0].scrollHeight - $body[0].clientHeight);
        } else {
            var $e = visible[active].e;
            var t = $e.position().top;
            var b = t + $e.outerHeight(false);
            if (t <= 0) {
                $body.scrollTop($body.scrollTop() + t);
            } else if (b >= $body.outerHeight(false)) {
                $body.scrollTop($body.scrollTop() + b - $body.outerHeight(false));
            }
        }
        visible[active].e.addClass('active');
    }

    $modal.on('show.bs.modal', function() {
        if (!all) {
            all = []
            var kinds = {'c': 'constant', 'v': 'variable', 'f': 'function', 't': 'type', 'd': 'field', 'm': 'method'}
            $('*[id]').each(function() {
                var e = $(this);
                var id = e.attr('id');
                if (/^[^_][^-]*$/.test(id)) {
                    all.push({
                        text: id,
                        ltext: id.toLowerCase(),
                        kind: kinds[e.closest('[data-kind]').attr('data-kind')],
                        e: $('<a/>', {href: '#' + id, 'class': 'list-group-item', tabindex: '-1'})
                    });
                }
            });
            all.sort(function (a, b) {
                if (a.ltext > b.ltext) { return 1; }
                if (a.ltext < b.ltext) { return -1; }
                return 0
            });
        }
    }).on('shown.bs.modal', function() {
        update('');
        $filter.val('').focus();
    }).on('hide.bs.modal', function() {
        $filter.blur();
    }).on('click', '.list-group-item', function() {
        $modal.modal('hide');
    });

    $filter.on('change keyup', function() {
        var filter = $filter.val();
        if (filter.toUpperCase() != lastFilter.toUpperCase()) {
            update(filter);
        }
    }).on('keydown', function(e) {
        switch(e.which) {
        case 38: // up
            incrActive(-1);
            e.preventDefault(); 
            break;
        case 40: // down
            incrActive(1);
            e.preventDefault(); 
            break;
        case 13: // enter
            if (active >= 0) {
                visible[active].e[0].click();
            }
            break
        }
    });

});

$(function() {

    if ("onhashchange" in window) {
        var highlightedSel = "";
        window.onhashchange = function() {
            if (highlightedSel) {
                $(highlightedSel).removeClass("highlighted");
            }
            highlightedSel = window.location.hash.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
            if (highlightedSel && (highlightedSel.indexOf("example-") == -1)) {
                $(highlightedSel).addClass("highlighted");
            }
        };
        window.onhashchange();
    }

});

// keyboard shortcuts
$(function() {
    var prevCh = null, prevTime = 0, modal = false;

    $('.modal').on({
        show: function() { modal = true; },
        hidden: function() { modal = false; }
    });

    $(document).on('keypress', function(e) {
        var combo = e.timeStamp - prevTime <= 1000;
        prevTime = 0;

        if (modal) {
            return true;
        }

        var t = e.target.tagName
        if (t == 'INPUT' ||
            t == 'SELECT' ||
            t == 'TEXTAREA' ) {
            return true;
        }

        if (e.target.contentEditable && e.target.contentEditable == 'true') {
            return true;
        }

        if (e.metaKey || e.ctrlKey) {
            return true;
        }

        var ch = String.fromCharCode(e.which);

        if (combo) {
            switch (prevCh + ch) {
            case "gg":
                $('html,body').animate({scrollTop: 0},'fast');
                return false;
            case "gb":
                $('html,body').animate({scrollTop: $(document).height()},'fast');
                return false;
            case "gi":
                if ($('#pkg-index').length > 0) {
                    $('html,body').animate({scrollTop: $("#pkg-index").offset().top},'fast');
                    return false;
                }
            case "ge":
                if ($('#pkg-examples').length > 0) {
                    $('html,body').animate({scrollTop: $("#pkg-examples").offset().top},'fast');
                    return false;
                }
            }
        }

        switch (ch) {
        case "/":
            $('#x-search-query').focus();
            return false;
        case "?":
            $('#x-shortcuts').modal();
            return false;
        case  "f":
            if ($('#x-jump').length > 0) {
                $('#x-jump').modal();
                return false;
            }
        }

        prevCh = ch
        prevTime = e.timeStamp
        return true;
    });
});

// misc
$(function() {
    $('span.timeago').timeago();
    if (window.location.hash.substring(0, 9) == '#example-') {
        var id = '#ex-' + window.location.hash.substring(9);
        $(id).addClass('in').removeClass('collapse').height('auto');
    }

    $(document).on("click", "input.click-select", function(e) {
        $(e.target).select();
    });

    $('body').scrollspy({
        target: '.gddo-sidebar',
        offset: 10
    });
});
