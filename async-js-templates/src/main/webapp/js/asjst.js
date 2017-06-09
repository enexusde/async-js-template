var asjstDbg = false;
var varlbl = "crdxf";
var indexVar = 'index';
var evenVar = 'even';
var oddVar = 'odd';
var baseURL = '';
var ajaxOptions = {};
var spf = '🎸';
var epf = '🎻';

function DEFAULT_THROW_XHR(x, m, c) {
	throw m + x + c;
}

function excape(line, no, linebreakDefaultTrue) {
	var l = arguments.length;
	if (l == 1)
		throw "Need lineNo";
	var pfx = l === 2 ? '\\n' : '';
	if (line.indexOf("'") == -1) {
		line = varlbl + " += '" + pfx + line + "';";
	} else if (line.indexOf('"') == -1) {
		line = varlbl + ' += "' + pfx + line + '";';
	} else {
		// use " by default.
		var first;
		var n = varlbl + ' += "\\n" + ';
		while ((first = line.indexOf('"')) > 0) {
			n += '"' + line.substring(0, first) + '"+' + "'" + '"' + "'+";
			line = line.substring(first + 1);
		}
		n += '"' + line + '";';
		line = n;
	}
	return line;
}

var unresolvedResult = "";
function load(errFn, url, extra, fn, homeworkObject) {
	var e = ++homeworkObject.tasksOutstanding;
	homeworkObject["call" + e] = {
		placeholder : spf + e + epf
	};
	
	function incomming(data) {
		homeworkObject.cache[url] = data;
		var txt = fn(data);
		homeworkObject["call" + e].value = txt;
		homeworkObject.tasksSolved++;
		if (homeworkObject.tasksOutstanding == homeworkObject.tasksSolved) {
			var txt = homeworkObject.txt;
			while (txt.indexOf(spf) > -1) {
				for (var nr = 1; nr < homeworkObject.tasksSolved + 1; nr++) {
					var call = homeworkObject["call" + nr];
					var placeholderPos = txt.indexOf(call.placeholder);
					if (placeholderPos > -1) {
						txt = txt.substr(0, placeholderPos) + call.value + txt.substr(placeholderPos + call.placeholder.length);
					}
				}
			}
			homeworkObject.func(txt);
		}
	}
	
	
	if(typeof homeworkObject.cache[url] !== 'undefined'){
		incomming(homeworkObject.cache[url]);
	} else {
		var opts = {
			url : url,
			contentType : 'application/json',
			processData : false,
			dataType : 'json',
			error : errFn,
			success : incomming
		};
		jQuery.extend(true, opts, ajaxOptions);
	
		jQuery.ajax(opts)
	}
	return homeworkObject["call" + e].placeholder;
}

