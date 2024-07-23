
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

function mapClamped(value, min, max, mapMin, mapMax)
{
    let mapRatio = (value - min) / (max - min);
    mapRatio = Math.min(Math.max(mapRatio, 0), 1);

    return mapMin + mapRatio * (mapMax - mapMin);
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
function drawCurvedLines(x, y, nextX, nextY, color)
{    
    ctx.strokeColor= color;
    let widthCurves = (nextX - x)/ 2 ; 
    let curvedX = x + widthCurves;
    let curvedY = (y < nextY)? y + widthCurves : y - widthCurves;
    let nextCurvedX = nextX - widthCurves;
    let nextCurvedY = (y < nextY)? nextY - widthCurves : nextY + widthCurves;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(curvedX, y, curvedX, curvedY);
    ctx.moveTo(nextX, nextY);
    ctx.quadraticCurveTo(nextCurvedX, nextY, nextCurvedX, nextCurvedY);
    ctx.lineTo(curvedX, curvedY);
    ctx.stroke();
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

function drawPetals(x, y, length, width, scale, fillColor, strokeColor, opacity=1)
{
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x-width * scale, y+length * scale, x + width * scale, y+length * scale, x, y)

    ctx.fill();
    ctx.stroke();

}

function drawFlower(x, y, ratio, petalLength, arrayStrength) 
{
    let numPetals = numSequences;
    let angleIncrement = 2 * Math.PI / numPetals; // Total 360 degrees (in radians) divided by the number of petals
    let petalWidth = petalLength / (numPetals*0.35)

    const fullPetalRatio = 1.0 / numPetals;


    for (let i = 0; i < numPetals; i++)
    {
        const petalFillColor = ((i % 2 == 0))? contractRectColor : relaxRectColor;
        const petalStrokeColor = ((i % 2) == 0)? contractTargetColor : relaxTargetColor;
    
        const angle = i * angleIncrement + Math.PI*1.5;
        ctx.save(); // Save the current context state
        ctx.translate(x, y); // Move to the flower center
        ctx.rotate(angle);
        ctx.translate(-x, -y); // Move back to the original position

        const flowerRatioStart = fullPetalRatio * i;
        const flowerRatioEnd = fullPetalRatio * (i + 1);

        const scale = mapClamped(ratio, flowerRatioStart, flowerRatioEnd, 0.0, 1.0);
        const adjustedScale = 1 - Math.pow(1-scale, 2);

        drawPetals(x, y, petalLength, petalWidth, 1.0, lighterGray, lighterGray);
        drawPetals(x, y, petalLength, petalWidth, adjustedScale, petalFillColor, petalStrokeColor);
        ctx.restore(); // Restore the context to its original state
    }
}

function drawStem(x, y, nextFlowerX, nextFlowerY, color, ratio)
{
    const numWaves = 3; // Number of waves
    const waveHeight = 3; // Adjust this value to change the wave amplitude

    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);

    const precisionCount = 250;
    const xStep = (nextFlowerX - x) / precisionCount;
    const yStep = (nextFlowerY - y) / precisionCount;

    
    for(let i = 0; i < precisionCount * ratio; ++i)
    {
        const sineY = Math.sin((i / precisionCount) * Math.PI * 2 * numWaves) * waveHeight;
        ctx.lineTo(x + xStep * i, y + yStep * i + sineY);
    }

    ctx.stroke();
}

function hexToRgb(hex) 
{
    const r = parseInt(hex[1] + hex[2], 16);
    const g = parseInt(hex[3] + hex[4], 16);
    const b = parseInt(hex[5] + hex[6], 16);

    return { r, g, b };
}

function rgbToHex(r, g, b) 
{
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

function lerpColor(color1, color2, t) 
{
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
  
    const r = Math.round(rgb1.r + t * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + t * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + t * (rgb2.b - rgb1.b));
  
    return rgbToHex(r, g, b);
}

/* functions related to the sparkles animation:
    Random(min, max)
    create sparkles 

*/
function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createSparkle(x, y, speed) 
{
    // set up velocities:
    //var a = Math.PI * 2 * Math.random();
    //var v = (Math.random() - 0.5) * 30 * speed;
    var a = (Math.PI * 0.8 * Math.random()) + 2 * Math.PI/3;
    var v = 0.5 + Math.random() * 5 * speed;

    const sparklingPetal = {
        posX: x + Math.cos(a + random(-0.1, 0.1)) * random(0, 15), //** verifier si je garde 25 ou donne un dimension au cursor */
        posY: y + Math.sin(a + random(-0.1, 0.1)) * random(0, 15),
        size: random(0, 1),
        rotation : Math.random()*360, //** a garder? */
        color: sparklingPetalsColors[~~random(0, 6)],
        shape: ~~random(1, 5),
        opacity: random(0.8, 1),
        decay: random(0.004, 0.007),
        vX : Math.cos(a) * (v + 1),
        vY : Math.sin(a) * v,
        rotationSpeed: random(-2, 2) // Random rotation speed for the spinning effect
    };
    return sparklingPetal;
}

function drawSparklingPetals(x, y, size, shape, rotation, fillColor, opacity)
{
    console.log(shape);
    ctx.save(); // Save the current state of the canvas
    ctx.globalAlpha = opacity;

    //Translate to the (x, y) position
    //ctx.translate(x, y);
    //Rotate by the given rotation
    //ctx.rotate(rotation * Math.PI / 180);

    height = 5 + ( 5 * size); //** To be changed */
    width = 4 + ( 10 * size); //** To be changed */

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = fillColor;
    ctx.beginPath();
    switch (shape) {
        case 1: 
            ctx.bezierCurveTo(-width, height, width, height, 0, 0);
            ctx.bezierCurveTo(width, height, -width, height, 0, 0);
            break;
        case 2:
            ctx.bezierCurveTo(-width, height, width, height, 0, 0);
            break;
        case 3: 
            ctx.arc(0, height / 2, width / 2, 0, Math.PI, false);
            break;
        case 4:
            ctx.ellipse(0, height / 2, width / 4, height / 2, 0, 0, Math.PI * 2);
            break; 
    }
    ctx.fill(); 
    ctx.stroke();

    //debugger;

    ctx.globalAlpha = 1 // Reset the globalAlpha to 1 after drawing
    ctx.restore(); // Restore the canvas state
    
}

function drawSparkles(sparkles)
{
    sparkles.forEach(
        (sparkle) => { 
            drawSparklingPetals(sparkle.posX, sparkle.posY, sparkle.size, sparkle.shape, sparkle.rotation, sparkle.color, sparkle.opacity) 
        }
    )
}

function updateSparkles(sparkles) 
{
    const gravity = 0.2; // Gravity constant for downward force
    
    return sparkles.filter(
        (sparkle) => {
            sparkle.posX += sparkle.vX;
            sparkle.posY += sparkle.vY + gravity;
            sparkle.rotation += sparkle.rotationSpeed; // Update the rotation
            sparkle.opacity -= sparkle.decay/2;
            sparkle.size -= (sparkle.decay);

            return (sparkle.opacity > 0);
        }
    )
}

function addSparkles(sparkles, count, x, y, speed)
{
    //console.log('y = ' + y);

    // create the specified number of sparkles
    for (var i = 0; i < count; i++) {
        sparkle = createSparkle(x, y, speed);
        sparkles.push(sparkle);
    }
    //console.log(sparkles);    
}