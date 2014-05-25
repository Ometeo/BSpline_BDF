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
var curve;
var p;
var nodes = new Array();

//options
var firstEndpoint = false;
var lastEndpoint = false;
var cyclic = true;
var order = 2;
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

    for (var i = 0; i <= resolution; ++i) {
        curve = curve.concat(coxDeBoor(poly, t, r));
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

function processBsplineCurve(poly) {

    var polyline = new Array();

    for (var i = 0; i < poly.length; ++i)
        polyline.push(poly[i]);

    if (cyclic) {
        for (var i = 0; i < order; ++i) {
            polyline.push(poly[i]);
        }
    }

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
    drawPoints();
}

function isCollidingHandle(point, handlePoint) {
    return point.x > handlePoint.x - halfHandleSize &&
            point.x < handlePoint.x + halfHandleSize &&
            point.y > handlePoint.y - halfHandleSize &&
            point.y < handlePoint.y + halfHandleSize;
}

$("canvas").mousedown(function(event) {
    point = getMousePos(event);

    for (var i = 0; i < points.length; ++i) {
        if (isCollidingHandle(point, points[i])) {
            dragging = true;
            pointIndex = i;
            break;
        }
    }
});

$("canvas").mousemove(function(event) {
    if (dragging) {
        point = getMousePos(event);
        points[pointIndex] = point;
        if (points.length > order) {
            processBsplineCurve(points);
        }
        draw();
    }
});

$("canvas").mouseup(function(event) {
    point = getMousePos(event);
    if (dragging) {
        points[pointIndex] = point;
        dragging = false;
    }
    else {
        points.push(point);
    }
    if (points.length > order) {
        processBsplineCurve(points);
    }
    draw();
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