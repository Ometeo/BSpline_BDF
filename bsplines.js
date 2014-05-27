//canvas
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
if (!ctx) {
    alert("This page uses HTML 5 to render correctly.");
}

//interaction
var dragging = false;
var pointIndex = 0;

//points & curve
var points = new Array();
var weights = new Array();
var curve;
var previousSeg;
var p;
var nodes = new Array();

//options
var firstEndpoint = false;
var lastEndpoint = false;
var cyclic = false;
var order = 3;
var resolution = 50;

//display
var handleSize = 12;
var halfHandleSize = handleSize / 2;
var pointSize = 4;
var displayCurve = true;
var displayPoly = false;

/**
 * 
 * @param {type} evt
 * @returns {x, y}
 */
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function drawPoints() {
    ctx.beginPath();
    ctx.strokeStyle = "rgb(100, 100, 255)";
    ctx.fillStyle = "rgba(100, 100, 200, .25)";

    for (i = 0; i < points.length; i++) {
        var point = points[i];
        ctx.rect(point.x - halfHandleSize, point.y - halfHandleSize, handleSize, handleSize);
    }

    ctx.stroke();
    ctx.fill();
}

function drawPointsAsCircles(pts) {
    ctx.beginPath();
    ctx.strokeStyle = "rgb(100, 100, 255)";
    ctx.fillStyle = "rgba(100, 100, 200, .25)";

    for (i = 0; i < pts.length; i++) {
        var point = pts[i];
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
    }
}

