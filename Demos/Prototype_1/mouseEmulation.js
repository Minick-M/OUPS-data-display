    // Below are functions to emulate the device with the mouse
    
    // state of the emulation
    let is_emulating = false;
    let lastMouseYReading = 0;

    function ui_button_emulate_click(){
      if (is_emulating){
        // stop emulation
        is_emulating = false;

        document.getElementById(CANVAS_ID).removeEventListener('mousemove', ui_canvas_mouse_move);
        document.getElementById(EMULATE_BUTTON_ID).innerText = 'Start Emulation';
        document.getElementById(CONNECT_BUTTON_ID).disabled = false;
      }
      else{
        // start emulation
        is_emulating = true;
        console.log("hey")

        document.getElementById(CANVAS_ID).addEventListener('mousemove', ui_canvas_mouse_move);
        document.getElementById(EMULATE_BUTTON_ID).innerText = 'Stop Emulation';
        document.getElementById(CONNECT_BUTTON_ID).disabled = true;
      }

    }

    
    function ui_canvas_mouse_move(event){
      forceDiff = maxForce - minForce;
      lastMouseYReading =  maxForce - ((event.clientY - marginUp - marginDown) / screenHeight * forceDiff);
      console.log(lastMouseYReading);
    }

    function get_current_mouse_reading(){
      return [0, lastMouseYReading, 0, 0];
    }