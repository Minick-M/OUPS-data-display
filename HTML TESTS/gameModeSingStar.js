
// Duration and sequence control constants
const sequenceDuration = 5000; // Duration of a single sequence
const numSequences = 6; // Total number of sequences in the game
const numSeries = 3; 
const sequenceGap = 300;  // Gap between sequences in milliseconds
const pauseDuration = 10000; 
const sparklingPetalsColors = ['#dfebe9', '#fef8d2', '#fce6e2', '#C4E1DA', '#FFDEDA', '#FCEA81']


var rectangleTime = 7000; //time before the first rectangle shown hits the cursor
var rectangleIndex = 0; 
var loopRectangle = 7000;
var singStarSequenceTimes = []; //TEMPORAIRE tests
var sparkles = [];

// Calculate and store the times and force of each sequence
const serieDuration = numSequences * (sequenceDuration + sequenceGap) + pauseDuration + sequenceGap*2;
let timeStart = rectangleTime; 
for (let j = 0; j < numSeries; j ++)
{
    for (let i = 0; i < numSequences; i++)
    {
        const timeEnd = timeStart + sequenceDuration;
        singStarSequenceTimes.push({timeStart: timeStart, timeEnd: timeEnd, forceRatio: ((i % 2) == 0)? 1 : 0, isPause: false});
    
        timeStart = timeEnd + sequenceGap; 
    }
    if (j < numSeries - 1)
    {
        const timeEnd = timeStart + pauseDuration;
        singStarSequenceTimes.push({timeStart: timeStart, timeEnd: timeEnd, forceRatio: 0 , isPause: true});
        timeStart = timeEnd + sequenceGap; 
    }
    
}
//console.log(singStarSequenceTimes);

function getRectColor(index)
{
    if (singStarSequenceTimes[index].isPause)
    {
        return pauseColor;
    }
    else if (singStarSequenceTimes[index].forceRatio == 0)
    {
        return relaxRectColor;
    }
    else 
    {
        return contractRectColor;
    }
}

function getTargetColor(index)
{
    if (singStarSequenceTimes[index].isPause)
    {
        return pauseTargetColor;
    }
    else if (singStarSequenceTimes[index].forceRatio == 0)
    {
        return relaxTargetColor;
    }
    else 
    {
        return contractTargetColor;
    }
}

