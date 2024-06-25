const sequenceDuration = 5000; //***Doit etre changer dynamiquement
const numSequences = 50;
const sequenceGap = 500;  //in millisecs

var rectangleTime = 7000; //in millisecs
var rectangleIndex = 0; 
var loopRectangle = 7000;
var singStarSequenceTimes = []; //TEMPORAIRE tests

for (let i = 0; i < numSequences; i++){
    let sequence = rectangleTime + sequenceDuration*i + sequenceGap*i
    singStarSequenceTimes.push({time: sequence, forceRatio: ((i % 2) == 0)? 1 : 0});
}
console.log(singStarSequenceTimes);

function gameModeSingStarDraw(deltaMs){
    
    if (is_connected || is_emulating){
        gameTime += deltaMs;
    }

    let currentForce = 0

    // Read force depending on the source (device or mouse)
    let get_current_reading = null;

    if (is_emulating){
      get_current_reading = get_current_mouse_reading;
    }
    else{
      get_current_reading = get_current_device_reading;
    }

    // Get current reading
    currentForce = get_current_reading()[forceIndex];

    let forceRatio = (currentForce - minForce) / (maxForce - minForce);
    let clampedForceRatio = Math.min(Math.max(forceRatio, 0), 1);
    let forceY = marginUp + gameplayHeight * (1.0 - clampedForceRatio);

    //drawing rectangle
    let rectWidth = ((sequenceDuration/gameplayTimeView)*gameplayWidth);
    let rectHeight = (forceTolerance/(maxForce-minForce)*gameplayHeight);
    let rectColor = ((rectangleIndex % 2) == 0)? contractRectColor : relaxRectColor;

    if (rectangleTime + sequenceDuration -gameTime < -sequenceDuration){
        rectangleTime = gameTime + loopRectangle
    };

    if (gameTime >= singStarSequenceTimes[rectangleIndex].time && gameTime <= singStarSequenceTimes[rectangleIndex].time + sequenceDuration){
        let force = singStarSequenceTimes[rectangleIndex].forceRatio * patientMaxForce;
    
        if (currentForce > force + forceTolerance/2 || currentForce < force - forceTolerance/2){
            //force too high
            rectColor = offTargetColor;
            cursorDrawColor = offTargetColor;
            //drawing of the text
            ctx.drawImage(warning, textPaddingLeft, textPaddingDown);
        }
        else if (currentForce >= force - forceTolerance/2 && currentForce <= force + forceTolerance/2){
            //force within the accepted tolerance of the target
            rectColor = ((rectangleIndex % 2) == 0)? contractTargetColor : relaxTargetColor;
            cursorDrawColor = ((rectangleIndex % 2) == 0)? contractRectColor : relaxRectColor;;
        }
        
    } else if (gameTime > singStarSequenceTimes[rectangleIndex].time + sequenceDuration){
        ++ rectangleIndex;
    }
    
    // Update the flower cursor positions array
    //*** Je pourrais peut-etre lutiliser pour montrer le tracer total a la fin???
    cursorPositions.push({ time: gameTime, y: forceY, color: cursorDrawColor });

    //****Limit the number of stored positions to avoid memory issues (utile???)
    //*** a updater avec passed gameTime.
    if (cursorPositions.length > 1000) {
        cursorPositions.shift();
    }
    
    // Draw the line following the flower cursor
    if (cursorPositions.length > 1){
        
        ctx.lineWidth = 0;
        let lastX = -1;
        for (let i = 0; i < cursorPositions.length -1; i++) {
            ctx.beginPath();
            let a = cursorPositions[i];
            let b = cursorPositions[i + 1];
            let aX = Math.floor(timeToPixel(a.time - gameTime));
            let bX = timeToPixel(b.time - gameTime);

            lastX = aX;

            ctx.moveTo(aX, a.y);
            ctx.lineTo(aX, screenHeight);
            ctx.lineTo(bX, screenHeight);
            ctx.lineTo(bX,b.y);
            ctx.lineTo(aX, a.y);

            //Create a vertical gradient from the color of the max rectangle to the color of lower rectangle
            let gradient = ctx.createLinearGradient(0, screenHeight*0.75, 0, screenHeight);
            gradient.addColorStop(0, a.color);
            gradient.addColorStop(1, 'white');

            ctx.fillStyle = gradient;
            ctx.closePath();
            ctx.fill();
        }
    }

    //Drawing to left side scale
    drawScale(marginLeft, marginUp, gameplayHeight, 5, scaleColor, 2)
   
    //drawing of vertical dotted lines of the cursor
    drawDottedLine(currentTimeX, marginUp, gameplayHeight, 1, dottedLineColor, 1)

    for (let i = 0; i<singStarSequenceTimes.length; i++){
        let rectX = timeToPixel(singStarSequenceTimes[i].time - gameTime);
        let force = ((i % 2) == 0)? patientMaxForce : baselineForce;
        let rectY = forceToPixel(force) - rectHeight/2;
        let barColor = ((i % 2) == 0)? contractRectColor : relaxRectColor;
        
        let color = i == rectangleIndex? rectColor : barColor; 
        drawRectangles(rectX, rectY, rectWidth, rectHeight, color);
    }

    if (cursorPositions.length > 1){
        //Draw line 
        ctx.beginPath();
        ctx.strokeStyle = cursorLineColor; 
        ctx.lineWidth = 1.5;
        let x = timeToPixel(cursorPositions[0].time - gameTime);
        ctx.moveTo(x, cursorPositions[0].y);

        for (let i = 0; i < cursorPositions.length -1; i++) {
            x = timeToPixel(cursorPositions[i].time - gameTime);
            ctx.lineTo(x, cursorPositions[i].y);
            //drawRectangles(x, cursorPositions[i].y, 2, 2, cursorDrawColor);
        }
        ctx.stroke(); 
    }

    //drawing of horizontal dotted lines of the cursor
    drawDottedLine(marginLeft-20, forceY, gameplayWidth, 0, dottedLineColor, 1)

    //drawing the max flower
    let flowerY = forceToPixel(patientMaxForce);
    ctx.drawImage(flowerPink, marginLeft-10, flowerY-10);
    
    //drawing of the flower cursor
    ctx.drawImage(yellowFlower, currentTimeX-yellowFlower.width, forceY-yellowFlower.height, 25, 26);

    //drawing of the buttons
    ctx.drawImage(playButton, gameplayWidth, 125, 32, 32); //*** Changer positionnement. 
    ctx.drawImage(replayButton, gameplayWidth, 125 + 35, 32, 32);
    ctx.drawImage(helpButton, gameplayWidth, 125 + 70, 32, 32);
    ctx.drawImage(cancelButton, gameplayWidth, 125 + 105, 32, 32);
    ctx.drawImage(progressionBar, gameplayWidth -40, 5);

}
