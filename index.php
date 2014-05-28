<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <meta charset="UTF-8">
        <link type="text/css" rel="stylesheet" href="bsplines.css" />
        <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
        <script src="http://code.jquery.com/jquery-1.10.2.js"></script>
        <script src="http://code.jquery.com/ui/1.10.4/jquery-ui.js"></script>

        <title>B-splines</title>

        <script>
            $(function() {
                var order = $("#order").spinner({
                    change: function(event, ui) {
                        updateOrder(order.spinner("value"));
                    },
                    stop: function(event, ui) {
                        updateOrder(order.spinner("value"));
                    }
                });
                var resolution = $("#resolution").spinner({
                    change: function(event, ui) {
                        updateResolution(resolution.spinner("value"));
                    },
                    stop: function(event, ui) {
                        updateResolution(resolution.spinner("value"));
                    }
                });

                $("button").button();
            });
			$(document).ready(function() {
				$( "#order" ).spinner({ min: 1 });
				$( "#resolution" ).spinner({ min: 1 });
			});
        </script>
    </head>
    <body>

        <div id="main_page">
            <h1>B-splines</h1>
            <p>Click on the canvas to add some points to the curve. You can drag and drop existing points using their handles.</p>

            <div class="page box_shadow">
                <h2>Options</h2>
                <h3>Precision</h3>
                <label for="order">Order</label><input id="order" type="text" value="3" />
                <label for="resolution">Resolution</label><input id="resolution" type="text" value="20" />
                <h3>Esthetic</h3>
				<label for="trace">Trace</label><input id="trace" type="checkbox" checked="checked" />
                <h3>Endpoints</h3>
				<label for="cyclic">Cyclic</label><input id="cyclic" type="checkbox" />
                <label for="first">First</label><input id="first" type="checkbox" />
                <label for="last">Last</label><input id="last" type="checkbox" />
                
            </div>

            <canvas id="myCanvas" class="box_shadow" width="800px" height="500px"></canvas>
            <script src="bsplines.js"></script>

            <div id="rightscroll" class="page box_shadow">
            </div>
            
            <div id="knots" class="page box_shadow">
                <h2>Knots</h2>
            </div>

        </div>
    </div>
</body>
</html>
