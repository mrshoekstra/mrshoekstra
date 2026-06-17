<?php
$uri = substr($_SERVER['REQUEST_URI'] ?? '', strlen(dirname($_SERVER['PHP_SELF'] ?? '') . '/'));
$uriParts = explode('/', $uri);
$items = array_chunk($uriParts, 2);
$fallbackFill = count($uriParts) > 1
	? '#7f7f7f'
	: 'url(#gradient)';
$tspan = [];

foreach ($items as $key => $item)
{
	$text = preg_replace('/[^\x{20}-\x{7e}\x{80}-\x{24f}]+/u', '', urldecode($item[0]));

	if ($text === '')
	{
		continue;
	}

	$fill = 1 === preg_match('/^(?:[0-9a-f]{3}){1,2}$/i', $item[1] ?? null, $match)
		? '#' . strtolower($match[0])
		: $fallbackFill;

	$tspan[] = '<tspan fill="' . $fill . '" dx="0">' . $text . '</tspan>';
}

$gradient = '
	<defs>
		<linearGradient id="gradient" x1="0" x2="1" y1=".5" y2=".5">
			<stop offset="0" stop-color="#f08"/>
			<stop offset="1" stop-color="#37f"/>
		</linearGradient>
	</defs>
';
$output = '
	<!-- Marc Hoekstra - url-svg -->
	<svg xmlns="http://www.w3.org/2000/svg" height="2em" width="100%">
	<style>
		@import url(\'https://fonts.googleapis.com/css2?family=Oswald:wght@200&amp;display=block\');

		text {
			font-family: Oswald, Arial, Helvetica, sans-serif;
			font-size: 2em;
			font-weight: 200;
			text-transform: uppercase;
		}

		tspan {
			alignment-baseline: central;
		}
	</style>
	' . (count($uriParts) > 1 ? '' : $gradient) . '
	<text y="50%">
		' . implode($tspan) . '
	</text>
	</svg>
';

header('content-type:image/svg+xml');
echo preg_replace('/[\r\n]+/', '', preg_replace('/^\s+|\s+$/m', '', $output));
