var asjst = {
	unresolvedResult : "",
	asjstDbg : false,
	varlbl : "crdxf",
	indexVar : 'index',
	evenVar : 'even',
	oddVar : 'odd',
	ajaxOptions : {},
	spf : '🎸',
	epf : '🎻',
	geilnolscl : undefined
};

asjst.allResultsExists = function(homeworkObject) {
	return homeworkObject.tasksOutstanding == homeworkObject.tasksSolved;
}

asjst.excape = function(line, no, linebreakDefaultTrue) {
	var l = arguments.length;
	if (l == 1)
		throw "Need lineNo";
	var pfx = l === 2 ? '\\n' : '';
	if (line.indexOf("'") == -1) { // no '
		line = asjst.varlbl + " += '" + pfx + line + "';";
	} else if (line.indexOf('"') == -1) { // no "
		line = asjst.varlbl + ' += "' + pfx + line + '";';
	} else { // " and '
		var tueddelchenParts = line.split('"');
		line = tueddelchenParts.join('\\"')
		line = asjst.varlbl + ' += "' + pfx + line + '";';
	}
	return line;
}

asjst.load = function(lineNo, url, extra, fn, homeworkObject) {
	var e = ++homeworkObject.tasksOutstanding;
	homeworkObject["call" + e] = {
		placeholder : asjst.spf + e + asjst.epf
	};

	function solve(txt) {
		homeworkObject["call" + e].value = txt;
		homeworkObject.tasksSolved++;
		if (asjst.allResultsExists(homeworkObject)) {
			var txt = homeworkObject.txt;
			while (txt.indexOf(asjst.spf) > -1) {
				for (var nr = 1; nr < homeworkObject.tasksSolved + 1; nr++) {
					var call = homeworkObject["call" + nr];
					var placeholderPos = txt.indexOf(call.placeholder);
					if (placeholderPos > -1) {
						txt = txt.substr(0, placeholderPos)
								+ call.value
								+ txt.substr(placeholderPos
										+ call.placeholder.length);
					}
				}
			}
			homeworkObject.func(txt);
		}
	}
	function handleTemplateError(e) {
		if (typeof e.stack === 'undefined')
			throw e;
		var source = e.stack.split("\n")[1].split(":");
		var msg = e.message
		if (typeof geilnolscl !== 'undefined') {
			msg += ' after line ' + geilnolscl;
		}
		if (typeof SyntaxError === 'function') {
			throw new SyntaxError(msg, document.location.pathname, lineNo);
		} else
			throw msg + " in async block of line " + lineNo;
	}
	function incomming(data) {
		homeworkObject.cache[url] = {
			incommingData : data
		};
		var txt;
		try {
			txt = fn(data);
		} catch (e) {
			handleTemplateError(e);
		}
		solve(txt);
	}
	function errorhandler(xhr) {
		homeworkObject.cache[url] = {
			errorhandlerData : xhr
		};
		var txt;
		var jsonObject = {
			httpStatusCode : xhr.status
		};
		try {
			txt = fn(jsonObject);
		} catch (e) {
			handleTemplateError(e);
		}
		solve(txt);
	}

	if (typeof homeworkObject.cache[url] !== 'undefined') {
		var cache = homeworkObject.cache[url];
		if (typeof cache.incommingData !== 'undefined') {
			incomming(cache.incommingData);
		} else {
			errorhandler(cache.errorhandlerData);
		}
	} else {
		var opts = {
			url : url,
			contentType : 'application/json',
			processData : false,
			dataType : 'json',
			success : incomming,
			error : errorhandler
		};
		jQuery.extend(true, opts, asjst.ajaxOptions);
		jQuery.ajax(opts)
	}
	var ph = homeworkObject["call" + e].placeholder;
	return ph;
}