function gameModeSingStarDraw(deltaMs)
{
    // Get current reading
    let currentForce = get_current_device_reading()[forceIndex];

    let forceRatio = (currentForce - minForce) / (maxForce - minForce);
    let clampedForceRatio = Math.min(Math.max(forceRatio, 0), 1);
    let forceY = marginUp + gameplayHeight * (1.0 - clampedForceRatio);

    if (gameTime > singStarSequenceTimes[rectangleIndex].timeEnd)
    {
        ++ rectangleIndex;
    }

    let rectColor;
    if (singStarSequenceTimes[rectangleIndex].isPause)
    {
        rectColor = pauseColor;
    }
    else
    {
        rectColor = singStarSequenceTimes[rectangleIndex].forceRatio <= 0 ? relaxRectColor : contractRectColor;
    }

     // Change color and text based on whether the current force is within the target range
    if (gameTime >= singStarSequenceTimes[rectangleIndex].timeStart)
    {
        let force = singStarSequenceTimes[rectangleIndex].forceRatio * patientMaxForce;
    
        if (currentForce > force + forceTolerance/2 || currentForce < force - forceTolerance/2)
        {
            //force too high or low
            //rectColor = offTargetColor;
            cursorDrawColor = offTargetColor;
            //drawing of the text
            //ctx.drawImage(warning, textPaddingLeft, textPaddingDown);

        }
        else
        {
            rectColor = getTargetColor(rectangleIndex);
            //force within the accepted tolerance of the target
            if (singStarSequenceTimes[rectangleIndex].isPause)
            {
                cursorDrawColor = pauseColor;
            }
            else
            {
                cursorDrawColor = singStarSequenceTimes[rectangleIndex].forceRatio == 0 ? relaxRectColor : contractRectColor;
            }

            // Trailing sparkles (made of flower petals)
            let sparkleY = forceToPixel(force);
            addSparkles(sparkles, Math.random()-0.7, currentTimeX, sparkleY, 0.1);
            
        }
    }
    else if (rectangleIndex > 0)
    {
        const forceMin = Math.min(singStarSequenceTimes[rectangleIndex].forceRatio, singStarSequenceTimes[rectangleIndex-1].forceRatio) * patientMaxForce;
        const forceMax = Math.max(singStarSequenceTimes[rectangleIndex].forceRatio, singStarSequenceTimes[rectangleIndex-1].forceRatio) * patientMaxForce;

        //console.log('gap', forceMin, forceMax);
        //within the gap before current rectangle
        if (currentForce > forceMax + forceTolerance/2 || currentForce < forceMin - forceTolerance/2)
        {
            //force too high or low
            //rectColor = offTargetColor;
            cursorDrawColor = offTargetColor;
            //drawing of the text
            //ctx.drawImage(warning, textPaddingLeft, textPaddingDown);
        }
        else
        {
            const lastColor = getRectColor(rectangleIndex-1);
            const currentColor = getRectColor(rectangleIndex);

            const gapTimeLeft = singStarSequenceTimes[rectangleIndex].timeStart - gameTime;
            const gapTimeLeftRatio = gapTimeLeft / sequenceGap;

            cursorDrawColor = lerpColor(currentColor, lastColor, gapTimeLeftRatio);
        }
    }
    
    // Update the flower cursor positions array
    //*** Je pourrais peut-etre lutiliser pour montrer le tracer total a la fin???
    cursorPositions.push({ time: gameTime, y: forceY, color: cursorDrawColor });
    

    //Limit the number of stored positions to avoid memory issues
    if (cursorPositions.length > 1000) 
    {
        cursorPositions.shift();
    }
    
    // Draw the line following the flower cursor
    if (cursorPositions.length > 1)
    {
        
        ctx.lineWidth = 0;
        for (let i = 0; i < cursorPositions.length -1; i++) 
        {
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
            //ctx.save();
            //ctx.globalAlpha = 0.8;
            ctx.closePath();
            ctx.fill();
            //ctx.restore()
        }
    }

    let rectX = 0;
    let rectY = 0;
    let previousX = 0; 
    let previousY = 0;
    // Draw rectangles indicating the target force and duration
    let rectHeight = (forceTolerance/(maxForce-minForce)*gameplayHeight);
    for (let i = 0; i<singStarSequenceTimes.length; i++)
    {
        rectX = timeToPixel(singStarSequenceTimes[i].timeStart - gameTime);
        let force = singStarSequenceTimes[i].forceRatio <= 0 ? baselineForce : patientMaxForce;
        rectY = forceToPixel(force) - rectHeight/2;
        let barColor; 
        if (singStarSequenceTimes[i].isPause) 
        {
            barColor = pauseColor;
        }
        else 
        {
            barColor = singStarSequenceTimes[i].forceRatio <= 0 ? relaxRectColor : contractRectColor;  
        }
        
        let color = (i == rectangleIndex)? rectColor : barColor; 
        const rectDuration = singStarSequenceTimes[i].timeEnd - singStarSequenceTimes[i].timeStart;
        let rectWidth = ((rectDuration/gameplayTimeView)*gameplayWidth);

        drawRectangles(rectX, rectY, rectWidth, rectHeight, color);

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const durationCountDown = 2000; // 3 secondes
        const directiveStart = rectangleTime - durationCountDown;
        const directiveEnd = rectangleTime;
        const countDown = ~~(durationCountDown - (gameTime - directiveStart));
        let dirX = rectX + 10;
        let dirY = rectY - rectHeight/2;
        let fontSize = String((forceTolerance + 2) * 8);
        let fontFamily = 'sans serif';
        let strDirective = 'Contractez';

        if (gameTime >= directiveStart && gameTime <= directiveEnd)
        {
            writeDirectives(dirX, dirY, fontSize, fontFamily, countDown, strDirective);

        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        if (i !== 0 && i !== singStarSequenceTimes.length - 1) {
            drawCurvedLines(previousX, previousY, rectX, rectY + rectHeight/2, curvedLineColor);
        }

        previousX = rectX + rectWidth; 
        previousY = rectY + rectHeight/2;
    }

    if (cursorPositions.length > 1)
    {
        // Draw a line following the flower cursor
        ctx.beginPath();
        ctx.strokeStyle = cursorLineColor; 
        ctx.lineWidth = 1.5;
        let x = timeToPixel(cursorPositions[0].time - gameTime);
        ctx.moveTo(x, cursorPositions[0].y);

        for (let i = 0; i < cursorPositions.length -1; i++) 
        {
            x = timeToPixel(cursorPositions[i].time - gameTime);
            ctx.lineTo(x, cursorPositions[i].y);
        }

        ctx.stroke(); 
    }

    sparkles = updateSparkles(sparkles);
    drawSparkles(sparkles);

    // Draw horizontal dotted lines indicating current force level
    drawDottedLine(marginLeft-20, forceY, gameplayWidth, 0, dottedLineColor, 1)

    //drawing of the flower cursor
    ctx.drawImage(yellowFlower, currentTimeX-yellowFlower.width-5, forceY-yellowFlower.height-5, 30, 30);

    // Draw images for UI controls and indicators
    ctx.drawImage(playButton, gameplayWidth, 125, 32, 32); //*** Changer positionnement. 
    ctx.drawImage(replayButton, gameplayWidth, 125 + 35, 32, 32);
    ctx.drawImage(helpButton, gameplayWidth, 125 + 70, 32, 32);
    ctx.drawImage(cancelButton, gameplayWidth, 125 + 105, 32, 32);
   

    durationPetal = sequenceDuration + sequenceGap;

    // Progression flowers dimensions and esthetics
    let progFlowerDim = 100;
    let petalHeight = progFlowerDim / 2 ;
    let numFlowers = numSeries;
    let progFillColor = lightGray;

    //Placement progression flowers
    const baseFlowerSpacing = 120; 
    let spacingFlowers = baseFlowerSpacing; 
    let progFlowerX = screenWidth - progPaddingRight - (numFlowers - 1) * spacingFlowers; // To draw starting on the right most side
    let progFlowerY = progPaddingUp + petalHeight;
    let nextFlowerX = progFlowerX + spacingFlowers;
    let flowerCount = 0; 


    const fullFlowerDuration = numSequences * (sequenceDuration + sequenceGap); 


    for (i = 0; i < numFlowers; i++)
    {
        flowerCount += 1; 
        if (i < numFlowers - 1)
        {
            const stemTimeStart = rectangleTime + (fullFlowerDuration + pauseDuration + sequenceGap) * i + fullFlowerDuration;
            const stemTimeEnd = stemTimeStart + pauseDuration;

            const ratio = mapClamped(gameTime, stemTimeStart, stemTimeEnd, 0.0, 1.0);

            drawStem(progFlowerX + petalHeight * 0.5, progFlowerY, nextFlowerX - 5, progFlowerY, progFillColor, 1, 6);
            drawStem(progFlowerX + petalHeight * 0.5, progFlowerY, nextFlowerX - 5, progFlowerY, darkerMenuYellow, ratio, 3);
        }
        const flowerTimeStart = rectangleTime + (fullFlowerDuration + pauseDuration + sequenceGap) * i;
        const flowerTimeEnd = flowerTimeStart + fullFlowerDuration;

        const ratio = mapClamped(gameTime, flowerTimeStart, flowerTimeEnd, 0.0, 1.0);

        drawFlower(progFlowerX, progFlowerY, ratio, flowerCount, petalHeight, singStarSequenceTimes);
        progFlowerX = progFlowerX + spacingFlowers;
        nextFlowerX = progFlowerX + spacingFlowers;

    }

    // Draw scales and dotted lines for visual guides
    drawScale(marginLeft, marginUp + marginUp, gameplayHeight - marginUp, 5, scaleColor, 2)
    drawDottedLine(currentTimeX, marginUp, gameplayHeight, 1, dottedLineColor, 1)

    /**
     * Section drawing of the animated pellets giving directives to the patient by contractions and relaxations
     
    const pelletAnimationTime = 500;
    const countDown = 3000;
    const pelletTimeStart = rectangleTime - (pelletAnimationTime + countDown);
    const pelletTimeEnd = rectangleTime;
    const ratioPellet = mapClamped(gameTime, pelletTimeStart, pelletTimeEnd, 0.0, 1.0);
    const ratioApparitionPellet = mapClamped(gameTime, pelletTimeStart, pelletTimeStart + pelletAnimationTime, 0.0, 1.0);

    let posPelletX = timeToPixel(currentTimeX); 
    let posPelletY = forceToPixel(patientMaxForce);

    let endPelletX = timeToPixel(rectangleTime - gameTime);
    let endPelletY = forceToPixel(patientMaxForce) - rectHeight/2;

    if (gameTime >= pelletTimeStart)
    {
        drawAnimatedPellet(posPelletX, posPelletY, 300, 50, ratioPellet, ratioApparitionPellet, endPelletX, endPelletY, 100, 20, lighterMenuPink)

    } 
    */
    
}
