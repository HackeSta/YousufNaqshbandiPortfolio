/*
	Lens by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

var main = (function($) {
	var _ = {



	/**
	 * Settings.
	 * @var {object}
	 */
	settings: {

		// Preload all images.
			preload: false,

		// Slide duration (must match "duration.slide" in _vars.scss).
			slideDuration: 500,

		// Layout duration (must match "duration.layout" in _vars.scss).
			layoutDuration: 750,

		// Thumbnails per "row" (must match "misc.thumbnails-per-row" in _vars.scss).
			thumbnailsPerRow: 2,

		// Side of main wrapper (must match "misc.main-side" in _vars.scss).
			mainSide: 'right'

	},

	/**
	 * Window.
	 * @var {jQuery}
	 */
	$window: null,

	/**
	 * Body.
	 * @var {jQuery}
	 */
	$body: null,

	/**
	 * Main wrapper.
	 * @var {jQuery}
	 */
	$main: null,

	/**
	 * Thumbnails.
	 * @var {jQuery}
	 */
	$thumbnails: null,

	/**
	 * Viewer.
	 * @var {jQuery}
	 */
	$viewer: null,

	/**
	 * Toggle.
	 * @var {jQuery}
	 */
	$toggle: null,

	/**
	 * Nav (next).
	 * @var {jQuery}
	 */
	$navNext: null,

	/**
	 * Nav (previous).
	 * @var {jQuery}
	 */
	$navPrevious: null,
	/**
	 * Exif .
	 * @var {jQuery}
	 */
	$exif: null,
	/**
	 * Slides.
	 * @var {array}
	 */
	slides: [],

	/**
	 * Current slide index.
	 * @var {integer}
	 */
	current: null,

	/**
	 * Lock state.
	 * @var {bool}
	 */
	locked: false,

	/**
	 * Keyboard shortcuts.
	 * @var {object}
	 */
	keys: {

		// Escape: Toggle main wrapper.
			27: function() {
				_.toggle();
			},

		// Up: Move up.
			38: function() {
				_.up();
			},

		// Down: Move down.
			40: function() {
				_.down();
			},

		// Space: Next.
			32: function() {
				_.next();
			},

		// Right Arrow: Next.
			39: function() {
				_.next();
			},

		// Left Arrow: Previous.
			37: function() {
				_.previous();
			}

	},

	/**
	 * Initialize properties.
	 */
	initProperties: function() {

		// Window, body.
			_.$window = $(window);
			_.$body = $('body');

		// Thumbnails.
			_.$thumbnails = $('#thumbnails');

		//exif
		_.$exif = $('#modal');
		// Viewer.
			_.$viewer = $(
				'<div id="viewer">' +
					'<div class="inner remodal-bg">' +
						'<div class="nav-next"></div>' +
						'<div class="nav-previous"></div>' +
						'<div class="toggle"></div>' +
					'</div>' +
				'</div>'
			).appendTo(_.$body);

		// Nav.
			_.$navNext = _.$viewer.find('.nav-next');
			_.$navPrevious = _.$viewer.find('.nav-previous');

		// Main wrapper.
			_.$main = $('#main');

		// Toggle.
			$('<div class="toggle"></div>')
				.appendTo(_.$main);

			_.$toggle = $('.toggle');

		// IE<9: Fix viewer width (no calc support).
			if (skel.vars.IEVersion < 9)
				_.$window
					.on('resize', function() {
						window.setTimeout(function() {
							_.$viewer.css('width', _.$window.width() - _.$main.width());
						}, 100);
					})
					.trigger('resize');

	},

	/**
	 * Initialize events.
	 */
	initEvents: function() {

		// Window.
		console.log('onload');
		_.$body.removeClass('is-loading-0');

		window.setTimeout(function() {
		_.$body.removeClass('is-loading-1');
		}, 100);

		window.setTimeout(function() {
		_.$body.removeClass('is-loading-2');
		}, 100 + Math.max(_.settings.layoutDuration - 150, 0));
			// Remove is-loading-* classes on load.
				_.$window.on('load', function() {


				});

			// Disable animations/transitions on resize.
				var resizeTimeout;

				_.$window.on('resize', function() {

					_.$body.addClass('is-loading-0');
					window.clearTimeout(resizeTimeout);

					resizeTimeout = window.setTimeout(function() {
						_.$body.removeClass('is-loading-0');
					}, 100);

				});

		// Viewer.

			// Hide main wrapper on tap (<= medium only).
				_.$viewer.on('touchend', function() {

					if (skel.breakpoint('medium').active)
						_.hide();

				});

			// Touch gestures.
				_.$viewer
					.on('touchstart', function(event) {

						// Record start position.
							_.$viewer.touchPosX = event.originalEvent.touches[0].pageX;
							_.$viewer.touchPosY = event.originalEvent.touches[0].pageY;

					})
					.on('touchmove', function(event) {

						// No start position recorded? Bail.
							if (_.$viewer.touchPosX === null
							||	_.$viewer.touchPosY === null)
								return;

						// Calculate stuff.
							var	diffX = _.$viewer.touchPosX - event.originalEvent.touches[0].pageX,
								diffY = _.$viewer.touchPosY - event.originalEvent.touches[0].pageY;
								boundary = 20,
								delta = 50;

						// Swipe left (next).
							if ( (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta) )
								_.next();

						// Swipe right (previous).
							else if ( (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta)) )
								_.previous();

						// Overscroll fix.
							var	th = _.$viewer.outerHeight(),
								ts = (_.$viewer.get(0).scrollHeight - _.$viewer.scrollTop());

							if ((_.$viewer.scrollTop() <= 0 && diffY < 0)
							|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

								event.preventDefault();
								event.stopPropagation();

							}

					});

		// Main.

			// Touch gestures.
				_.$main
					.on('touchstart', function(event) {

						// Bail on xsmall.
							if (skel.breakpoint('xsmall').active)
								return;

						// Record start position.
							_.$main.touchPosX = event.originalEvent.touches[0].pageX;
							_.$main.touchPosY = event.originalEvent.touches[0].pageY;

					})
					.on('touchmove', function(event) {

						// Bail on xsmall.
							if (skel.breakpoint('xsmall').active)
								return;

						// No start position recorded? Bail.
							if (_.$main.touchPosX === null
							||	_.$main.touchPosY === null)
								return;

						// Calculate stuff.
							var	diffX = _.$main.touchPosX - event.originalEvent.touches[0].pageX,
								diffY = _.$main.touchPosY - event.originalEvent.touches[0].pageY;
								boundary = 20,
								delta = 50,
								result = false;

						// Swipe to close.
							switch (_.settings.mainSide) {

								case 'left':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
									break;

								case 'right':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
									break;

								default:
									break;

							}

							if (result)
								_.hide();

						// Overscroll fix.
							var	th = _.$main.outerHeight(),
								ts = (_.$main.get(0).scrollHeight - _.$main.scrollTop());

							if ((_.$main.scrollTop() <= 0 && diffY < 0)
							|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

								event.preventDefault();
								event.stopPropagation();

							}

					});
		// Toggle.
			_.$toggle.on('click', function() {
				_.toggle();
			});

			// Prevent event from bubbling up to "hide event on tap" event.
				_.$toggle.on('touchend', function(event) {
					event.stopPropagation();
				});

		// Nav.
			_.$navNext.on('click', function() {
				_.next();
			});

			_.$navPrevious.on('click', function() {
				_.previous();
			});

		// Keyboard shortcuts.

			// Ignore shortcuts within form elements.
				_.$body.on('keydown', 'input,select,textarea', function(event) {
					event.stopPropagation();
				});

			_.$window.on('keydown', function(event) {

				// Ignore if xsmall is active.
					if (skel.breakpoint('xsmall').active)
						return;

				// Check keycode.
					if (event.keyCode in _.keys) {

						// Stop other events.
							event.stopPropagation();
							event.preventDefault();

						// Call shortcut.
							(_.keys[event.keyCode])();

					}

			});

	},

	/**
	 * Initialize viewer.
	 */
	initViewer: function() {

		// Bind thumbnail click event.
			_.$thumbnails
				.on('click', '.thumbnail', function(event) {

					var $this = $(this);

					// Stop other events.
						event.preventDefault();
						event.stopPropagation();

					// Locked? Blur.
						if (_.locked)
							$this.blur();

					// Switch to this thumbnail's slide.
						_.switchTo($this.data('index'));

				});

		// Create slides from thumbnails.
			_.$thumbnails.children()
				.each(function() {

					var	$this = $(this),
						$thumbnail = $this.children('.thumbnail'),
						s;

					// Slide object.
						s = {
							$parent: $this,
							$slide: null,
							$slideImage: null,
							$slideCaption: null,
							$slideOpen: null,
							$slideInfo: null,
							$slide_exif_resolution: null,
							$slide_exif_camera: null,
							$slide_exif_lens: null,
							$slide_exif_focal_length: null,
							$slide_exif_iso: null,
							$slide_exif_shutter_speed: null,
							$slide_exif_aperture: null,
							url: $thumbnail.attr('href'),
							urlB: $thumbnail.attr('500url'),
							exif: null,
							loaded: false
						};

					// Parent.
						$this.attr('tabIndex', '-1');
						s.exif = {
							height: $thumbnail.attr('exif_height'),
							width: $thumbnail.attr('exif_width'),
							camera: $thumbnail.attr('exif_camera'),
							lens: $thumbnail.attr('exif_lens'),
							focal_length: $thumbnail.attr('exif_focal_length'),
							shutter_speed: $thumbnail.attr('exif_shutter_speed'),
							iso: $thumbnail.attr('exif_iso'),
							aperture: $thumbnail.attr('exif_aperture'),
						}

					// Slide.

						// Create elements.
	 						s.$slide = $('<div class="slide"><div class="open500"></div><div class="openExif"></div><div class="caption"></div><div class="image"></div></div>');

	 					// Image.
 							s.$slideImage = s.$slide.children('.image');

 							// Set background stuff.
	 							s.$slideImage
		 							.css('background-image', '')
		 							.css('background-position', ($thumbnail.data('position') || 'center'));

						// Caption.
							s.$slideCaption = s.$slide.find('.caption');
							s.$slideOpen = s.$slide.find('.open500');
							s.$slideInfo = s.$slide.find('.openExif');
							// Move everything *except* the thumbnail itself to the caption.
								$this.children().not($thumbnail)
									.appendTo(s.$slideCaption);
								s.$slideOpen.append('<a href="' + s.urlB + '" target="_blank" class="icon fa-500px"></a>');
								s.$slideInfo.append('<a href="#modal" class="icon fa-info"></a>');

					// Preload?
						if (_.settings.preload) {

							// Force image to download.
								var $img = $('<img src="' + s.url + '" />');

							// Set slide's background image to it.
								s.$slideImage
									.css('background-image', 'url(' + s.url + ')');

							// Mark slide as loaded.
								s.$slide.addClass('loaded');
								s.loaded = true;

						}

					// Add to slides array.
						_.slides.push(s);

					// Set thumbnail's index.
						$thumbnail.data('index', _.slides.length - 1);

				});

	},

	/**
	 * Initialize stuff.
	 */
	init: function() {

		console.log('called');

		// IE<10: Zero out transition delays.
			if (skel.vars.IEVersion < 10) {

				_.settings.slideDuration = 0;
				_.settings.layoutDuration = 0;

			}

		// Skel.
			skel.breakpoints({
				xlarge: '(max-width: 1680px)',
				large: '(max-width: 1280px)',
				medium: '(max-width: 980px)',
				small: '(max-width: 736px)',
				xsmall: '(max-width: 480px)'
			});

		// Everything else.
			_.initProperties();
			_.initViewer();
			_.initEvents();

		// Initial slide.
			window.setTimeout(function() {

				// Show first slide if xsmall isn't active or it just deactivated.
					skel.on('-xsmall !xsmall', function() {

						if (_.current === null)
							_.switchTo(0, true);

					});

			}, 0);

	},

	/**
	 * Switch to a specific slide.
	 * @param {integer} index Index.
	 */
	switchTo: function(index, noHide) {

		// Already at index and xsmall isn't active? Bail.
			if (_.current == index
			&&	!skel.breakpoint('xsmall').active)
				return;

		// Locked? Bail.
			if (_.locked)
				return;

		// Lock.
			_.locked = true;

		// Hide main wrapper if medium is active.
			if (!noHide
			&&	skel.breakpoint('medium').active
			&&	skel.vars.IEVersion > 8)
				_.hide();

		// Get slides.
			var	oldSlide = (_.current !== null ? _.slides[_.current] : null);
			 var newSlide = _.slides[index];
		// Update current.
			_.current = index;

		// Deactivate old slide (if there is one).
			if (oldSlide) {

				// Thumbnail.
					oldSlide.$parent
						.removeClass('active');

				// Slide.
					oldSlide.$slide.removeClass('active');

			}

		// Activate new slide.

			// Thumbnail.
				newSlide.$parent
					.addClass('active')
					.focus();

			// Slide.
				var f = function() {

					// Old slide exists? Detach it.
						if (oldSlide)
							oldSlide.$slide.detach();

					// Attach new slide.
						newSlide.$slide.appendTo(_.$viewer);

					// New slide not yet loaded?
						if (!newSlide.loaded) {

							window.setTimeout(function() {

								// Mark as loading.
									newSlide.$slide.addClass('loading');

								// Wait for it to load.
									$('<img src="' + newSlide.url + '" />').on('load', function() {
									//window.setTimeout(function() {

										// Set background image.
											newSlide.$slideImage
												.css('background-image', 'url(' + newSlide.url + ')');


										// Mark as loaded.
											newSlide.loaded = true;
											newSlide.$slide.removeClass('loading');

										// Mark as active.
											newSlide.$slide.addClass('active');
											_.clearExif();
											_.showExif(newSlide.exif);
										// Unlock.
											window.setTimeout(function() {
												_.locked = false;
											}, 100);

									//}, 1000);
									});

							}, 100);

						}

					// Otherwise ...
						else {

							window.setTimeout(function() {

								// Mark as active.
									newSlide.$slide.addClass('active');

								// Unlock.
									window.setTimeout(function() {
										_.locked = false;
									}, 100);

							}, 100);

						}

				};

				// No old slide? Switch immediately.
					if (!oldSlide)
						(f)();

				// Otherwise, wait for old slide to disappear first.
					else
						window.setTimeout(f, _.settings.slideDuration);

	},

	/**
	 * Switches to the next slide.
	 */
	next: function() {

		// Calculate new index.
			var i, c = _.current, l = _.slides.length;

			if (c >= l - 1)
				i = 0;
			else
				i = c + 1;

		// Switch.
			_.switchTo(i);

	},

	/**
	 * Switches to the previous slide.
	 */
	previous: function() {

		// Calculate new index.
			var i, c = _.current, l = _.slides.length;

			if (c <= 0)
				i = l - 1;
			else
				i = c - 1;

		// Switch.
			_.switchTo(i);

	},

	/**
	 * Switches to slide "above" current.
	 */
	up: function() {

		// Fullscreen? Bail.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Calculate new index.
			var i, c = _.current, l = _.slides.length, tpr = _.settings.thumbnailsPerRow;

			if (c <= (tpr - 1))
				i = l - (tpr - 1 - c) - 1;
			else
				i = c - tpr;

		// Switch.
			_.switchTo(i);

	},

	/**
	 * Switches to slide "below" current.
	 */
	down: function() {

		// Fullscreen? Bail.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Calculate new index.
			var i, c = _.current, l = _.slides.length, tpr = _.settings.thumbnailsPerRow;

			if (c >= l - tpr)
				i = c - l + tpr;
			else
				i = c + tpr;

		// Switch.
			_.switchTo(i);

	},

	/**
	 * Shows the main wrapper.
	 */
	show: function() {

		// Already visible? Bail.
			if (!_.$body.hasClass('fullscreen'))
				return;

		// Show main wrapper.
			_.$body.removeClass('fullscreen');

		// Focus.
			_.$main.focus();

	},

	/**
	 * Hides the main wrapper.
	 */
	hide: function() {

		// Already hidden? Bail.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Hide main wrapper.
			_.$body.addClass('fullscreen');

		// Blur.
			_.$main.blur();

	},

	/**
	 * Toggles main wrapper.
	 */
	toggle: function() {

		if (_.$body.hasClass('fullscreen'))
			_.show();
		else
			_.hide();

	},

	clearExif: function(){
		$("#exif_resolution").empty();
		$("#exif_camera").empty();
		$("#exif_lens").empty();
		$("#exif_focal_length").empty();
		$("#exif_iso").empty();
		$("#exif_shutter_speed").empty();
		$("#exif_aperture").empty();
	},

	showExif: function(exif){
		$("#exif_resolution").append("Resolution: " + exif.width + "x" + exif.height);
		$("#exif_camera").append("Camera: " +exif.camera);
		$("#exif_lens").append("Lens: "+ exif.lens);
		$("#exif_focal_length").append("Focal Length: "+ exif.focal_length);
		$("#exif_iso").append("ISO: " +exif.iso);
		$("#exif_shutter_speed").append("Shutter Speed: "+ exif.shutter_speed);
		$("#exif_aperture").append("Aperture: " +exif.aperture);

	},
	loadPhotos: function(){
	  $.ajax({
	    url: 'http://hackesta.pythonanywhere.com/photographs/?format=json&user_id=8725773',
	    type: 'GET',
	    crossDomain: true,
	    dataType: 'json',
	    success: function(json) {
	      $(json.photos).each(function(index) {
	        console.log(index);
	        console.log(this);
	        $("#thumbnails").append("<article><a class=\"thumbnail\" href=\"" +this.images[1].url +"\"500url=\"https://500px.com"+this.url +"\" exif_height=\""+this.height+"\" exif_width=\""+this.width+"\" exif_camera=\""+this.camera+"\" exif_lens=\""+this.lens+"\" exif_focal_length=\""+this.focal_length+"\" exif_shutter_speed=\""+this.shutter_speed+"\" exif_iso=\""+this.iso+"\" exif_aperture=\""+this.aperture+"\"><img src=\""+this.images[0].url+"\" alt=\""+this.name+"\" /></a><h2>"+this.name+"</h2></article>");

	      });
				main.init();
	    }
	  });
	}

}; return _; })(jQuery);

main.loadPhotos();
