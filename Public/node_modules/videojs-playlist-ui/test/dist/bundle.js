(function (QUnit,videojs) {
'use strict';

QUnit = 'default' in QUnit ? QUnit['default'] : QUnit;
videojs = 'default' in videojs ? videojs['default'] : videojs;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var empty = {};


var empty$1 = (Object.freeze || Object)({
	'default': empty
});

var minDoc = ( empty$1 && empty ) || empty$1;

var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
    typeof window !== 'undefined' ? window : {};


var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

var document_1 = doccy;

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof commonjsGlobal !== "undefined") {
    win = commonjsGlobal;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

var window_1 = win;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

// support VJS5 & VJS6 at the same time
var dom = videojs.dom || videojs;
var registerPlugin = videojs.registerPlugin || videojs.plugin;

// Array#indexOf analog for IE8
var indexOf = function indexOf(array, target) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === target) {
      return i;
    }
  }
  return -1;
};

// see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/pointerevents.js
var supportsCssPointerEvents = function () {
  var element = document_1.createElement('x');

  element.style.cssText = 'pointer-events:auto';
  return element.style.pointerEvents === 'auto';
}();

var defaults$$1 = {
  className: 'vjs-playlist',
  playOnSelect: false,
  supportsCssPointerEvents: supportsCssPointerEvents
};

// we don't add `vjs-playlist-now-playing` in addSelectedClass
// so it won't conflict with `vjs-icon-play
// since it'll get added when we mouse out
var addSelectedClass = function addSelectedClass(el) {
  el.addClass('vjs-selected');
};
var removeSelectedClass = function removeSelectedClass(el) {
  el.removeClass('vjs-selected');

  if (el.thumbnail) {
    dom.removeClass(el.thumbnail, 'vjs-playlist-now-playing');
  }
};

var upNext = function upNext(el) {
  el.addClass('vjs-up-next');
};
var notUpNext = function notUpNext(el) {
  el.removeClass('vjs-up-next');
};

var createThumbnail = function createThumbnail(thumbnail) {
  if (!thumbnail) {
    var placeholder = document_1.createElement('div');

    placeholder.className = 'vjs-playlist-thumbnail vjs-playlist-thumbnail-placeholder';
    return placeholder;
  }

  var picture = document_1.createElement('picture');

  picture.className = 'vjs-playlist-thumbnail';

  if (typeof thumbnail === 'string') {
    // simple thumbnails
    var img = document_1.createElement('img');

    img.src = thumbnail;
    img.alt = '';
    picture.appendChild(img);
  } else {
    // responsive thumbnails

    // additional variations of a <picture> are specified as
    // <source> elements
    for (var i = 0; i < thumbnail.length - 1; i++) {
      var _variant = thumbnail[i];
      var source = document_1.createElement('source');

      // transfer the properties of each variant onto a <source>
      for (var prop in _variant) {
        source[prop] = _variant[prop];
      }
      picture.appendChild(source);
    }

    // the default version of a <picture> is specified by an <img>
    var variant = thumbnail[thumbnail.length - 1];
    var _img = document_1.createElement('img');

    _img.alt = '';
    for (var _prop in variant) {
      _img[_prop] = variant[_prop];
    }
    picture.appendChild(_img);
  }
  return picture;
};

var Component = videojs.getComponent('Component');

