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

//                $("#disable").click(function() {
//                    if (spinner.spinner("option", "disabled")) {
//                        spinner.spinner("enable");
//                    } else {
//                        spinner.spinner("disable");
//                    }
//                });
//                $("#destroy").click(function() {
//                    if (spinner.data("ui-spinner")) {
//                        spinner.spinner("destroy");
//                    } else {
//                        spinner.spinner();
//                    }
//                });
//                $("#getvalue").click(function() {
//                    alert(spinner.spinner("value"));
//                });
//                $("#setvalue").click(function() {
//                    spinner.spinner("value", 5);
//                });

                $("button").button();
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
                <label for="order">Order</label><input id="order" type="text" value="0" />
                <label for="resolution">Resolution</label><input id="resolution" type="text" value="0" />
                <h3>Cyclic</h3>
                <label for="cyclic">Cyclic</label><input id="cyclic" type="checkbox" checked />
                <h3>Endpoints</h3>
                <label for="first">First</label><input id="first" type="checkbox" checked="false" />
                <label for="last">Last</label><input id="last" type="checkbox" checked="false" />
            </div>

            <canvas id="myCanvas" class="box_shadow" width="800px" height="500px"></canvas>
            <script src="bsplines.js"></script>

            <div id="rightscroll" class="page box_shadow">
            </div>

        </div>
    </div>
</body>
</html>
