const menuColors = [menuPink, menuYellow, menuGreen];
const scriptDirectives = 
[
    "Bienvenue au protocole calibration de votre object connecté! Tout d'abord, allongez-vous confortablement et insérez l'objet connecté.",
    "L'échelle située à gauche vous indique la force en Newtons de votre plancher pelvien. Testez-la en contractant et en relâchant votre plancher pelvien.",
    "Vous voici prêtes pour attamer la calibration! Pour les 15 prochaines secondes, relâchez votre plancher pelvien en respirant normalement.",
    "Pour les 15 prochaines secondes, relâchez d'abord votre plancher pelvien 5 secondes, puis contractez maximalement pour 10 secondes.",
    "Pour les 15 prochaines secondes, relâchez d'abord votre plancher pelvien 5 secondes, puis contractez rapidement et fortement 6 fois. N’oubliez pas de relâcher complètement entre chaque contraction.",
    "Pour les 20 prochaines secondes, relâchez d'abord votre plancher pelvien 5 secondes, puis toussez vigoureusement à trois reprises soit à 5, 10 et 15 secondes",
    "Bien joué! Vous pouvez maintenant entamer vos exercises!"
]

//directives square area
const dirPaddingLeft = screenWidth*0.25;
const dirPaddingRight = screenWidth*0.1;
const dirPaddingUp = screenHeight*0.2;
const dirPaddingDown = screenHeight*0.1;
const widthDirectives = screenWidth - (dirPaddingLeft + dirPaddingRight);
const heightDirectives = screenHeight - (dirPaddingUp + dirPaddingDown);

//title directives area
const titleDirFontSize = 20;
const titlePaddingLeft = 50;
const titlePaddingRight = 20;
const titleDirX = dirPaddingLeft + titlePaddingLeft;
const titleDirY = dirPaddingUp;
const widthTitleDir = widthDirectives/1.7;
const heightTitleDire = titleDirFontSize;

//Text area 
const textPaddingLeft = 20;
const textLeft = dirPaddingLeft + textPaddingLeft;
const textPaddingUp = dirPaddingUp + 40;
const textWidth =  widthDirectives - textPaddingLeft * 2;
const lineHeight = 25;

// Directives text fading time
const timeFadingText = 250; 

class ModeCalibration{

    constructor(){
        this.step = -1;
        this.numSteps = 6;
        this.textTimeStamp = gameTime; 
        this.isTextChanged = false;
        
        // Bind button click event
        const nextButton = document.getElementById("nextButton");
        nextButton.addEventListener("click", this.nextStep.bind(this));
    }

    nextStep() {
        // Wait for the transition of the text to be over.
        if(this.isTextChanged)
        {
            this.textTimeStamp = gameTime + timeFadingText;
            this.isTextChanged = false;
        }
    }

    draw(deltaMs){
        // Directives area in a rectangle
        drawRectangles(dirPaddingLeft, dirPaddingUp, widthDirectives, heightDirectives, white, mediumGray);

        // White background for title
        let title = "Directives";
        ctx.font = `${titleDirFontSize}px "Quicksand"`;
        const metricsTitle = ctx.measureText(title);

        drawRectangles(titleDirX - widthDirectives*0.01, titleDirY - titleDirFontSize/2, metricsTitle.width + titlePaddingRight, heightTitleDire, white, white);
        
        // Writing of the title of the directive box
        const centeredtitleDirY = titleDirY + (metricsTitle.emHeightAscent - metricsTitle.emHeightDescent) *0.5;
        ctx.fillStyle = darkGray;
        ctx.strokeStyle = '#000000';
        ctx.fillText(title, titleDirX, centeredtitleDirY);

        let step = 1;
        ///// Ne fonctionne plus demander a frank 
        if (debugInt != null){
            step = debugInt;
        }
        const radius = 6;
        const currentStepRadius = 14;   
        const numSteps = 7; 
        const spacingCircle = (widthTitleDir - (metricsTitle.width))/ numSteps + 1; 
        let circleX = titleDirX + metricsTitle.width + spacingCircle;
        const circleY = titleDirY;

        let text = scriptDirectives[this.step];
        ctx.font = '18px "Quicksand"';
        ctx.save();
        {
            const textTimeElapsed = gameTime - this.textTimeStamp;
            console.log(this.isTextChanged)
            if (!this.isTextChanged)
            {
                console.log(textTimeElapsed);
                if (textTimeElapsed >= 0)
                {
                    this.isTextChanged = true;
                    console.log(this.nextStep);
                    
                    this.step++;
                    // Reset to the first step if it goes beyond the last step
                    if (this.step > this.numSteps) 
                    {
                        this.step = 0; 
                    }
                }
            }
            const alpha = Math.round((Math.abs(textTimeElapsed) / timeFadingText)*255);
            ctx.fillStyle = mediumGray + colorToHex(alpha);
            wrapText(text, textLeft, textPaddingUp, textWidth, lineHeight)
        }
        ctx.restore();

        for (let i = 0; i < numSteps; i++)
        {
            if (this.step === (i))
            {
                let indexColor = i % 3 ; 
                let circleColor = menuColors[indexColor];
                circleX += (currentStepRadius - radius);
                drawCircle(circleX, circleY, currentStepRadius, circleColor, lightGray);
                
                const adjStep = this.step + 1; 
                let stepString = adjStep.toString();
                ctx.fillStyle = darkGray;
                ctx.strokeStyle = '#000000';
                ctx.font = `${titleDirFontSize}px "Quicksand"`;
                const metricsSteps = ctx.measureText(stepString);
                ctx.fillText(stepString, circleX - metricsSteps.width / 2, circleY + (metricsSteps.emHeightAscent - metricsSteps.emHeightDescent) * 0.5);
                
                circleX += (currentStepRadius - radius);
                
            }
            else
            {
                drawCircle(circleX, circleY, radius, lightGray, lightGray);
            }

            circleX += (radius + spacingCircle);    
        }

        drawScale(marginLeft + 10, marginUp + marginUp, gameplayHeight - marginUp, 5, scaleColor, 3)

        // Get current reading
        let currentForce = get_current_device_reading()[forceIndex];

        let forceRatio = (currentForce - minForce) / (maxForce - minForce);
        let clampedForceRatio = Math.min(Math.max(forceRatio, 0), 1);
        let forceY = marginUp + gameplayHeight * (1.0 - clampedForceRatio);

        ctx.drawImage(flowerPink, marginLeft + 10, forceY- 30/2, 30, 30);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = scaleColor;
        
        ctx.moveTo(marginLeft + 10 , forceY);
        ctx.lineTo( marginLeft - 25, forceY);
        ctx.stroke();

        let roundedForce = currentForce.toFixed(1)
        let forceString = roundedForce.toString();
        ctx.fillStyle = darkGray;
        ctx.strokeStyle = darkGray;
        ctx.font = '14px "Quicksand"';
        ctx.fillText(`${roundedForce} N`, marginLeft - 30, forceY - 10);
    }

}