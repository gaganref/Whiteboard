$(document).ready(function(){

    var canvas = document.querySelector('#paint');
    var ctx = canvas.getContext('2d');

    var img = new Image();
    img.src = 'http://farm5.static.flickr.com/4058/4252054277_f0fa91e026.jpg';

    img.onload = function () {
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    }

    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));


    var tool = 'brush';
    $('#tools div').on('click', function(){
        tool = $(this).attr('id');
        console.log(tool);
    })



    // Creating a tmp canvas
    var tmp_canvas = document.createElement('canvas');
    var tmp_ctx = tmp_canvas.getContext('2d');
    tmp_canvas.id = 'tmp_canvas';
    tmp_canvas.width = canvas.width;
    tmp_canvas.height = canvas.height;

    sketch.appendChild(tmp_canvas);

    var mouse = {x: 0, y: 0};
    var start_mouse = {x: 0, y: 0};
    var last_mouse = {x: 0, y: 0};


    /* Mouse Capturing Work */
    tmp_canvas.addEventListener('mousemove', function(e) {

        mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
        mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
    }, false);


    /* Drawing on Paint App */
    tmp_ctx.lineWidth = 3;
    tmp_ctx.lineJoin = 'round';
    tmp_ctx.lineCap = 'round';
    tmp_ctx.strokeStyle = 'red';
    tmp_ctx.fillStyle = 'blue';


    tmp_canvas.addEventListener('mousedown', function(e) {

        mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
        mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

        start_mouse.x = mouse.x;
        start_mouse.y = mouse.y;

        if(tool == 'line'){
            tmp_canvas.addEventListener('mousemove', onLinePaint, false);
            onLinePaint();
        }
        else if(tool == 'rectangle'){
            tmp_canvas.addEventListener('mousemove', onRectPaint, false);
            onRectPaint();
        }
        else if(tool == 'brush'){
            tmp_canvas.addEventListener('mousemove', onBrushPaint, false);
            onBrushPaint();
        }

    }, false);

    tmp_canvas.addEventListener('mouseup', function() {
        tmp_canvas.removeEventListener('mousemove', onLinePaint, false);
        tmp_canvas.removeEventListener('mousemove', onRectPaint, false);
        tmp_canvas.removeEventListener('mousemove', onBrushPaint, false);

        // Writing down to real canvas now
        ctx.drawImage(tmp_canvas, 0, 0);
        // Clearing tmp canvas
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

        ppts = [];

    }, false);

    var onLinePaint = function() {

        // Tmp canvas is always cleared up before drawing.
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

        tmp_ctx.beginPath();
        tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
        tmp_ctx.lineTo(mouse.x, mouse.y);
        tmp_ctx.stroke();
        tmp_ctx.closePath();

    };

    var onRectPaint = function() {

        // Tmp canvas is always cleared up before drawing.
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

        var x = Math.min(mouse.x, start_mouse.x);
        var y = Math.min(mouse.y, start_mouse.y);
        var width = Math.abs(mouse.x - start_mouse.x);
        var height = Math.abs(mouse.y - start_mouse.y);
        tmp_ctx.strokeRect(x, y, width, height);

    };

    // Pencil Points
    var ppts = [];

    var onBrushPaint = function() {

        // Saving all the points in an array
        ppts.push({x: mouse.x, y: mouse.y});

        if (ppts.length < 3) {
            var b = ppts[0];
            tmp_ctx.beginPath();
            //ctx.moveTo(b.x, b.y);
            //ctx.lineTo(b.x+50, b.y+50);
            tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
            tmp_ctx.fill();
            tmp_ctx.closePath();

            return;
        }

        // Tmp canvas is always cleared up before drawing.
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

        tmp_ctx.beginPath();
        tmp_ctx.moveTo(ppts[0].x, ppts[0].y);

        for (var i = 1; i < ppts.length - 2; i++) {
            var c = (ppts[i].x + ppts[i + 1].x) / 2;
            var d = (ppts[i].y + ppts[i + 1].y) / 2;

            tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
        }

        // For the last 2 points
        tmp_ctx.quadraticCurveTo(
            ppts[i].x,
            ppts[i].y,
            ppts[i + 1].x,
            ppts[i + 1].y
        );
        tmp_ctx.stroke();

    };

});