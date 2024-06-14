const sequenceDuration = 5000; //***Doit etre changer dynamiquement
const numSequences = 50;
const sequenceGap = 500;  //in millisecs

var rectangleTime = 7000; //in millisecs
var rectangleIndex = 0; 
var loopRectangle = 7000;

var singStarSequenceTimes = []; //TEMPORAIRE tests

for (let i = 0; i < numSequences; i++){
    let sequence = rectangleTime + sequenceDuration*i + sequenceGap*i
    singStarSequenceTimes.push(sequence);
}


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
    let rectColor = rectangleColor;

    if (rectangleTime + sequenceDuration -gameTime < -sequenceDuration){
        rectangleTime = gameTime + loopRectangle
    };

    if (gameTime >= singStarSequenceTimes[rectangleIndex] && gameTime <= singStarSequenceTimes[rectangleIndex] + sequenceDuration){
        let force = ((rectangleIndex % 2) == 0)? patientMaxForce : baselineForce;
        if (currentForce > force + forceTolerance/2){
            //force too high
            rectColor = overColor;
            //drawing of the text
            ctx.drawImage(warning, textPaddingLeft, textPaddingDown);
        }
        else if (currentForce < force - forceTolerance/2){
            //force too low
            rectColor = underColor;
            //drawing of the text
            ctx.drawImage(warning, textPaddingLeft, textPaddingDown);
        }
        else {
            //force within the accepted tolerance of the target
            rectColor = onTargetColor;
        }
    } else if (gameTime > singStarSequenceTimes[rectangleIndex] + sequenceDuration){
        ++ rectangleIndex;
    }
    
    // Update the flower cursor positions array
    //*** Je pourrais peut-etre lutiliser pour montrer le tracer total a la fin???
    cursorPositions.push({ time: gameTime, y: forceY, color: rectColor });

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

            if (aX < lastX + 3){
                //continue;
            }
            lastX = aX;

            ctx.moveTo(aX, a.y);
            ctx.lineTo(aX, screenHeight);
            ctx.lineTo(bX, screenHeight);
            ctx.lineTo(bX,b.y);
            ctx.lineTo(aX, a.y);

            //Create a vertical gradient from the color to white
            let gradient = ctx.createLinearGradient(0, screenHeight*0.75, 0, screenHeight);
            gradient.addColorStop(0, a.color);
            gradient.addColorStop(1, 'white');

            ctx.fillStyle = gradient;
            ctx.closePath();
            ctx.fill();

            /*
            // Create a horizontal gradient from the color to the next color
            let horizontalGradient = ctx.createLinearGradient(aX, 0, bX, 0);
            horizontalGradient.addColorStop(0, a.color);
            horizontalGradient.addColorStop(1, b.color);
            
            // Draw the area with the horizontal gradient with some transparency
            //ctx.globalAlpha = 0.5 ;  // Adjust the alpha as needed
            ctx.fillStyle = horizontalGradient;
            ctx.moveTo(aX, a.y);
            ctx.lineTo(bX, b.y);
            ctx.lineTo(bX, screenHeight);
            ctx.lineTo(aX, screenHeight);
            ctx.closePath();
            ctx.fill();

            // Reset the alpha to default
            //ctx.globalAlpha = 1.0;
            */ 
        }

    }

    //Drawing to left side scale
    drawScale(marginLeft, marginUp, gameplayHeight, 5, mediumGray, 2)
   
    //drawing of vertical dotted lines of the cursor
    drawDottedLine(currentTimeX, marginUp, gameplayHeight, 1, lightGreen, 1)
    

    for (let i = 0; i<singStarSequenceTimes.length; i++){
        let rectX = timeToPixel(singStarSequenceTimes[i] - gameTime);
        let force = ((i % 2) == 0)? patientMaxForce : baselineForce;
        let rectY = forceToPixel(force) - rectHeight/2;
        let color = i == rectangleIndex? rectColor : rectangleColor; 
        drawRectangles(rectX, rectY, rectWidth, rectHeight, color)
    }

    if (cursorPositions.length > 1){
    
        //Draw line 
        ctx.beginPath();
        ctx.strokeStyle = cursorDrawColor; 
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
    drawDottedLine(marginLeft-20, forceY, gameplayWidth, 0, lightGreen, 1)

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

    //drawing outer circle
    /*
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.lineCap = "butt";
    ctx.strokeStyle = brightPink;
    ctx.arc(cercleX,screenHeight / 2,90,0,2*Math.PI);
    ctx.stroke();
    
    // Advancing inner circle
    cercleRatio += deltaMs / 10000;
    if(cercleRatio > 1.0)
    {
        cercleRatio = 0;
    }

    //drawing inner circle
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = lightPink;
    ctx.lineCap = "round";
    ctx.arc(cercleX,screenHeight / 2,90,0,2*Math.PI*cercleRatio);
    ctx.stroke();

    // Moving circle with wrap around
    cercleX += (screenWidth/5000)*deltaMs;
    if (cercleX >= screenWidth + 95){
        cercleX = -95
    }
    */ 
}
