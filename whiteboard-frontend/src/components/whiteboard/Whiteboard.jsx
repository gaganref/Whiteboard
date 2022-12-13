import React, { Component } from "react";
import { Input } from 'rsuite';
import io from 'socket.io-client'

import './style.css';


class Whiteboard extends Component
{
    timeout;
    io = require("socket.io-client")('ws://nginx');
    // socket = io.connect("http://localhost:8935/");
    ctx;
    temp_ctx;

    isDrawing = false;


    constructor(props){
        super(props);

        this.state = {
            drawType: "Mouse"
        }

        this.socket.on('connect', () => {
            console.log('connected');
        });

        this.socket.on("canvas-data", function(data){

            let root = this;

            if(root.isDrawing){
                return;
            }

            root.isDrawing = true;

            const image = new Image();
            const canvas = document.querySelector('#whiteboard');
            let ctx = canvas.getContext('2d');
            image.onload = function() {
                ctx.drawImage(image, 0, 0);

                root.isDrawing = false;
            };
            image.src = data;
        })

    }

    componentDidMount() {
        this.drawWithMouse();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(this.temp_ctx.strokeStyle !== nextProps.color){
            this.temp_ctx.strokeStyle = nextProps.color;
        }
        if(this.temp_ctx.lineWidth !== nextProps.size){
            this.temp_ctx.lineWidth = nextProps.size;
        }
        if(this.state.drawType !== nextProps.drawType){
            this.setState({
                drawType: nextProps.drawType
            })
        }
    }


