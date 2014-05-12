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
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
        <title>B-splines</title>
    </head>
    <body>
        
        <div id ="main_page">
            <h1>B-splines</h1>
            <p>Click on the canvas to add some points to the curve. You can drag and drop existing points using their handles.</p>
            
            <div class="page box_shadow">
                <h2>Order/Resolution</h2>
                <label for="order">Order</label><input id="order" type="text" />
                <label for="resolution">Resolution</label><input id="resolution" type="text" />
                
                <h2>Endpoints</h2>
                <label for="first">First</label><input id="first" type="checkbox" />
                <label for="last">Last</label><input id="last" type="checkbox" />
            </div>
            
            <canvas id="myCanvas" class="box_shadow" width="800px" height="500px"></canvas>
            <script src="bsplines.js"></script>
            
            <div id="rightscroll" class="page box_shadow">
                <?php
                for($i=0; $i < 100; ++$i)
                    echo 'nyan<br/>';
                ?>
            </div>

            </div>
        </div>
    </body>
</html>
