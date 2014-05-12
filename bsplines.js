//canvas
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
if (!ctx) {
    alert("This page uses HTML 5 to render correctly.");
}

//interaction
var dragging = false;
var pointIndex = 0;
var order = 3;

//points
var points = new Array();
var curve;
var p;

//display
var handleSize = 8;
var halfHandleSize = handleSize / 2;
var pointSize = 4;
var resolution = 5;
var constructionT = 0;
var displayCurve = true;
var displayPoly = true;
var displayConstruction = true;
var constructionPoint = true;

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

function processBsplineCurve(poly) {
    var iterations = resolution * poly.length;
    var step = 1.0 / iterations;
    var t = 0;
    curve = new Array();
    
    
    for (var r = 0; r < iterations + 1; r++) {
        curve.push(coxDeBoor(poly, t));
        t += step;
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

/**
 * @param {Array} poly
 * @param {int} t
 * @returns {undefined}
 */
function coxDeBoor(poly, t) {
    p = new Array();
    var n = poly.length;
    p.push(poly);

    for (i = 1; i < order; i++) {
//        p.push(new Array());
//        var lastLevel = p[i - 1];
//        for (j = 0; j < n - i; j++) {
//            p[i].push(getPointAt(lastLevel[j], lastLevel[j + 1], t));
//        }
    }

    return p[n - 1][0];
}

function drawConstructionAt(poly, t) {
    coxDeBoor(poly, t);
    var c = "rgba(0, 0, 200, alpha)";
    for (var i = 1; i < p.length; i++) {
        var col = c.replace(/alpha/g, '')
        drawPoly(p[i], 1, col);
        drawPointsAsCircles(p[i]);
    }
}

function toggleDisplayCurve() {
    displayCurve = !displayCurve;
    draw();
}

function toggleDisplayPoly() {
    displayPoly = !displayPoly;
    draw();
}

function toggleDisplayConstruction() {
    displayConstruction = !displayConstruction;
    draw();
}

function updateResolution(res) {
    resolution = res;
    processBsplineCurve(points);
    draw();
}

function updateConstructionT(t) {
    constructionT = t;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length > 1) {
        if (displayCurve)
            drawPoly(curve, 1, "rgb(0, 0, 0)");
        if (displayPoly)
            drawPoly(points, 1.5, "rgb(0, 0, 0)");
        if (displayConstruction)
            drawConstructionAt(points, constructionT);
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
        if (points.length > 1) {
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
    if (points.length > 1) {
        processBsplineCurve(points);
    }
    draw();
});

$("#drawConstruction").change(function() {
    toggleDisplayConstruction();
});

$("#drawPolygon").change(function() {
    toggleDisplayPoly();
});

$("#drawCurve").change(function() {
    toggleDisplayCurve();
});