var PlaylistMenuItem = function (_Component) {
  inherits(PlaylistMenuItem, _Component);

  function PlaylistMenuItem(player, playlistItem, settings) {
    classCallCheck(this, PlaylistMenuItem);

    if (!playlistItem.item) {
      throw new Error('Cannot construct a PlaylistMenuItem without an item option');
    }

    var _this = possibleConstructorReturn(this, _Component.call(this, player, playlistItem));

    _this.item = playlistItem.item;

    _this.playOnSelect = settings.playOnSelect;

    _this.emitTapEvents();

    _this.on(['click', 'tap'], _this.switchPlaylistItem_);
    _this.on('keydown', _this.handleKeyDown_);

    return _this;
  }

  PlaylistMenuItem.prototype.handleKeyDown_ = function handleKeyDown_(event) {
    // keycode 13 is <Enter>
    // keycode 32 is <Space>
    if (event.which === 13 || event.which === 32) {
      this.switchPlaylistItem_();
    }
  };

  PlaylistMenuItem.prototype.switchPlaylistItem_ = function switchPlaylistItem_(event) {
    this.player_.playlist.currentItem(indexOf(this.player_.playlist(), this.item));
    if (this.playOnSelect) {
      this.player_.play();
    }
  };

  PlaylistMenuItem.prototype.createEl = function createEl() {
    var li = document_1.createElement('li');
    var item = this.options_.item;

    li.className = 'vjs-playlist-item';
    li.setAttribute('tabIndex', 0);

    // Thumbnail image
    this.thumbnail = createThumbnail(item.thumbnail);
    li.appendChild(this.thumbnail);

    // Duration
    if (item.duration) {
      var duration = document_1.createElement('time');
      var time = videojs.formatTime(item.duration);

      duration.className = 'vjs-playlist-duration';
      duration.setAttribute('datetime', 'PT0H0M' + item.duration + 'S');
      duration.appendChild(document_1.createTextNode(time));
      li.appendChild(duration);
    }

    // Now playing
    var nowPlayingEl = document_1.createElement('span');
    var nowPlayingText = this.localize('Now Playing');

    nowPlayingEl.className = 'vjs-playlist-now-playing-text';
    nowPlayingEl.appendChild(document_1.createTextNode(nowPlayingText));
    nowPlayingEl.setAttribute('title', nowPlayingText);
    this.thumbnail.appendChild(nowPlayingEl);

    // Title container contains title and "up next"
    var titleContainerEl = document_1.createElement('div');

    titleContainerEl.className = 'vjs-playlist-title-container';
    this.thumbnail.appendChild(titleContainerEl);

    // Up next
    var upNextEl = document_1.createElement('span');
    var upNextText = this.localize('Up Next');

    upNextEl.className = 'vjs-up-next-text';
    upNextEl.appendChild(document_1.createTextNode(upNextText));
    upNextEl.setAttribute('title', upNextText);
    titleContainerEl.appendChild(upNextEl);

    // Video title
    var titleEl = document_1.createElement('cite');
    var titleText = item.name || this.localize('Untitled Video');

    titleEl.className = 'vjs-playlist-name';
    titleEl.appendChild(document_1.createTextNode(titleText));
    titleEl.setAttribute('title', titleText);
    titleContainerEl.appendChild(titleEl);

    return li;
  };

  return PlaylistMenuItem;
}(Component);

