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
var duplicate = new Array();
var knots = new Array();
var curve;
var previousSeg;
var p;
var nodes = new Array();

//options
var firstEndpoint = false;
var lastEndpoint = false;
var cyclic = false;
var order = parseInt($("#order").val());
var resolution = parseInt($("#resolution").val());

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
            var denominator = knots[i - j + order + 1] - knots[i];
            
            
            var x = (t - knots[i]) * p[j - 1][i].x + (knots[i - j + order + 1] - t) * p[j - 1][i - 1].x;
            var y = (t - knots[i]) * p[j - 1][i].y + (knots[i - j + order + 1] - t) * p[j - 1][i - 1].y;

            x /= denominator;
            y /= denominator;

            var point = {x: x, y: y};

            p[j][i] = point;
        }
    }
    
    return p[order][r];
}

function processSubSpline(poly, r) {

    var tbegin = knots[r];
    var tend = knots[r + 1];
    var t = tbegin;
    var step = (tend - tbegin) / (resolution - 1);
    var curveBegin = (r - order) * resolution;
    
    for (var i = 0; i < resolution; ++i) {
        curve[i + curveBegin] = coxDeBoor(poly, t, r);
        t += step;
    }
}

function initKnots(poly) {

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
        knots.push(0);
    }

    for (var i = 0; i < middleNodesCount; ++i) {
        knots.push(i);
    }

    for (var j = 0; j < lastNodesCount; ++j) {
        knots.push(i);
    }
}

function getPolyline(poly) {
    var polyline = new Array();
    for (var i = 0; i < poly.length; ++i) {
		j = duplicate[i];
		if (duplicate[i] === undefined)
			j = 1;
		polyline.push(poly[i]);
		while (j > 1) {
			polyline.push(poly[i]);
			--j;
		}
	}
		
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
    //nodes = new Array();
    //initNodes(polyline);

    //loop over each sub-spline
    for (var r = order; r < subcurves + order; ++r) {
        processSubSpline(polyline, r);
    }
}

function recalcCurve(poly, numPointShifted) {

    var polyline = getPolyline(poly);

    var start = Math.max(numPointShifted, order);
    var end = Math.min(numPointShifted + order * 2, polyline.length);

    // sauvegarde de la courbe précédente
    if (previousSeg.length == 0)
        previousSeg = curve.slice((start - order) * resolution, (end - order) * resolution)

    console.log("from : " + start + " to " + end);

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

$("canvas").bind('contextmenu', function() {
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
                    dragging = true;
                    break;
                case 3: // right click
                    selectDuplicate(i);
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

function updateKnots() {
    $("#knots").html("<h2>Knots</h2>");
    knots = new Array();
	initKnots(getPolyline(points));
	
    for(var i = 0; i < knots.length; ++i) {
        var knotId = "knot" + i;
        //knots.push(i)
        $("#knots").append("<label for=\"" + knotId + "\">Knot " + i + "</label><input id=\"" + knotId + "\" type=\"range\" min=\"0\" max=\"20\" value=\"" + knots[i] +"\" step=\".01\" oninput=\"updateKnot(" + knots[i] + ", this.value)\" /><br/>");
    }
}

function updateKnot(index, value) {
    console.debug(knots);
    knots[index] = parseFloat(value);
    processBsplineCurve(points);
	draw();
}

$("canvas").mouseup(function(event) {

    if (event.which === 3) // right click
        return;

    point = getMousePos(event);
    if (dragging) {
        points[pointIndex] = point;
        dragging = false;
    }
    else {
        points.push(point);
        updateKnots();
		updateDuplicate();

        if (points.length > order) {
            processBsplineCurve(points);
        }
    }
    draw();
});

function updateDuplicate() {
    var text = "";
    for (var numP = 0; numP < points.length; numP++)
    {
        var id = 'pDupli_' + numP;
		if (duplicate[numP] === undefined)
			duplicate[numP] = 1;
        text += '<label class="duplicate" for="' + id + '">Point ' + (numP + 1) + ' :</label><input type="number" class="duplicate" id="' + id + '" min="1" max="' + order + '" index="' + numP + '" value="' + duplicate[numP] + '"/><br/>';
    }
    $("#rightscroll").html(text);
};

function selectDuplicate(numPoint) {
	duplicate[numPoint] = duplicate[numPoint] == order ? 1 : order;
    $input = $("#pDupli_" + numPoint);
	$input.val(duplicate[numPoint]);
    $input.addClass("selectedInput")
    setTimeout(function() {
        $input.removeClass("selectedInput");
		updateAll();
    }, 500);
}

$(document).on('change', "input.duplicate", function() {
	$this = $(this);
    var index = $this.attr('index');
    //update weight
    duplicate[index] = $this.val();
	updateAll();
});

$("#drawPolygon").change(function() {
    toggleDisplayPoly();
});

$("#drawCurve").change(function() {
    toggleDisplayCurve();
});

function updateAll() {
	updateKnots();
    processBsplineCurve(points);
    draw();
}

function updateOrder(o) {
    order = o;
    updateAll();
}

function updateResolution(r) {
    resolution = r;
    updateAll();
}

$("#first").change(function() {
    firstEndpoint = !firstEndpoint;

    if (firstEndpoint)
    {
        cyclic = false;
        $("#cyclic").attr("checked", cyclic);
    }
    updateAll();
});

$("#last").change(function() {
    lastEndpoint = !lastEndpoint;

    if (lastEndpoint)
    {
        cyclic = false;
        $("#cyclic").attr("checked", cyclic);
    }
    updateAll();
});

$("#cyclic").change(function() {
    cyclic = !cyclic;

    if (cyclic)
    {
        firstEndpoint = lastEndpoint = false;

        $("#first").attr("checked", false);
        $("#last").attr("checked", false);
    }
	updateAll();
});
