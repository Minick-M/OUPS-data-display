
const isLocalServer = window.location.href.startsWith("http://127.0.0.1");
const isCheatEnabled = isLocalServer;

var isPaused = false;

if(isCheatEnabled)
{
    document.addEventListener('keydown', function(event) 
    { 
        if(cheatInputEvent(event.key))
        {
            event.preventDefault();
        }
    });
}

function changeTimeScale(sign)
{
    if(sign > 0)
    {
        timeScale *= 2;
    }
    else if(sign < 0)
    {
        timeScale /= 2;
    }
    else
    {
        timeScale = 1.0;
    }

    console.log(`timescale: ${timeScale}`);
}

function cheatInputEvent(key)
{
    if(!isCheatEnabled)
    {
        return;
    }

    switch(key)
    {
        case '=':
            changeTimeScale(1);
            return true;
        case '-':
            changeTimeScale(-1);
            return true;
        case '0':
            changeTimeScale(0);
            return true;
        case ' ':
            togglePause();
            return true;
    }

    return false;
}

function togglePause()
{
    isPaused = !isPaused;
}