function forceToPixel(force){
    return (screenHeight-marginDown) - (((force-minForce)/(maxForce-minForce))*gameplayHeight);
}

function timeToPixel(time){
    return currentTimeX + ((time)/gameplayTimeView)*gameplayWidth;
}

function clear(){
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
}

function drawDottedLine(x, y, length, isVertical, color, thickness){
    const segmentLength = 10;
    const gapLength = 5;

    // Vertical line
    if (isVertical){
        var i = y;
        
        while (i < y + length) {
            ctx.beginPath();
            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.moveTo(x, i);
            ctx.lineTo(x, i + segmentLength);
            ctx.stroke();
            i += segmentLength + gapLength;
        } 
    }
    // horizontal line
    else if (!isVertical) {
        var i = x;
        while (i < x + length) {
            ctx.beginPath();
            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.moveTo(i, y);
            ctx.lineTo(i + segmentLength, y);
            ctx.stroke();
            i += segmentLength + gapLength;
        }
    }
    
}
function drawScale(x, y, height, numScales, color, thickness){
    //vertical bar
    ctx.beginPath();
    ctx.strokeStyle = color; 
    ctx.lineWidth = thickness;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();

    //horizontal bars
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness/2;

    var scaleRatio =  height/(numScales-1)

    for (let i = 0; i < numScales; i++) {

        if (i==0 || i==numScales-1){
            var positionScale = i*scaleRatio
            ctx.moveTo(x - 6, y + positionScale);
            ctx.lineTo(x + 6, y + positionScale);
            ctx.stroke();
        }
        else{
            var positionScale = i*scaleRatio
            ctx.moveTo(x - 6, y + positionScale);
            ctx.lineTo(x, y + positionScale);
            ctx.stroke();
        }
    }

}
// Draw gradient color rectangle
function drawRectangles(x, y, width, height, color){
    //Set shadow properties
    //ctx.shadowColor = lighterGray;
    //ctx.shadowBlur = 5;
    //ctx.shadowOffsetX = 0;
    //ctx.shadowOffsetY = 0;

    ctx.fillStyle = color;
    //ctx.strokeStyle = mediumGray;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [40]);
    ctx.fill();
    ctx.stroke();

    // Reset shadow properties to avoid affecting other drawings
    ctx.shadowColor = 'transparent';
}

function drawHistogram(x, y, width, height, color){
    //Set shadow properties
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;


    ctx.globalAlpha = 0.2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [5, 5, 0, 0]);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Reset shadow properties to avoid affecting other drawings
    ctx.shadowColor = 'transparent';
}