/**
 * GA link handler
 */
(function(d) {

	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'];

	$('a').each(function() {
		if ($(this).data('track')) return false;

		var self = this, pathname = this.pathname || '';

		// only track external links or links with approved extensions
		if( ! (pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && this.host === window.location.host ) return;

		$.each({'event': 'Link', 'action': 'Clicked', 'label': (pathname.replace(/(.*\/)+/,'') || this.innerHTML), 'value': window.location.pathname}, function(attr, val) {
			$(self).attr('data-track', 'link').attr('data-' + attr, val);
		}); 
	});

	// track email links separately
	$('a[href^=mailto]').each(function(){
		var $self = $(this);

		var address = $self.attr('href');
		address = address.replace(/mailto:/, '');
		$.trim(address);

		$self.attr('data-event', 'Email Link');
		$self.attr('data-action', address);
	});

	$(d).on('click', 'a[data-track]', function() {
		var $this = $(this);
		ga('send', 'event', $this.data('event'), $this.data('action'), $this.data('value'), 1);
	});

})(document);
