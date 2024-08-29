
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

function setBackgroundColor(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
function drawRectangles(x, y, width, height, color, strokeColor){
    /*Set shadow properties
    ctx.shadowColor = lighterGray;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0; */
    
    ctx.beginPath();
    ctx.lineWidth = 2; 
    ctx.roundRect(x, y, width, height, [40]);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Reset shadow properties to avoid affecting other drawings
    //ctx.shadowColor = 'transparent';
}
function drawCurvedLines(x, y, nextX, nextY, color)
{    
    ctx.strokeStyle= color;
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

function drawFlower(x, y, ratio, count, petalLength, arrayStrength) 
{
    let numPetals = numSequences;
    let angleIncrement = 2 * Math.PI / numPetals; // Total 360 degrees (in radians) divided by the number of petals
    let petalWidth = petalLength / (numPetals*0.35)

    const fullPetalRatio = 1.0 / numPetals;

    let displayNum = 0; 

    for (let i = 0; i < numPetals; i++)
    {
        const petalFillColor = ((i % 2 == 0))? contractRectColor : relaxRectColor;
        //const petalStrokeColor = ((i % 2) == 0)? contractTargetColor : relaxTargetColor;
    
        const angle = i * angleIncrement + Math.PI*1.5;
        ctx.save(); // Save the current context state
        ctx.translate(x, y); // Move to the flower center
        ctx.rotate(angle);
        ctx.translate(-x, -y); // Move back to the original position

        const flowerRatioStart = fullPetalRatio * i;
        const flowerRatioEnd = fullPetalRatio * (i + 1);

        const scale = mapClamped(ratio, flowerRatioStart, flowerRatioEnd, 0.0, 1.0);
        const adjustedScale = 1 - Math.pow(1-scale, 2);

        drawPetals(x, y, petalLength, petalWidth, 1.0, lightGray, lightGray);
        drawPetals(x, y, petalLength, petalWidth, adjustedScale, petalFillColor, mediumGray);
        ctx.restore(); // Restore the context to its original state

        if (~~ adjustedScale == 1 && displayNum < numPetals)
        {
            displayNum += 1;
            //console.log(numPetals);
            //console.log(displayNum);
    
        }
    }
    drawCircle(x, y, petalLength/5, lighterMenuYellow, lightGray);
    ctx.globalAlpha = 1;
    ctx.fillStyle = mediumGray;
    ctx.strokeStyle = '#000000';
    if (displayNum != 0)
    {
        ctx.font = '14px "Ubuntu Mono"';

        if (displayNum > 9)
        {
            ctx.fillText(displayNum, x - 7, y + 5);
        }
        else 
        {
            ctx.fillText(displayNum, x - 3, y + 5);
        }
        
    }
 
    
}

function drawCircle(x, y, radius, fillColor, strokeColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

function drawStem(x, y, nextFlowerX, nextFlowerY, color, ratio, thickness)
{
    const numWaves = 3; // Number of waves
    const waveHeight = 3; // Adjust this value to change the wave amplitude

    ctx.lineWidth = thickness;

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
function colorToHex(color)
{
    const clampedColor = Math.max(0, Math.min(color, 255));
    return clampedColor.toString(16).padStart(2, '0');
}

function rgbToHex(r, g, b) 
{
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

function rgbaToHex(r, g, b, a) 
{
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');
    a = a.toString(16).padStart(2, '0');

    return `#${r}${g}${b}${a}`;
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
    var a = (Math.PI * 0.65 * Math.random()) + 2 * Math.PI/3;
    var v = 1 + Math.random() * 5 * speed;

    const sparklingPetal = {
        posX: x - 10, //+ Math.cos(a + random(-0.1, 0.1)) * random(0, 15), //** verifier si je garde 25 ou donne un dimension au cursor */
        posY: y, // Math.sin(a + random(-0.1, 0.1)) * random(0, 15),
        size: random(0, 1),
        rotation : Math.random()*360, //** a garder? */
        color: sparklingPetalsColors[~~random(0, 6)],
        shape: ~~random(1, 7),
        opacity: random(0.9, 1),
        decay: random(0.004, 0.01),
        vX : Math.cos(a) * v,
        vY : Math.sin(a) * v,
        rotationSpeed: random(-6, 6) // Random rotation speed for the spinning effect
    };
    return sparklingPetal;
}

function drawSparklingPetals(x, y, size, shape, rotation, fillColor, opacity)
{
    ctx.save(); // Save the current state of the canvas
    ctx.globalAlpha = opacity;

    //Translate to the (x, y) position
    ctx.translate(x, y);
    //Rotate by the given rotation
    ctx.rotate(rotation * Math.PI / 180);

    height = 10 + ( 5 * size); //** To be changed */
    width = 12 + ( 10 * size); //** To be changed */

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = ~~random(0, 3);
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
            ctx.arc(0, height / 3, width / 2, 0, Math.PI, false);
            break;

        case 4:
            ctx.ellipse(0, height / 2, width / 5, height /2, 0, 0, Math.PI * 2);
            break; 
        
        case 5:
            ctx.ellipse(0, height / 3, width / 4, height / 3, 0, 0, Math.PI * 2);
            break;
        
        case 6: 
            ctx.arc(0, height, width / 4, 0, Math.PI, false);
            break;
    }
    ctx.fill(); 
    ctx.stroke();
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
    const gravity = 0.01; // Gravity constant for downward force
    const trailling = 0.005;
    
    return sparkles.filter(
        (sparkle) => {
            sparkle.posX += sparkle.vX;
            sparkle.posY += sparkle.vY;
            sparkle.vY += gravity;
            sparkle.vX -= trailling; 
            sparkle.rotation += sparkle.rotationSpeed; // Update the rotation
            sparkle.opacity -= sparkle.decay;
            sparkle.size -= sparkle.decay;

            return (sparkle.opacity > 0 && sparkle.size > 0);
        }
    )
}

function addSparkles(sparkles, count, x, y, speed)
{
    // create the specified number of sparkles
    for (var i = 0; i < count; i++) {
        sparkle = createSparkle(x, y, speed);
        sparkles.push(sparkle);
    }   
}

function writeDirectives(x, y, fontSize, fontFamily, duration, strDirective)
{ 
    let countDown = Math.ceil(duration / 1000);

    //Fading out effect
    //let invRatio = (1000 - duration) / 1000;
    //if (duration < 1000){
    //    ctx.globalAlpha = 1.0 * invRatio;

    ctx.fillStyle = mediumGray;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = `${fontSize}px "${fontFamily}"`;

    ctx.beginPath();
    ctx.fillText(strDirective + ' dans ' + countDown, x, y);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1.0;
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * section not currently used
 */

// Function to draw a cloud
function drawCloud(x, y, ratio, isContour) {
    ctx.beginPath();
    ctx.moveTo(x/ ratio, y/ ratio);
    ctx.bezierCurveTo((x - 40)/ ratio, (y + 20)/ ratio, (x - 40)/ ratio, (y + 70)/ ratio, (x + 60)/ ratio, (y + 70)/ ratio);
    ctx.bezierCurveTo((x + 80)/ ratio, (y + 100)/ ratio, (x + 150)/ ratio, (y + 100)/ ratio, (x + 170)/ ratio, (y + 70)/ ratio);
    ctx.bezierCurveTo((x + 260)/ ratio, (y + 70)/ ratio, (x + 260)/ ratio, (y + 50)/ ratio, (x + 220)/ ratio, (y + 20)/ ratio);
    ctx.bezierCurveTo((x + 270)/ ratio, (y - 40)/ ratio, (x + 200)/ ratio, (y - 50)/ ratio, (x + 170)/ ratio, (y - 30)/ ratio);
    ctx.bezierCurveTo((x + 150)/ ratio, (y - 75)/ ratio, (x + 80)/ ratio, (y - 60)/ ratio, (x + 80)/ ratio, (y - 30)/ ratio);
    ctx.bezierCurveTo((x + 30)/ ratio, (y - 75)/ ratio, (x - 20)/ ratio, (y - 60)/ ratio, x/ ratio, y/ ratio);
    ctx.closePath();
    
    ctx.globalAlpha = 1.0/2.0 * ratio;

    if (isContour)
    {
        ctx.lineWidth = 1.5 * ratio;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    else
    {
        ctx.fillStyle = lightGray;
        ctx.fill();
    } 

    ctx.globalAlpha = 1.0;
}

function drawCloudCircle(x, y, radius, ratio, isContour)
{
    ctx.beginPath();
    let mvmt = Math.PI * ratio; 
    ctx.arc(x + Math.sin(mvmt), y + Math.sin(mvmt), radius, 0, 2 * Math.PI, false);

    ctx.globalAlpha = 1.0/2.0 * ratio;

    if (isContour)
    {
        ctx.lineWidth = 1.5 * ratio;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    else
    {
        ctx.fillStyle = lightGray;
        ctx.fill();
    } 

    ctx.globalAlpha = 1.0;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * section not currently used
 */

function drawAnimatedPellet(x, y, width, height, ratio, apparitionTime, endX, endY, endwidth, endHeight, color){
    
    //Set shadow properties
    if (ratio < 1.0)
    {
        ctx.save();
        {
            ctx.shadowColor = lighterGray;
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        
            let mvmtX = x - (x - endX)*ratio;
            let mvmtY = y - (y - endY)*ratio;
            let dynWidth = width - (width - endwidth)*ratio; 
            let dynHeight = height - (height - endHeight)*ratio;
        
            ctx.globalAlpha = apparitionTime;
            
            ctx.fillStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeStyle = lightGray;
            ctx.beginPath();
            ctx.roundRect(mvmtX, mvmtY, dynWidth, dynHeight, [40]);
            ctx.fill();
            ctx.stroke();
            
            ctx.shadowColor = 'transparent';
        
            let directive = 'Contractez dans'
            let dynFontSize = String(dynWidth/10);
            let fontFamily = "Ubuntu Mono"; 
        
            ctx.font = `${dynFontSize}px "${fontFamily}"`;
            ctx.fillStyle = '#000000';
            ctx.fillText(directive, mvmtX + dynWidth/10, mvmtY + dynHeight/1.8);
        }
        ctx.restore();
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** WRITING FUNCTIONS */

function wrapText(text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
}

