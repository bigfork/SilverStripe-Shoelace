<!DOCTYPE html>
<!--[if lte IE 7]>		<html lang="{$ContentLocale}" class="nojs lte-ie9 lte-ie8 lte-ie7"> <![endif]-->
<!--[if lte IE 8]>		<html lang="{$ContentLocale}" class="nojs lte-ie9 lte-ie8"> <![endif]-->
<!--[if IE 9]>			<html lang="{$ContentLocale}" class="nojs lte-ie9"> <![endif]-->
<!--[if gt IE 9]><!-->	<html lang="{$ContentLocale}" class="nojs"> <!--<![endif]-->
<head>
	<% base_tag %>
	<title><% if MetaTitle %>$MetaTitle.XML<% else %>$Title.XML &raquo; $SiteConfig.Title<% end_if %></title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	$MetaTags(false)

	<link href="//www.google-analytics.com" rel="dns-prefetch" />
    <link href="//ajax.googleapis.com" rel="dns-prefetch" />

	<link rel="shortcut icon" href="{$BaseURL}favicon.ico" />

	<!--[if lte IE 8]><link rel="stylesheet" type="text/css" href="{$ThemeDir}/css/ie8.css" /><![endif]-->
	<!--[if gt IE 8]><!--><link rel="stylesheet" type="text/css" href="{$ThemeDir}/css/style.css" /><!--<![endif]-->

	<!--[if lte IE 8]><script type="text/javascript" src="{$ThemeDir}/js/modernizr.min.js"></script><![endif]-->

	<script type="text/javascript">
	(function(H){H.className=H.className.replace(/\\bnojs\\b/,'')})(document.documentElement)
	</script>
</head>
<body class="{$ClassName.LowerCase}">

<% include Nav %>

$Layout

<% include Footer %>

</body>
</html>
