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

function expandMacros(s) {
	// capture class: .name[attributes to expand]
	var classRegEx = /\!\W*\.(\w+)\[([\w=\"]+)\]/;
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

	console.log(classMacros);

	for (var i = 0; i < nonMacros.length; i++) {
		var line = nonMacros[i];
		
		for(var p in classMacros) {
			if(line.indexOf("." + p) > 0) {
				var a = line.split("." + p);
				line = a[0] + classMacros[p] + a[1];
				
				console.log(line);
			}
		}
		
		result.push(line);
	}
	
	return result.join('\n');
}

$(document).ready(function($) {
	var $graph = $('#js-graph');
	
	var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/text");
	
	editor.setValue(window.localStorage.getItem("dot"));
	
	editor.on('change', debounce(function() {
		var val = editor.getValue();
		
		// Save pre-expanded values
		window.localStorage.setItem("dot", val);
		
		val = expandMacros(val);
		
		$graph.html(Viz(val, 'svg'));
	}, 100));
});