var PlaylistMenu = function (_Component2) {
  inherits(PlaylistMenu, _Component2);

  function PlaylistMenu(player, settings) {
    classCallCheck(this, PlaylistMenu);

    if (!player.playlist) {
      throw new Error('videojs-playlist is required for the playlist component');
    }

    var _this2 = possibleConstructorReturn(this, _Component2.call(this, player, settings));

    _this2.items = [];

    // If CSS pointer events aren't supported, we have to prevent
    // clicking on playlist items during ads with slightly more
    // invasive techniques. Details in the stylesheet.
    if (settings.supportsCssPointerEvents) {
      _this2.addClass('vjs-csspointerevents');
    }

    _this2.createPlaylist_();

    if (!videojs.browser.TOUCH_ENABLED) {
      _this2.addClass('vjs-mouse');
    }

    player.on(['loadstart', 'playlistchange'], function (event) {
      _this2.update();
    });

    // Keep track of whether an ad is playing so that the menu
    // appearance can be adapted appropriately
    player.on('adstart', function () {
      _this2.addClass('vjs-ad-playing');
    });
    player.on('adend', function () {
      if (player.ended()) {
        // player.ended() is true because the content is done, but the ended event doesn't
        // trigger until after the postroll is done and the ad implementation has finished
        // its cycle. We don't consider a postroll ad ended until the "ended" event.
        player.one('ended', function () {
          _this2.removeClass('vjs-ad-playing');
        });
      } else {
        _this2.removeClass('vjs-ad-playing');
      }
    });
    return _this2;
  }

  PlaylistMenu.prototype.createEl = function createEl() {
    var settings = this.options_;

    if (settings.el) {
      return settings.el;
    }

    var ol = document_1.createElement('ol');

    ol.className = settings.className;
    settings.el = ol;
    return ol;
  };

  PlaylistMenu.prototype.createPlaylist_ = function createPlaylist_() {
    var playlist = this.player_.playlist() || [];
    var list = this.el_.querySelector('.vjs-playlist-item-list');
    var overlay = this.el_.querySelector('.vjs-playlist-ad-overlay');

    if (!list) {
      list = document_1.createElement('ol');
      list.className = 'vjs-playlist-item-list';
      this.el_.appendChild(list);
    }

    // remove any existing items
    for (var i = 0; i < this.items.length; i++) {
      list.removeChild(this.items[i].el_);
    }
    this.items.length = 0;

    // create new items
    for (var _i = 0; _i < playlist.length; _i++) {
      var item = new PlaylistMenuItem(this.player_, {
        item: playlist[_i]
      }, this.options_);

      this.items.push(item);
      list.appendChild(item.el_);
    }

    // Inject the ad overlay. IE<11 doesn't support "pointer-events:
    // none" so we use this element to block clicks during ad
    // playback.
    if (!overlay) {
      overlay = document_1.createElement('li');
      overlay.className = 'vjs-playlist-ad-overlay';
      list.appendChild(overlay);
    } else {
      // Move overlay to end of list
      list.appendChild(overlay);
    }

    // select the current playlist item
    var selectedIndex = this.player_.playlist.currentItem();

    if (this.items.length && selectedIndex >= 0) {
      addSelectedClass(this.items[selectedIndex]);

      var thumbnail = this.items[selectedIndex].$('.vjs-playlist-thumbnail');

      if (thumbnail) {
        dom.addClass(thumbnail, 'vjs-playlist-now-playing');
      }
    }
  };

  PlaylistMenu.prototype.update = function update() {
    // replace the playlist items being displayed, if necessary
    var playlist = this.player_.playlist();

    if (this.items.length !== playlist.length) {
      // if the menu is currently empty or the state is obviously out
      // of date, rebuild everything.
      this.createPlaylist_();
      return;
    }

    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].item !== playlist[i]) {
        // if any of the playlist items have changed, rebuild the
        // entire playlist
        this.createPlaylist_();
        return;
      }
    }

    // the playlist itself is unchanged so just update the selection
    var currentItem = this.player_.playlist.currentItem();

    for (var _i2 = 0; _i2 < this.items.length; _i2++) {
      var item = this.items[_i2];

      if (_i2 === currentItem) {
        addSelectedClass(item);
        if (document_1.activeElement !== item.el()) {
          dom.addClass(item.thumbnail, 'vjs-playlist-now-playing');
        }
        notUpNext(item);
      } else if (_i2 === currentItem + 1) {
        removeSelectedClass(item);
        upNext(item);
      } else {
        removeSelectedClass(item);
        notUpNext(item);
      }
    }
  };

  return PlaylistMenu;
}(Component);

/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */


var playlistUi = function playlistUi(options) {
  var player = this;
  var settings = void 0;
  var elem = void 0;

  if (!player.playlist) {
    throw new Error('videojs-playlist is required for the playlist component');
  }

  // if the first argument is a DOM element, use it to build the component
  if (typeof window_1.HTMLElement !== 'undefined' && options instanceof window_1.HTMLElement ||
  // IE8 does not define HTMLElement so use a hackier type check
  options && options.nodeType === 1) {
    elem = options;
    settings = videojs.mergeOptions(defaults$$1);
  } else {
    // lookup the elements to use by class name
    settings = videojs.mergeOptions(defaults$$1, options);
    elem = document_1.querySelector('.' + settings.className);
  }

  // build the playlist menu
  settings.el = elem;
  player.playlistMenu = new PlaylistMenu(player, settings);
};

// register components
videojs.registerComponent('PlaylistMenu', PlaylistMenu);
videojs.registerComponent('PlaylistMenuItem', PlaylistMenuItem);

// register the plugin
registerPlugin('playlistUi', playlistUi);

var realIsHtmlSupported = void 0;
var player = void 0;

var playlist = [{
  name: 'Movie 1',
  description: 'Movie 1 description',
  duration: 100,
  sources: [{
    src: '//example.com/movie1.mp4',
    type: 'video/mp4'
  }]
}, {
  sources: [{
    src: '//example.com/movie2.mp4',
    type: 'video/mp4'
  }],
  thumbnail: '//example.com/movie2.jpg'
}];

