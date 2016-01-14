'use strict';
$(function () {
  require.config({
    paths: {
      ace: '../ace'
    }
  });

  require(['ace/ace', 'ace/ext-emmet'], function () {
    var _code = {
      curent: 'html',
      html: '',
      css: '',
      javascript: ''
    };


    var TOP_HEIGHT = $('header').innerHeight();
    var RESIZE_DELAY = 300;
    var $window = $(window);

    var QueryString = (function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return query_string;
  })();

  var debounce = function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  };

  var resize = function resize() {
    var windowHeight = $window.innerHeight();
    var desireHeight = windowHeight - TOP_HEIGHT;
    $('#workbench').innerHeight(desireHeight);
  };

  $window.on('resize', debounce(function () {
    resize();
  }, RESIZE_DELAY));
  resize();

  // $('#code-pane').resizable({
  //   containment: 'parent',
  //   handles: 'e, w'
  // });


  // Bring in ACE editor
  var editor = ace.edit('editor');
  editor.setTheme("ace/theme/monokai");
  editor.setOptions({
    showInvisibles: true,
    displayIndentGuides: true,
    showFoldWidgets: true,
    useSoftTabs: true,
    tabSize: 2
  });
  editor.getSession().setUseWorker(false);
  editor.getSession().setMode("ace/mode/html");
  editor.setOption("enableEmmet", true);
  editor.on('change', debounce(function () {
    _code[_code.curent] = editor.getValue();
    showResult();
  }, 1000));

  if (QueryString.key && QueryString.key.toLowerCase() === 'vim') {
    editor.setKeyboardHandler("ace/keyboard/vim");
  }
  // Event delegation.
  var $modes = $('#modes');
  $modes.on('click', function (evt) {
    var $this = $(this);
    evt = evt ? evt : window.event;
    var $target = evt.target ? evt.target : window.srcElement;
    $target = $($target);
    if ($target.attr('id') !== 'size-btn') {
      $this.find('a:not(#size-btn)').each(function () {
        $(this).removeClass('active');
      });
      $target.addClass('active');

      var mode = $target.attr('data-mode');
      _code[_code.curent] = editor.getValue();
      _code.curent = mode;
      if (mode === 'html') {
        editor.getSession().setUseWorker(false);
      }
      else {
        editor.getSession().setUseWorker(true);
      }
      editor.getSession().setMode('ace/mode/' + mode);
      editor.setValue(_code[_code.curent]);
    }
    else {
      var $sizeBtn = $('#size-btn');
      var text = $sizeBtn.text() === 'Full' ? 'Normal' : 'Full';
      $sizeBtn.text(text);
      $('#code-pane').toggleClass('small');
      $('#result-pane').toggleClass('big');
    }
  });

  var style, script;

  var showResult = function () {
    var frame = window.frames[0];
    frame.document.body.innerHTML = _code.html;

    var $doc = $(frame.document);
    $doc.find('style').remove();
    // Add style
    style = frame.document.createElement('style');
    style.appendChild(frame.document.createTextNode(_code.css));
    frame.document.head.appendChild(style);
    // Add script
    script = frame.document.createElement('script');
    script.appendChild(frame.document.createTextNode('try {'
                       + _code.javascript
                       + '} catch(e) {console.warn(e)}'));
    frame.document.body.appendChild(script);
  };

});




});
