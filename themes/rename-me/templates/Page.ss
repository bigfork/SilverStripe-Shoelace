<!DOCTYPE html>
<!--[if lte IE 7]>		<html lang="$ContentLocale" class="nojs lte-ie9 lte-ie8 lte-ie7"> <![endif]-->
<!--[if lte IE 8]>		<html lang="$ContentLocale" class="nojs lte-ie9 lte-ie8"> <![endif]-->
<!--[if IE 9]>			<html lang="$ContentLocale" class="nojs lte-ie9"> <![endif]-->
<!--[if gt IE 9]><!-->	<html lang="$ContentLocale" class="nojs"> <!--<![endif]-->
<head>
	<% base_tag %>
	<title><% if MetaTitle %>$MetaTitle.XML<% else %>$Title.XML<% end_if %> &raquo; $SiteConfig.Title</title>
	<meta charset="utf-8" />
	<% if MetaDescription %><meta name="description" content="$MetaDescription" /><% end_if %>
	$MetaTags(false)
	<% require themedCSS(style) %>
	<link rel="shortcut icon" href="{$BaseURL}favicon.ico" />
	<!--[if lt IE 9]><script type="text/javascript" src="$ThemeDir/js/modernizr.min.js"></script><![endif]-->
</head>
<body class="$ClassName">

<% include Nav %>

$Layout

<% include Footer %>

</body>
</html>