
function animatePellet(deltaMs)
{
    
    if (is_connected || is_emulating)
    {
        gameTime += deltaMs;
    }

    let currentForce = 0

    // Read force depending on the source (device or mouse)
    let get_current_reading = null;

    if (is_emulating)
    {
      get_current_reading = get_current_mouse_reading;
    }
    else
    {
      get_current_reading = get_current_device_reading;
    }


    const pelletAnimationTime = 1000;
    const countDown = 3000;
    const pelletTimeStart = 3000 - (pelletAnimationTime + countDown);
    const pelletTimeEnd = 5000 + 700;
    const ratioPellet = mapClamped(gameTime, pelletTimeStart, pelletTimeEnd, 0.0, 1.0);

    //const adjustedRatioCloud = Math.sin(ratioCloud);
    //const adjustedRatioCloud = Math.pow(2, Math.log(ratioCloud));

    let posPelletX = timeToPixel(currentTimeX); 
    let posPelletY = forceToPixel(patientMaxForce);;
   
    drawAnimatedPellet(posPelletX, posPelletY, 300, 50, ratioPellet, 400, 50, 100, 20, mediumGray)
}

