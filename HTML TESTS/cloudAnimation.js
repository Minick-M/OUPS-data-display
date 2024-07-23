
function animateCloud(deltaMs)
{
    // Get current reading
    let currentForce = get_current_device_reading()[forceIndex];

    const dotsTimeStart1 = 0; 
    const dotsTimeEnd1 = 500; 
    const ratioDots1 = mapClamped(gameTime, dotsTimeStart1, dotsTimeEnd1, 0.0, 1.0);

    const dotsTimeStart2 = 200; 
    const dotsTimeEnd2 = 700; 
    const ratioDots2 = mapClamped(gameTime, dotsTimeStart2, dotsTimeEnd2, 0.0, 1.0);

    const dotsTimeStart3 = 500; 
    const dotsTimeEnd3 = 900; 
    const ratioDots3 = mapClamped(gameTime, dotsTimeStart3, dotsTimeEnd3, 0.0, 1.0);


    const cloudAnimationTime = 1000;
    const sequenceCountDown = 1000;
    const cloudTimeStart = dotsTimeEnd3 - 200 ; // rectangleTime - (cloudAnimationTime + sequenceCountDown);
    const cloudTimeEnd = dotsTimeEnd3 + 700;
    const ratioCloud = mapClamped(gameTime, cloudTimeStart, cloudTimeEnd, 0.0, 1.0);

    //const adjustedRatioCloud = Math.sin(ratioCloud);
    const adjustedRatioCloud = Math.pow(2, Math.log(ratioCloud));

    let posDotsX = 340; 
    let posDotsY = 200;

    drawCloudCircle(posDotsX - posDotsX*0.01, posDotsY - posDotsY*0.01, 10, ratioDots1, 0)
    drawCLoudCircle(posDotsX + 30 - posDotsX*0.01, posDotsY + 20 - posDotsY*0.01, 8, ratioDots2, 0)
    drawCloudCircle(posDotsX + 60 - posDotsX*0.01, posDotsY + 30 - posDotsY*0.01, 6, ratioDots3, 0)

    drawCloudCircle(posDotsX, posDotsY, 10, ratioDots1, 1)
    drawCloudCircle(posDotsX + 30, posDotsY + 20, 8, ratioDots2, 1)
    drawCloudCircle(posDotsX + 60, posDotsY + 30, 6, ratioDots3, 1)

    let posCloudX = 180
    let posCloudY = 90
    
    drawCloud(posCloudX, posCloudY, adjustedRatioCloud, 0);
    drawCloud(posCloudX - posCloudX*0.05, posCloudY - posCloudY*0.05, adjustedRatioCloud, 1);
}

