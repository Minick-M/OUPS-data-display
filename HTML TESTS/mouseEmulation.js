// Below are functions to emulate the device with the mouse

// state of the emulation
let lastMouseYReading = 0;

window.addEventListener('mousemove', ui_canvas_mouse_move);

function ui_canvas_mouse_move(event)
{
  forceDiff = maxForce - minForce;
  lastMouseYReading =  Math.max(maxForce - ((event.clientY - marginUp - marginDown) / screenHeight * forceDiff), 0);
}

function get_current_mouse_reading()
{
  return [0, lastMouseYReading, 0, 0];
}