asjst.render = function (id, json, cb) {

	var origId = id;

	if (typeof cb === 'undefined') {
		throw "Callback can not be undefined!";
	}
	if (typeof id === 'undefined') {
		if (asjst.asjstDbg)
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
		if (asjst.asjstDbg) {
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
		if (asjst.asjstDbg) {
			throw "since the json is undefined: render() returns unparsed.";
		}
		return code;
	}
	var no = 0;
	var codeLines = code.split("\n");
	var statusCodes=[];
	var oldcode;
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
			var isStatusCode = !isNaN(cmd[2]+cmd[3]+cmd[4]) && close-open==5;
			var imp = cmd[2] === 'i' && cmd[3] === 'm' && cmd[4] === 'p' && cmd[5] === 'o' && cmd[6] === 'r' && cmd[7] === 't' && cmd[8] === ' ';

			var isCommand = openIf || closeIf || elseIf || elseIfCond || openFor || closeFor || openLoad || closeLoad || imp;
			if (isCommand && line.indexOf("{{", open + 1) > -1) {
				throw 'only one command per line[:' + (lineIdx + relative) + '] please, i may like to correct the indention and the command' + cmd + ' is already set!';
			}

			if (openIf) {
				var startExp = open + 4;
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + " if (" + line.substr(startExp, close - startExp) + ") {"
						+ asjst.excape(line.substr(close + 2), lineIdx + relative);
			} else if (closeIf) {
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + "} " + asjst.excape(line.substr(close + 2), lineIdx + relative);
			} else if (elseIfCond) {
				var startExp = open + 9;
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + "} else if (" + line.substr(startExp, close - startExp) + "){"
						+ asjst.excape(line.substr(close + 2), lineIdx + relative);
			} else if (elseIf) {
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + "} else {" + asjst.excape(line.substr(close + 2), lineIdx + relative);
			} else if (openFor) {
				no++;
				var list = cmd.substr(6, cmd.length - 8);
				var idx = 'c' + no;
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + ';var mkkd' + lineIdx + '=' + list + '; for (var ' + idx + " in mkkd" + lineIdx + ") with(mkkd" + lineIdx
						+ "[" + idx + "]) {" + asjst.indexVar + "=" + idx + " * 1; " + asjst.evenVar + "=" + asjst.indexVar + " % 2 == 0;" + asjst.oddVar + "=!" + asjst.evenVar + "; it = mkkd" + lineIdx + "["
						+ asjst.indexVar + "];" + asjst.excape(line.substr(close + 2), lineIdx + relative);
			} else if (closeFor) {
				no--;
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + "}; it = c" + no + "; " + asjst.excape(line.substr(close + 2), lineIdx + relative);
			} else if (openLoad) {
				statusCodes.push(undefined);
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + " " + asjst.varlbl + " += asjst.load(" + (lineIdx + relative) + ", " + cmd.substr(7, cmd.length - 9) + ", it, function(it){var "
						+ asjst.varlbl + "=''; with(it){ " + asjst.excape(line.substr(close + 2), lineIdx + relative, false);
			} else if (closeLoad) {
				line = asjst.excape(line.substr(0, open), lineIdx + relative) + " }return " + asjst.varlbl + ";}, homeworkObject); " + asjst.excape(line.substr(close + 2), lineIdx + relative, false);
				var thisCode = statusCodes[statusCodes.length - 1];
				var undefinedBefore = typeof thisCode == 'undefined';
				statusCodes.pop();
				if (!undefinedBefore) {
					line = "}/*close code "+thisCode+"*/" + line;
				}
			} else if (imp) {
				var newline = asjst.excape(line.substr(0, open), lineIdx + relative);
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
			} else if (isStatusCode) {
				var undefinedBefore = typeof statusCodes[statusCodes.length - 1] == 'undefined';
				var code = (cmd[2] + cmd[3] + cmd[4]) * 1;
				oldcode = code;
				statusCodes[statusCodes.length - 1] = code;
				if (undefinedBefore) {
					line = asjst.excape(line.substr(0, open), lineIdx + relative) + " if (typeof httpStatusCode !== 'undefined' && httpStatusCode == " + statusCodes[statusCodes.length - 1] + ") { " + asjst.excape(line.substr(close + 2), lineIdx + relative, false);
				} else {
					line = asjst.excape(line.substr(0, open), lineIdx + relative) + " } else if (typeof httpStatusCode !== 'undefined' && httpStatusCode == " + statusCodes[statusCodes.length - 1] + ") { " + asjst.excape(line.substr(close + 2), lineIdx + relative, false);
				}
			} else {
				var array = line.split("{{");
				line = asjst.excape(array[0], lineIdx + relative);
				for (var int = 1; int < array.length; int++) {
					var part = array[int];
					var last = part.indexOf("}}");
					if (last == -1) {
						throw 'Newlines not allowed in expression [:' + (lineIdx + relative) + ']';
					}
					line += asjst.varlbl + " += (" + part.substr(0, last) + "); ";
					if (last + 2 < part.length) {
						line += asjst.excape(part.substr(last + 2), lineIdx + relative, false);
					}
				}
			}
		} else {
			line = asjst.excape(line, lineIdx + relative);
		}
		codeLines[lineIdx] = '/* ' + (lineIdx + relative) + ' */ ' + line + "geilnolscl="+(lineIdx + relative)+";";
	}
	var script = "var currentIdx, " + asjst.indexVar + "," + asjst.evenVar + "," + asjst.oddVar + ", json = arguments[0], homeworkObject = arguments[1], it = json, c0; with (json){var " + asjst.varlbl
			+ "='';" + codeLines.join("\n") + " return " + asjst.varlbl + ";}";
	var f;
	if (thr !== undefined) {
		throw "Caused by Throw-Attribute: "+ script;
	}
	try {
		f = new Function(script);
	} catch (e) {
		throw script;
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