var resolveUrl = function resolveUrl(url) {
  var a = document_1.createElement('a');

  a.href = url;
  return a.href;
};

var Html5 = videojs.getTech('Html5');

QUnit.test('the environment is sane', function (assert) {
  assert.ok(true, 'everything is swell');
});

function setup() {
  var fixture = document_1.querySelector('#qunit-fixture');

  // force HTML support so the tests run in a reasonable
  // environment under phantomjs
  realIsHtmlSupported = Html5.isSupported;
  Html5.isSupported = function () {
    return true;
  };

  // create a video element
  var video = document_1.createElement('video');

  fixture.appendChild(video);

  // create a video.js player
  player = videojs(video);

  // create a default playlist element
  var elem = document_1.createElement('ol');

  elem.className = 'vjs-playlist';
  fixture.appendChild(elem);
}

function teardown() {
  Html5.isSupported = realIsHtmlSupported;
  player.dispose();
  player = null;
}

QUnit.module('Playlist Plugin', { setup: setup, teardown: teardown });

QUnit.test('registers itself', function (assert) {
  assert.ok(player.playlistUi, 'registered the plugin');
});

QUnit.test('errors if used without the playlist plugin', function (assert) {
  assert.throws(function () {
    player.playlist = null;
    player.playlistUi();
  }, 'threw on init');
});

QUnit.test('is empty if the playlist plugin isn\'t initialized', function (assert) {
  player.playlistUi();

  var items = document_1.querySelectorAll('.vjs-playlist-item');

  assert.ok(document_1.querySelector('.vjs-playlist'), 'created the menu');
  assert.equal(items.length, 0, 'displayed no items');
});

