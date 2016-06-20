/**
 * GA link handler
 * Stan Hutcheon - Bigfork Ltd.
 */
(function(d) {

	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'];

	$('a').each(function() {
		if ($(this).data('track')) return false;

		var self = this, pathname = this.pathname || '';
		if( !(pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && this.host === window.location.host ) return;

		$.each({'event': 'Link', 'action': 'Clicked', 'label': (pathname.replace(/(.*\/)+/,'') || this.innerHTML), 'value': window.location.pathname}, function(attr, val) {
			$(self).attr('data-track', 'link').data(attr, val);
		});
	});

	$('a[href^=mailto]').each(function(){
		var $self = $(this);

		var address = $self.attr('href');
		address = address.replace(/mailto:/, '');
		$.trim(address);

		$self.data('event', 'Email Link');
		$self.data('action', address);
	});

	$(d).on('click', 'a[data-track]', function() {
		var $this = $(this);
		ga('send', 'event', $this.data('event'), $this.data('action'), $this.data('value'), 1);
	});

})(document);

/**
 * Vanilla GA link handler - does not include emails
 * Stan Hutcheon - Bigfork Ltd.
 */

/*
(function(d) {

	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'];

	for(var a = d.querySelectorAll('a[href]'), i = 0; i < a.length; i++) {
		var self = a[i], pathname = self.pathname || '',
		type = !self.protocol.match(/^mail/) ? 'Link' : 'Email',
		attrs = {track: type, action: 'Clicked', label: (pathname.replace(/(.*\/)+/,'') || self.innerHTML), value: d.title};

		if(type == 'Link' && !(pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && self.host === window.location.host) continue;

		for(var p in attrs) {if(attrs.hasOwnProperty(p)) {
			self.setAttribute('data-' + p, attrs[p]);
		}}
	}

})(document);
*/
