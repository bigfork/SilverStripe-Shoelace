/**
 * GA link handler
 * Stan Hutcheon - Bigfork Ltd.
 */
(function(d) {

	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'];

	$('a').each(function() {
		var self = this, pathname = this.pathname || '';

		if( !(pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && this.host === window.location.host ) return;

		$.each({'action': 'Clicked', 'label': (pathname.replace(/(.*\/)+/,'') || this.innerHTML), 'value': document.title}, function(attr, val) {
			$(self).attr('data-track', 'link').data(attr, val);
		});
	});

	$(d).on('click', 'a[data-track]', function() {
		var $this = $(this);
		ga('send', 'event', 'Link', $this.data('action'), $this.data('value'), 1);
	});

})(document);

/**
 * Vanilla GA link handler
 * Stan Hutcheon - Bigfork Ltd.
 */

/*
(function(d) {

	// regex
	var extensions = ['pdf', 'docx?', 'xlsx?', 'pp(t|s)x?', 'csv', 'rtf'],
		a = d.querySelectorAll('a');

	for(var i = 0; i < a.length; i++) {
		var self = a[i], pathname = self.pathname || '',
		attrs = {'action': 'Clicked', 'label': (pathname.replace(/(.*\/)+/,'') || self.innerHTML), 'value': d.title};

		if( !(pathname.match(new RegExp('\.(' + extensions.join('|') + ')$', 'i'))) && self.host === window.location.host ) continue;

		for(var p in attrs) {if(attrs.hasOwnProperty(p)) {
			self.setAttribute('data-' + p, attrs[p]);
		}}
	}

})(document);
*/