    drawWithMouse(){

        let canvas = document.querySelector('#whiteboard');
        this.ctx = canvas.getContext('2d');
        let this_ctx = this.ctx;
        let sketch = document.querySelector('#sketch');
        let sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));

        let temp_canvas = document.createElement('canvas');
        this.temp_ctx = temp_canvas.getContext('2d');
        let this_temp_ctx = this.temp_ctx;
        temp_canvas.id = 'temp_canvas';
        temp_canvas.width = canvas.width;
        temp_canvas.height = canvas.height;
        sketch.prepend(temp_canvas);

        this_temp_ctx.lineWidth = this.props.size;
        this_temp_ctx.lineJoin = 'round';
        this_temp_ctx.lineCap = 'round';
        this_temp_ctx.strokeStyle = this.props.color;
        this_temp_ctx.font = 'bold 30px sans-serif';

        let mouse = {x: 0, y: 0};
        let start_mouse = {x: 0, y: 0};
        let last_mouse = {x: 0, y: 0};
        let clicked_position = {x: 0, y: 0};

        temp_canvas.addEventListener('mousemove', function(e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);

        temp_canvas.addEventListener('click', function (e){

            if(!(root.state.drawType === "Text")){
                removeTextArea();
                return;
            }

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;

            clicked_position.x = mouse.x;
            clicked_position.y = mouse.y;

            addTextArea(mouse.x, mouse.y);

        }, false);

        temp_canvas.addEventListener('mousedown', function(e) {
            temp_canvas.addEventListener('mousemove', onPaint, false);

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;

            start_mouse.x = mouse.x;
            start_mouse.y = mouse.y;

        }, false);

        temp_canvas.addEventListener('mouseup', function() {
            temp_canvas.removeEventListener('mousemove', onPaint, false);

            drawOnRealCanvas();

        }, false);

        temp_canvas.addEventListener('mouseout', function() {
            temp_canvas.removeEventListener('mousemove', onPaint, false);

            drawOnRealCanvas();

        }, false);

        const root = this;
        let paint_points = [];

        let drawOnRealCanvas = function () {
            // Writing down to real canvas now
            this_ctx.drawImage(temp_canvas, 0, 0);

            // Send data on socket to other
            const base64ImageData = canvas.toDataURL("image/png");
            root.socket.emit("canvas-data", base64ImageData);

            // Clearing tmp canvas
            this_temp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);

            paint_points = [];
        }

        let onPaint = function() {

            if(root.state.drawType === "Mouse"){
                onMouseDraw();
            }
            else if(root.state.drawType === "Line"){
                onLineDraw();
            }
            else if(root.state.drawType === "Circle"){
                onCircleDraw();
            }
            else if(root.state.drawType === "Rectangle"){
                onRectangleDraw();
            }
        };

        let onMouseDraw = function () {
            // Default draw method
            // this_temp_ctx.beginPath();
            // this_temp_ctx.moveTo(last_mouse.x, last_mouse.y);
            // this_temp_ctx.lineTo(mouse.x, mouse.y);
            // this_temp_ctx.closePath();
            // this_temp_ctx.stroke();

            // Draw method for smooth drawing
            // Saving all the points in an array
            paint_points.push({x: mouse.x, y: mouse.y});

            if (paint_points.length < 3) {
                const b = paint_points[0];
                this_temp_ctx.beginPath();
                //ctx.moveTo(b.x, b.y);
                //ctx.lineTo(b.x+50, b.y+50);
                this_temp_ctx.arc(b.x, b.y, this_temp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
                this_temp_ctx.fill();
                this_temp_ctx.closePath();

                return;
            }

            // Tmp canvas is always cleared up before drawing.
            this_temp_ctx.clearRect(0, 0, this_temp_ctx.width, this_temp_ctx.height);

            let i;

            this_temp_ctx.beginPath();
            this_temp_ctx.moveTo(paint_points[0].x, paint_points[0].y);

            for (i = 1; i < paint_points.length - 2; i++) {
                const c = (paint_points[i].x + paint_points[i + 1].x) / 2;
                const d = (paint_points[i].y + paint_points[i + 1].y) / 2;

                this_temp_ctx.quadraticCurveTo(paint_points[i].x, paint_points[i].y, c, d);
            }

            // For the last 2 points
            this_temp_ctx.quadraticCurveTo(
                paint_points[i].x,
                paint_points[i].y,
                paint_points[i + 1].x,
                paint_points[i + 1].y
            );
            this_temp_ctx.stroke();
        }

        let onLineDraw = function () {
            // Tmp canvas is always cleared up before drawing.
            this_temp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);

            this_temp_ctx.beginPath();
            this_temp_ctx.moveTo(start_mouse.x, start_mouse.y);
            this_temp_ctx.lineTo(mouse.x, mouse.y);
            this_temp_ctx.stroke();
            this_temp_ctx.closePath();
        }

        let onCircleDraw = function () {
            // Tmp canvas is always cleared up before drawing.
            this_temp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);

            const x = (mouse.x + start_mouse.x) / 2;
            const y = (mouse.y + start_mouse.y) / 2;

            const radius = Math.max(
                Math.abs(mouse.x - start_mouse.x),
                Math.abs(mouse.y - start_mouse.y)
            ) / 2;

            this_temp_ctx.beginPath();
            this_temp_ctx.arc(x, y, radius, 0, Math.PI*2, false);
            // tmp_ctx.arc(x, y, 5, 0, Math.PI*2, false);
            this_temp_ctx.stroke();
            this_temp_ctx.closePath();
        }

        let onRectangleDraw = function () {
            // Tmp canvas is always cleared up before drawing.
            this_temp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);

            const x = Math.min(mouse.x, start_mouse.x);
            const y = Math.min(mouse.y, start_mouse.y);
            const width = Math.abs(mouse.x - start_mouse.x);
            const height = Math.abs(mouse.y - start_mouse.y);
            this_temp_ctx.strokeRect(x, y, width, height);
        }

        let hasTextArea = false;

        let onTextDraw = function (x, y, text) {
            // Tmp canvas is always cleared up before drawing.
            this_temp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);

            this_temp_ctx.fillStyle = root.props.color;
            this_temp_ctx.fillText(text, x, y);

            drawOnRealCanvas();
        }

        let addTextArea = function (x, y) {
            if(hasTextArea){
                const thisInput = document.getElementById('inputArea');
                thisInput.style.left = (x - 4) + 'px';
                thisInput.style.top = (y - 4) + 'px';
                thisInput.value = '';
                thisInput.focus();
            }
            else{
                const input = document.createElement('input');

                input.type = 'text';
                input.id = 'inputArea';

                input.style.left = (x - 4) + 'px';
                input.style.top = (y - 4) + 'px';
                input.onkeydown = handleEnter;

                sketch.prepend(input);
                input.focus();

                hasTextArea = true;
            }
        }

        let removeTextArea = function () {
            if(hasTextArea){
                const thisInput = document.getElementById('inputArea');
                sketch.removeChild(thisInput);
                hasTextArea = false;
            }
        }

        let handleEnter = function (e) {
            let keyCode = e.keyCode;
            if (keyCode === 13) {
                onTextDraw(parseInt(this.style.left, 10), parseInt(this.style.top, 10), this.value);
                removeTextArea();
            }
        }

    }

    render (){
        return(
            <div className="sketch" id="sketch">
                <canvas className="whiteboard" id="whiteboard"></canvas>
            </div>
        )
    }
}

export default Whiteboard;