function drawPoly(poly, lineWidth, color) {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    var point = poly[0];
    ctx.moveTo(point.x, point.y);

    for (i = 1; i < poly.length; i++) {
        point = poly[i];
        ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
}

/**
 * @param {Array} poly
 * @param {int} t
 * @param {int} r
 * @returns {undefined}
 */
function coxDeBoor(poly, t, r) {

    p = new Array();

    p.push(new Array());

    for (var i = r - order; i <= r; ++i) {
        p[0][i] = poly[i];
    }
    for (var j = 1; j <= order; j++) {
        p.push(new Array());
        for (var i = r - order + j; i <= r; ++i) {
            var denominator = nodes[i - j + order + 1] - nodes[i];
            var x = (t - nodes[i]) * p[j - 1][i].x + (nodes[i - j + order + 1] - t) * p[j - 1][i - 1].x;
            var y = (t - nodes[i]) * p[j - 1][i].y + (nodes[i - j + order + 1] - t) * p[j - 1][i - 1].y;

            x /= denominator;
            y /= denominator;

            var point = {x: x, y: y};

            p[j][i] = point;
        }
    }
    return p[order][r];
}

function processSubSpline(poly, r) {

    var tbegin = nodes[r];
    var tend = nodes[r + 1];
    var t = tbegin;

    var step = (tend - tbegin) / resolution;
    for (var i = 0; i < resolution; ++i) {
        curve[i + ((r - order) * resolution)] = coxDeBoor(poly, t, r);
        t += step;
    }
}

function initNodes(poly) {

    var firstNodesCount = 0;
    var lastNodesCount = 0;
    var middleNodesCount;

    if (firstEndpoint) {
        firstNodesCount = order;
    }
    if (lastEndpoint) {
        lastNodesCount = order + 1;
    }

    middleNodesCount = poly.length + 1 + order - firstNodesCount - lastNodesCount;

    for (var i = 0; i < firstNodesCount; ++i) {
        nodes.push(0);
    }

    for (var i = 0; i < middleNodesCount; ++i) {
        nodes.push(i);
    }

    for (var j = 0; j < lastNodesCount; ++j) {
        nodes.push(i);
    }
}

function getPolyline(poly) {
	var polyline = new Array();
    for (var i = 0; i < poly.length; ++i)
        polyline.push(poly[i]);

    if (cyclic) {
        for (var i = 0; i < order; ++i) {
            polyline.push(poly[i]);
        }
    }
	return polyline;
}

function processBsplineCurve(poly) {
	
	var polyline = getPolyline(poly);
	
    var subcurves = polyline.length - order;
	curve = new Array();

    //init nodes
    nodes = new Array();
    initNodes(polyline);

    //loop over each sub-spline
    for (var r = order; r < subcurves + order; ++r) {
        processSubSpline(polyline, r);
    }
}

function recalcCurve(poly, numPointShifted) {

	var polyline = getPolyline(poly);

	var start = Math.max(numPointShifted, order);
	var end = Math.min(numPointShifted + (order - 1) * 2, polyline.length);
	
	//console.log("from : " + start + " to " + end);
	
	for (var range = start; range < end; ++range) {
		processSubSpline(polyline, range);
	}
}

function delta(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
}

function getPointAt(p1, p2, t) {
    var diff = delta(p1, p2);
    return {
        x: diff.x * t + p1.x,
        y: diff.y * t + p1.y
    };
}

function toggleDisplayCurve() {
    displayCurve = !displayCurve;
    draw();
}

function toggleDisplayPoly() {
    displayPoly = !displayPoly;
    draw();
}

function updateResolution(res) {
    resolution = res;
    processBsplineCurve(points);
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (displayPoly && points.length > 0) {
        drawPoly(points, 1.5, "rgb(0, 0, 0)");
    }

    if (points.length > order) {
        drawPoly(curve, 1, "rgb(0, 0, 0)");
    }
	
	if (previousSeg.length > 0) {
		drawPoly(previousSeg, 1, "rgb(255, 0, 0)");
	}
	
    drawPoints();
}

function isCollidingHandle(point, handlePoint) {
    return point.x > handlePoint.x - halfHandleSize &&
            point.x < handlePoint.x + halfHandleSize &&
            point.y > handlePoint.y - halfHandleSize &&
            point.y < handlePoint.y + halfHandleSize;
}

$("canvas").bind('contextmenu', function(){
	// prevent context menu from displaying
    return false;
});

$("canvas").mousedown(function(event) {
    point = getMousePos(event);
	
	previousSeg = [];
	for (var i = 0; i < points.length; ++i) {
		if (isCollidingHandle(point, points[i])) {
			switch (event.which) {
				case 1: // Left click
					pointIndex = i;
					
					var start = Math.max(pointIndex, order);
					var end = Math.min(pointIndex + (order - 1) * 2, getPolyline(points).length);
					
					previousSeg = curve.slice((start - order) * resolution, (end - order) * resolution)
					dragging = true;
				break;
				case 3: // right click
					selectWeight(i);
				break;
			}
			break;
		}
	}    
});

$("canvas").mousemove(function(event) {
    if (dragging) {
        point = getMousePos(event);
        points[pointIndex] = point;
        if (points.length > order) {
			recalcCurve(points, pointIndex);
        }
        draw();
    }
});

$("canvas").mouseup(function(event) {

	if (event.which == 3) // right click
		return;

    point = getMousePos(event);
    if (dragging) {
        points[pointIndex] = point;
        dragging = false;
    }
    else {
        points.push(point);
		updateWeight();
		
		if (points.length > order) {
			processBsplineCurve(points);
		}
    }
    draw();
});

function updateWeight() {
	var text = "";
	for(var numP = 0; numP < points.length; numP++)
	{
		var id = 'pWeight_' + numP;
		text += '<label class="weight" for="' + id + '">Point ' + (numP + 1) + ' :</label><input type="number" class="weight" id="' + id + '" min="0" max="1" index="' + numP + '" step="0.1" value="' + weights[numP] + '"/>';
	}
	$("#rightscroll").html(text);
};

function selectWeight(numPoint) {
	$input = $("#pWeight_" + numPoint);
	$input.addClass("selectedInput")
	setTimeout(function() {
		$input.removeClass("selectedInput");
	}, 800);
}

$(document).on('change', "input.weight", function () {
	$this = $(this);
	var index = $this.attr('index');
	weights[index] = $this.val();
});

$("#drawPolygon").change(function() {
    toggleDisplayPoly();
});

$("#drawCurve").change(function() {
    toggleDisplayCurve();
});

function setFirstEndpoint(enabled) {
    firstEndpoint = enabled;
}

function setLastEndpoint(enabled) {
    firstEndpoint = enabled;
}

function setCyclic(enabled) {
    cyclic = enabled;
}

function toggleFirstEndpoint() {
    firstEndpoint = !firstEndpoint;
}

function toggleLastEndpoint() {
    lastEndpoint = !lastEndpoint;
}

function toggleCycliv() {
    cyclic = ! cyclic;
}

function updateOrder(newOrder) {
    order = newOrder;
    processBsplineCurve(points);
    draw();
}