function render(id, json, cb) {

	var origId = id;

	if (typeof cb === 'undefined') {
		throw "Callback can not be undefined!";
	}
	if (typeof id === 'undefined') {
		if (asjstDbg)
			console.error("node to render is undefined");
		return id;
	}
	if (typeof id === 'string') {
		var tid = $(id);
		if (typeof tid == 'object') {
			if (tid.length === 0) {
				tid = $('#' + id);
			}
		}
		id = tid;
	}
	if (id.length !== 1) {
		if (asjstDbg) {
			throw "node to render (selected/found by '" + origId + "') must resolve one element";
		}
		return id;
	}
	var relative = id.attr("relative");
	var thr = id.attr("throw");

	if (typeof relative === 'string') {
		relative = relative * 1;
	}
	if (typeof relative === 'undefined') {
		relative = 0;
	}
	var code = id.html();
	if (typeof json === 'undefined') {
		if (asjstDbg) {
			throw "since the json is undefined: render() returns unparsed.";
		}
		return code;
	}
	var no = 0;
	var codeLines = code.split("\n");
	for (var lineIdx = 0; lineIdx < codeLines.length; lineIdx++) {
		var line = codeLines[lineIdx];
		var open = line.indexOf("{{");
		var close = line.indexOf("}}");
		if (open > -1) {
			if (close == -1) {
				throw '{{ and }} must be in same line[:' + (lineIdx + relative) + ']';
			}
			canWork = true;
			var cmd = line.substr(open, close - open + 2);
			var openIf = cmd[2] === 'i' && cmd[3] === 'f';
			var closeIf = cmd[2] === '/' && cmd[3] === 'i' && cmd[4] === 'f' && cmd[5] === '}';
			var elseIf = cmd[2] === 'e' && cmd[3] === 'l' && cmd[4] === 's' && cmd[5] === 'e' && cmd[6] === '}';
			var elseIfCond = cmd[2] === 'e' && cmd[3] === 'l' && cmd[4] === 's' && cmd[5] === 'e' && cmd[6] === ' ' && cmd[7] === 'i' && cmd[8] === 'f' && cmd[9] === ' ';
			var openFor = cmd[2] === 'f' && cmd[3] === 'o' && cmd[4] === 'r' && cmd[5] === ' ';
			var closeFor = cmd[2] === '/' && cmd[3] === 'f' && cmd[4] === 'o' && cmd[5] === 'r';
			var openLoad = cmd[2] === 'l' && cmd[3] === 'o' && cmd[4] === 'a' && cmd[5] === 'd' && cmd[6] === ' ';
			var closeLoad = cmd[2] === '/' && cmd[3] === 'l' && cmd[4] === 'o' && cmd[5] === 'a' && cmd[6] === 'd' && cmd[7] === '}';
			var imp = cmd[2] === 'i' && cmd[3] === 'm' && cmd[4] === 'p' && cmd[5] === 'o' && cmd[6] === 'r' && cmd[7] === 't' && cmd[8] === ' ';

			var isCommand = openIf || closeIf || elseIf || elseIfCond || openFor || closeFor || openLoad || closeLoad || imp;

			if (isCommand && line.indexOf("{{", open + 1) > -1) {
				throw 'only one command per line[:' + (lineIdx + relative) + '] please, i may like to correct the indention and the command' + cmd + ' is already set!';
			}

			if (openIf) {
				var startExp = open + 4;
				line = excape(line.substr(0, open), lineIdx + relative) + " if (" + line.substr(startExp, close - startExp) + ") {"
						+ excape(line.substr(close + 2), lineIdx + relative);
			} else if (closeIf) {
				line = excape(line.substr(0, open), lineIdx + relative) + "} " + excape(line.substr(close + 2), lineIdx + relative);
			} else if (elseIfCond) {
				var startExp = open + 9;
				line = excape(line.substr(0, open), lineIdx + relative) + "} else if (" + line.substr(startExp, close - startExp) + "){"
						+ excape(line.substr(close + 2), lineIdx + relative);
			} else if (elseIf) {
				line = excape(line.substr(0, open), lineIdx + relative) + "} else {" + excape(line.substr(close + 2), lineIdx + relative);
			} else if (openFor) {
				no++;
				var list = cmd.substr(6, cmd.length - 8);
				var idx = 'c' + no;
				line = excape(line.substr(0, open), lineIdx + relative) + ';var mkkd' + lineIdx + '=' + list + '; for (var ' + idx + " in mkkd" + lineIdx + ") with(mkkd" + lineIdx
						+ "[" + idx + "]) {" + indexVar + "=" + idx + " * 1; " + evenVar + "=" + indexVar + " % 2 == 0;" + oddVar + "=!" + evenVar + "; it = mkkd" + lineIdx + "["
						+ indexVar + "];" + excape(line.substr(close + 2), lineIdx + relative);
			} else if (closeFor) {
				no--;
				line = excape(line.substr(0, open), lineIdx + relative) + "}; it = c" + no + "; " + excape(line.substr(close + 2), lineIdx + relative);
			} else if (openLoad) {
				line = excape(line.substr(0, open), lineIdx + relative) + " " + varlbl + " += load(DEFAULT_THROW_XHR," + cmd.substr(7, cmd.length - 9) + ", it, function(it){var "
						+ varlbl + "=''; with(it){ " + excape(line.substr(close + 2), lineIdx + relative, false);
			} else if (closeLoad) {
				line = excape(line.substr(0, open), lineIdx + relative) + " }return " + varlbl + ";}, homeworkObject); "
						+ excape(line.substr(close + 2), lineIdx + relative, false);
			} else if (imp) {
				var newline = excape(line.substr(0, open), lineIdx + relative);
				var after = line.substr(close+2);
				codeLines[lineIdx] = newline;
				line = newline;
				var lns = $('#'+cmd.substr(9, cmd.length - 11));
				var insertlines = lns.html().split("\n");
				var int = 0;
				for (; int < insertlines.length; int++) {
					codeLines.splice(lineIdx + 1 + int, 0, insertlines[int]);
				}
				codeLines[lineIdx+int+1] = after + codeLines[lineIdx+int+1];
				//+ "+"').html() " + excape(line.substr(close + 2), lineIdx + relative);
			} else {
				var array = line.split("{{");
				line = excape(array[0], lineIdx + relative);
				for (var int = 1; int < array.length; int++) {
					var part = array[int];
					var last = part.indexOf("}}");
					if (last == -1) {
						throw 'Newlines not allowed in expression [:' + (lineIdx + relative) + ']';
					}
					line += varlbl + " += (" + part.substr(0, last) + "); ";
					if (last + 2 < part.length) {
						line += excape(part.substr(last + 2), lineIdx + relative, false);
					}
				}
			}
		} else {
			line = excape(line, lineIdx + relative);
		}
		codeLines[lineIdx] = '/* ' + (lineIdx + relative) + ' */ ' + line;
	}
	var script = "var currentIdx, " + indexVar + "," + evenVar + "," + oddVar + ", json = arguments[0], homeworkObject = arguments[1], it = json, c0; with (json){var " + varlbl
			+ "='';" + codeLines.join("\n") + " return " + varlbl + ";}";
	var f;
	if (thr !== undefined) {
		throw "Caused by Throw-Attribute: "+ script;
	}
	try {
		f = new Function(script);
	} catch (e) {
		if (e.lineNumber != undefined) {
			codeLines[e.lineNumber - 1] = codeLines[e.lineNumber - 1] + "   <------------------------------------- " + e.message;
		}
		throw e.message + "\n" + codeLines.join("\n");
	}
	var homeworkObject = {
		func : cb,
		tasksOutstanding : 0,
		tasksSolved : 0,
		cache: {}
	};
	homeworkObject.txt = f(json, homeworkObject);
	if (homeworkObject.tasksOutstanding == 0)
		(cb(homeworkObject.txt));
}