/**
 * GA link handler
 * Stan Hutcheon - Bigfork Ltd.
 */
(function(d) {

	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'];

	$('a[href]').each(function() {
		var self = this, pathname = this.pathname || '',
		type = !this.protocol.match(/^mail/) ? 'Link' : 'Email';

		if(type == 'Link' && !(pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && this.host === window.location.host) return;

		$.each({action: 'Clicked', label: (pathname.replace(/(.*\/)+/,'') || this.innerHTML), value: d.title}, function(attr, val) {
			$(self).attr('data-track', type).data(attr, val);
		});
	});

	$(d).on('click', 'a[data-track]', function() {
		var $this = $(this);
		(typeof ga !== 'undefined') && ga('send', 'event', $this.data('track'), $this.data('action'), $this.data('value'), 1);
	});

})(document);

/**
 * Vanilla GA link handler
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
