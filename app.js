// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// http://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

// Thanks MDN
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_.231_.E2.80.93_escaping_the_string_before_encoding_it
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function expandMacros(s) {
	
	// Class Macro: expands attributes - .name[attributes to expand]
	// Usage: node[.classA .classB normalAtt="value"]
	var classRegEx = /\!\W*\.(\w+)\[([\w=\" ]+)\]/;
		
	var lines = s.split('\n');
	var result = [];
	
	var nonMacros = [];
	var classMacros = {};	
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		
		var matches = classRegEx.exec(line);
		if(matches) {
			var className = matches[1];
			var attributes = matches[2];
			
			classMacros[className] = attributes;
		} else {
			nonMacros.push(line);
		}
	}

	for (var i = 0; i < nonMacros.length; i++) {
		var line = nonMacros[i];
		
		for(var p in classMacros) {
			if(line.indexOf("." + p) > 0) {
				var a = line.split("." + p);
				line = a[0] + classMacros[p] + a[1];
			}
		}
		
		result.push(line);
	}
	
	return result.join('\n');
}

var APIHOST = 'http://handyapi.local';

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

$(document).ready(function($) {
	if(urlParams.mode && urlParams.gb64) {
		var c = document.getElementById('canvas');
		canvg(c, Viz(expandMacros(atob(urlParams.gb64)), 'svg'));
		
		var dataUrl = c.toDataURL('image/png');
		
		document.write('<img src="' + dataUrl + '" />');
		
		return;
	}
	
	var $graph = $('#js-graph');
	
	var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/text");
	
	// Load local storage value, allow querystring graph to override, then render
	editor.setValue(window.localStorage.getItem("dot"));
	if(urlParams.gb64) {
		editor.setValue(atob(urlParams.gb64));
	}
	renderGraph();
	
	function getGraphExpanded() {
		return expandMacros(getGraphRaw());
	}
	
	function getGraphRaw() {
		return editor.getValue();
	}
	
	function renderGraph() {
		$graph.html(Viz(getGraphExpanded(), 'svg'));
	}
	
	function saveGraph() {
		// Save pre-expanded values
		window.localStorage.setItem("dot", getGraphRaw());
	}
	
	editor.on('change', debounce(function() {
		saveGraph();
		renderGraph();
	}, 200));
	
	$('#js-createlink').on('click', function() {
		var graphB46 = encodeURIComponent(b64EncodeUnicode(getGraphRaw()));
		
		var url = window.location.href + '?gb64=' + graphB46;
		
		window.open(url, '_blank');
	});
	
	$('#js-createPng').on('click', function () {
		var c = document.getElementById('canvas');
		canvg(c, $graph.html());
		
		var dataUrl = c.toDataURL('image/png');
		
		var w = window.open('', '_blank');
		w.document.body.innerHTML = '<img src="' + dataUrl + '" />';
	});
	
	$('#js-modePng').on('click', function() {
		var graphB46 = encodeURIComponent(b64EncodeUnicode(getGraphRaw()));
		
		var url = window.location.href + '?mode=png&gb64=' + graphB46;
		
		window.open(url, '_blank');
	});
});