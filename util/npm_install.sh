#!/bin/bash

function is_installed {
	local ok_=1
	type $1 >/dev/null 2>&1 || { local ok_=0; }

	if [[ $ok_ == 1 ]]; then
		$2
	else
		echo "$1 not available"
	fi
}

echo $(is_installed npm "npm install")
