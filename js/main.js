// EaselJS Boilerplate - Doug Winnie - sfdesignerdw.wordpress.com

// establish stage and global objects
var stage;
var canvasWidth;
var canvasHeight;

var shape;
var oldX, oldY;
var color = "#111";
var size = 25;

var NN_URL = "http://addison.duckdns.org:8090/";

function init() {
    $('.button-collapse').sideNav();

    // access stage object
	var canvas = $('#canvasStage')[0];
    
    // determine stage size
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
    	
    // create stage size
    stage = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    createjs.Touch.enable(stage);

    shape = new createjs.Shape();
    var drawing = false;

    stage.addChild(shape);

    stage.on("stagemouseup", function (event) {
        drawing = false;
    });

    // add handler for stage mouse events:
    stage.on("stagemousedown", function(event) {
        oldX = event.stageX;
        oldY = event.stageY;
        drawing = true;
    });

    stage.on("stagemousemove",function(evt) {
        if (oldX && oldY && drawing) {
            shape.graphics.beginStroke(color)
                .setStrokeStyle(size, "round")
                .moveTo(oldX, oldY)
                .lineTo(evt.stageX, evt.stageY);
            stage.update();
        }
        oldX = evt.stageX;
        oldY = evt.stageY;
    });

    stage.update();
}

function submitDigit() {
    var imageData = $("#canvasStage")[0].getContext("2d").getImageData(0,0,224,224);
    imageData = scaleImage(imageData);
    var normAlphaData = normalize(getAlphas(imageData));
    var reqData = {
        pixels: normAlphaData
    };
    console.log(reqData);
    $.ajax({
        method: "POST",
        url: NN_URL,
        data: reqData,
        success: function (data) {
            console.log(data);
            displayResponse(data);
        }
    });
}

function clearCanvas() {
    $("#reply").hide();

    oldX = undefined;
    oldY = undefined;
    //clear easeljs canvas
    shape.graphics.clear();
    stage.update();

    //clear scaled canvas
    var ctx = $('#scaledCanvas')[0].getContext("2d");
    ctx.clearRect(0, 0, 224, 224);
}

function displayResponse(data) {
    $("#digit").text(data);
    $("#reply").fadeIn();
}

function scaleImage(imageData) {
    var newCanvas = $("<canvas>")
        .attr("width", imageData.width)
        .attr("height", imageData.height)[0];

    newCanvas.getContext("2d").putImageData(imageData, 0, 0);

    var destCtx = $("#scaledCanvas")[0].getContext("2d");
    destCtx.scale(1/8, 1/8);
    destCtx.drawImage(newCanvas, 0, 0);
    destCtx.scale(8, 8); //scale back after drawing image, so it can be scaled again

    return destCtx.getImageData(0, 0, 28, 28);
}

function getAlphas(imageData) {
    var pixels = imageData.data;

    var alphas = [];

    // Loop over each pixel and invert the color.
    for (var i = 0; i < pixels.length; i += 4) {
        alphas.push(pixels[i+3]);
        // i+3 is alpha (the fourth element)
    }
    return alphas;
}

function normalize(data) {
    var normalized = [data.length];
    for (var i = 0; i < data.length; i++) {
        normalized[i] = data[i] / 255;
    }
    return normalized;
}
