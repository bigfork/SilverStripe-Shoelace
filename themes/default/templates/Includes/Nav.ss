<header>
	<nav>
		<ul>
			<% loop Menu(1) %>
				<li class="{$LinkingMode} n{$Pos}">
					<a href="{$Link}">$MenuTitle.XML</a>
					<% if Children %>
						<ul>
							<% loop Children %>
								<li><a href="{$Link}">$MenuTitle.XML</a></li>
							<% end_loop %>
						</ul>
					<% end_if %>
				</li>
			<% end_loop %>
		</ul>
	</nav>
</header>
