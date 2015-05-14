$(document).ready(function($) {
	var $graph = $('#js-graph');
	
	var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/text");
	editor.on('change', function() {
		var val = editor.getValue();
		console.log(val);
		$graph.html(Viz(val, 'svg'));
	});
});