QUnit.test('can be initialized to replace a pre-existing element', function (assert) {
  var parent = document_1.createElement('div');
  var elem = document_1.createElement('ol');

  parent.appendChild(elem);
  player.playlist(playlist);
  player.playlistUi(elem);

  assert.equal(parent.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
});

QUnit.test('can auto-setup elements with the class vjs-playlist', function (assert) {
  var parent = document_1.querySelector('#qunit-fixture');
  var elem = parent.querySelector('.vjs-playlist');

  player.playlist(playlist);
  player.playlistUi();

  var menus = parent.querySelectorAll('.vjs-playlist');

  assert.equal(menus.length, 1, 'created one child node');
  assert.strictEqual(menus[0], elem, 're-used the existing element');
  assert.equal(elem.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
});

QUnit.test('can auto-setup elements with a custom class', function (assert) {
  var elem = document_1.createElement('ol');

  elem.className = 'super-playlist';
  document_1.querySelector('#qunit-fixture').appendChild(elem);

  player.playlist(playlist);
  player.playlistUi({
    className: 'super-playlist'
  });
  assert.equal(elem.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
});

QUnit.test('specializes the class name if touch input is absent', function (assert) {
  var touchEnabled = videojs.browser.TOUCH_ENABLED;

  videojs.browser.TOUCH_ENABLED = videojs.TOUCH_ENABLED = false;

  player.playlist(playlist);
  player.playlistUi();

  assert.ok(player.playlistMenu.hasClass('vjs-mouse'), 'marked the playlist menu');

  videojs.browser.TOUCH_ENABLED = videojs.TOUCH_ENABLED = touchEnabled;
});

QUnit.module('Playlist Component', { setup: setup, teardown: teardown });

// --------------------
// Creation and Updates
// --------------------

QUnit.test('includes the video name if provided', function (assert) {
  player.playlist(playlist);
  player.playlistUi();

  var items = document_1.querySelectorAll('.vjs-playlist-item');

  assert.equal(items[0].querySelector('.vjs-playlist-name').textContent, playlist[0].name, 'wrote the name');
  assert.equal(items[1].querySelector('.vjs-playlist-name').textContent, 'Untitled Video', 'wrote a placeholder for the name');
});

QUnit.test('outputs a <picture> for simple thumbnails', function (assert) {
  player.playlist(playlist);
  player.playlistUi();

  var pictures = document_1.querySelectorAll('.vjs-playlist-item picture');

  assert.equal(pictures.length, 1, 'output one picture');
  var imgs = pictures[0].querySelectorAll('img');

  assert.equal(imgs.length, 1, 'output one img');
  assert.equal(imgs[0].src, window_1.location.protocol + playlist[1].thumbnail, 'set the src attribute');
});

QUnit.test('outputs a <picture> for responsive thumbnails', function (assert) {
  var playlistOverride = [{
    sources: [{
      src: '//example.com/movie.mp4',
      type: 'video/mp4'
    }],
    thumbnail: [{
      srcset: '/test/example/oceans.jpg',
      type: 'image/jpeg',
      media: '(min-width: 400px;)'
    }, {
      src: '/test/example/oceans-low.jpg'
    }]
  }];

  player.playlist(playlistOverride);
  player.playlistUi();

  var sources = document_1.querySelectorAll('.vjs-playlist-item picture source');
  var imgs = document_1.querySelectorAll('.vjs-playlist-item picture img');

  assert.equal(sources.length, 1, 'output one source');
  assert.equal(sources[0].srcset, playlistOverride[0].thumbnail[0].srcset, 'wrote the srcset attribute');
  assert.equal(sources[0].type, playlistOverride[0].thumbnail[0].type, 'wrote the type attribute');
  assert.equal(sources[0].media, playlistOverride[0].thumbnail[0].media, 'wrote the type attribute');
  assert.equal(imgs.length, 1, 'output one img');
  assert.equal(imgs[0].src, resolveUrl(playlistOverride[0].thumbnail[1].src), 'output the img src attribute');
});

QUnit.test('outputs a placeholder for items without thumbnails', function (assert) {
  player.playlist(playlist);
  player.playlistUi();

  var thumbnails = document_1.querySelectorAll('.vjs-playlist-item .vjs-playlist-thumbnail');

  assert.equal(thumbnails.length, playlist.length, 'output two thumbnails');
  assert.equal(thumbnails[0].nodeName.toLowerCase(), 'div', 'the second is a placeholder');
});

QUnit.test('includes the duration if one is provided', function (assert) {
  player.playlist(playlist);
  player.playlistUi();

  var durations = document_1.querySelectorAll('.vjs-playlist-item .vjs-playlist-duration');

  assert.equal(durations.length, 1, 'skipped the item without a duration');
  assert.equal(durations[0].textContent, '1:40', 'wrote the duration');
  assert.equal(durations[0].getAttribute('datetime'), 'PT0H0M' + playlist[0].duration + 'S', 'wrote a machine-readable datetime');
});

QUnit.test('marks the selected playlist item on startup', function (assert) {
  player.playlist(playlist);
  player.currentSrc = function () {
    return playlist[0].sources[0].src;
  };
  player.playlistUi();

  var selectedItems = document_1.querySelectorAll('.vjs-playlist-item.vjs-selected');

  assert.equal(selectedItems.length, 1, 'marked one playlist item');
  assert.equal(selectedItems[0].querySelector('.vjs-playlist-name').textContent, playlist[0].name, 'marked the first playlist item');
});

QUnit.test('updates the selected playlist item on loadstart', function (assert) {
  player.playlist(playlist);
  player.playlistUi();

  player.playlist.currentItem(1);
  player.currentSrc = function () {
    return playlist[1].sources[0].src;
  };
  player.trigger('loadstart');

  var selectedItems = document_1.querySelectorAll('.vjs-playlist-item.vjs-selected');

  assert.equal(document_1.querySelectorAll('.vjs-playlist-item').length, playlist.length, 'displayed the correct number of items');
  assert.equal(selectedItems.length, 1, 'marked one playlist item');
  assert.equal(selectedItems[0].querySelector('img').src, resolveUrl(playlist[1].thumbnail), 'marked the second playlist item');
});

QUnit.test('selects no item if the playlist is not in use', function (assert) {
  player.playlist(playlist);
  player.playlist.currentItem = function () {
    return -1;
  };
  player.playlistUi();

  player.trigger('loadstart');

  assert.equal(document_1.querySelectorAll('.vjs-playlist-item.vjs-selected').length, 0, 'no items selected');
});

QUnit.test('updates on "playlistchange", different lengths', function (assert) {
  player.playlist([]);
  player.playlistUi();

  var items = document_1.querySelectorAll('.vjs-playlist-item');

  assert.equal(items.length, 0, 'no items initially');

  player.playlist(playlist);
  player.trigger('playlistchange');
  items = document_1.querySelectorAll('.vjs-playlist-item');
  assert.equal(items.length, playlist.length, 'updated with the new items');
});

QUnit.test('updates on "playlistchange", equal lengths', function (assert) {
  player.playlist([{ sources: [] }, { sources: [] }]);
  player.playlistUi();

  var items = document_1.querySelectorAll('.vjs-playlist-item');

  assert.equal(items.length, 2, 'two items initially');

  player.playlist(playlist);
  player.trigger('playlistchange');
  items = document_1.querySelectorAll('.vjs-playlist-item');
  assert.equal(items.length, playlist.length, 'updated with the new items');
  assert.equal(player.playlistMenu.items[0].item, playlist[0], 'we have updated items');
  assert.equal(player.playlistMenu.items[1].item, playlist[1], 'we have updated items');
});

QUnit.test('updates on "playlistchange", update selection', function (assert) {
  player.playlist(playlist);
  player.currentSrc = function () {
    return playlist[0].sources[0].src;
  };
  player.playlistUi();

  var items = document_1.querySelectorAll('.vjs-playlist-item');

  assert.equal(items.length, 2, 'two items initially');

  assert.ok(/vjs-selected/.test(items[0].getAttribute('class')), 'first item is selected by default');
  player.playlist.currentItem(1);
  player.currentSrc = function () {
    return playlist[1].sources[0].src;
  };

  player.trigger('playlistchange');
  items = document_1.querySelectorAll('.vjs-playlist-item');
  assert.equal(items.length, playlist.length, 'updated with the new items');
  assert.ok(/vjs-selected/.test(items[1].getAttribute('class')), 'second item is selected after update');
  assert.ok(!/vjs-selected/.test(items[0].getAttribute('class')), 'first item is not selected after update');
});

QUnit.test('tracks when an ad is playing', function (assert) {
  player.playlist([]);
  player.playlistUi();

  player.duration = function () {
    return 5;
  };

  var playlistMenu = player.playlistMenu;

  assert.ok(!playlistMenu.hasClass('vjs-ad-playing'), 'does not have class vjs-ad-playing');
  player.trigger('adstart');
  assert.ok(playlistMenu.hasClass('vjs-ad-playing'), 'has class vjs-ad-playing');

  player.trigger('adend');
  assert.ok(!playlistMenu.hasClass('vjs-ad-playing'), 'does not have class vjs-ad-playing');
});

// -----------
// Interaction
// -----------

QUnit.test('changes the selection when tapped', function (assert) {
  var playCalled = false;

  player.playlist(playlist);
  player.playlistUi({ playOnSelect: true });
  player.play = function () {
    playCalled = true;
  };

  var sources = void 0;

  player.src = function (src) {
    if (src) {
      sources = src;
    }
    return sources[0];
  };
  player.currentSrc = function () {
    return sources[0].src;
  };
  player.playlistMenu.items[1].trigger('tap');
  // trigger a loadstart synchronously to simplify the test
  player.trigger('loadstart');

  assert.ok(player.playlistMenu.items[1].hasClass('vjs-selected'), 'selected the new item');
  assert.ok(!player.playlistMenu.items[0].hasClass('vjs-selected'), 'deselected the old item');
  assert.equal(playCalled, true, 'play gets called if option is set');
});

QUnit.test('play should not get called by default upon selection of menu items ', function (assert) {
  var playCalled = false;

  player.playlist(playlist);
  player.playlistUi();
  player.play = function () {
    playCalled = true;
  };

  var sources = void 0;

  player.src = function (src) {
    if (src) {
      sources = src;
    }
    return sources[0];
  };
  player.currentSrc = function () {
    return sources[0].src;
  };
  player.playlistMenu.items[1].trigger('tap');
  // trigger a loadstart synchronously to simplify the test
  player.trigger('loadstart');
  assert.equal(playCalled, false, 'play should not get called by default');
});

}(QUnit,videojs));
