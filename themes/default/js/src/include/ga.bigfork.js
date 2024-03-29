/**
 * GA link handler for analytics.js
 */
(function(d) {
	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'];

	$('a').each(function() {
		if ($(this).data('track')) return false;

		var self = this, pathname = this.pathname || '';

		// only track external links or links with approved extensions
		if( ! (pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && this.host === window.location.host) return;

		// action is destination file or url, value is current page url
		$.each({'event': 'Link Clicked', 'action': (pathname.replace(/(.*\/)+/,'') || this.innerHTML), 'value': window.location.pathname}, function(attr, val) {
			$(self).attr('data-track', 'link').attr('data-' + attr, val);
		});
	});

	// track email links separately
	$('a[href^=mailto]').each(function(){

		var $self = $(this),
			trk = $self.attr('data-track');

		// override default link click behaviour unless a custom data-track value was assigned
		if ( ! trk || trk == 'link') {
			var address = $self.attr('href');
			address = address.replace(/mailto:/, '');
			$.trim(address);

			$self.attr('data-event', 'Email Link');
			$self.attr('data-action', address);
		}
	});

	$(d).on('click', 'a[data-track]', function() {
		if (!window.ga) {
			return;
		}

		var $this = $(this);

		if ($this.data('event') == 'Email Link') {
			ga('send', 'event', {
				eventCategory: $this.data('event'),
				eventAction: $this.data('action'),
				eventLabel: $this.data('value'),
				eventValue: 1
			});
		} else {
			ga('send', 'event', {
			    eventCategory: $this.data('event'),
			    eventAction: $this.data('action'),
			    eventLabel: $this.data('value'),
			    eventValue: 1,
			    transport: 'beacon'
			});
		}
	});
})(document);
