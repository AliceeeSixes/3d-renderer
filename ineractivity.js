function RotateModel() {
    pitch = parseInt(document.getElementById("pitch").value);
    yaw = parseInt(document.getElementById("yaw").value);
    roll = parseInt(document.getElementById("roll").value);

    renderer.RotateStore(pitch,yaw,roll);
}

let spinning = false;
let spinInterval;
let rotation = 0;
function Spin() {
    if (spinning) {
        clearInterval(spinInterval);
        spinning = false;
    } else {
        spinInterval = setInterval(AutoRotate, 20);
        spinning = true;
    }
}

function AutoRotate() {
    rotation+=1;
    if (rotation == 360) {rotation = 0;}
    renderer.RotateStore(rotation, rotation, rotation);
}


// Mouse Drag Functionality
document.getElementById("canvas").addEventListener("mousedown", StartDrag);
document.getElementById("canvas").addEventListener("mousemove", Drag);
document.getElementById("canvas").addEventListener("mouseup", EndDrag);
document.getElementById("canvas").addEventListener("wheel", Zoom);


let mouseXStart;
let mouseXEnd;
let dragging = false;

// Start Dragging
function StartDrag(event) {
    mouseXStart = event.pageX;
    dragging = true;
}

// During Drag
function Drag(event) {
    if (dragging) {
        mouseXEnd = event.pageX;
        let mouseXDifference = mouseXEnd - mouseXStart;
        pitch = renderer.currentPitch;
        yaw = renderer.currentYaw;
        roll = renderer.currentRoll;

        renderer.Rotate(pitch + mouseXDifference, yaw, roll);

        
    }
}

// End Drag
function EndDrag(event) {
    dragging = false;
    mouseXEnd = event.pageX;
    let mouseXDifference = mouseXEnd - mouseXStart;
    pitch = renderer.currentPitch;
    yaw = renderer.currentYaw;
    roll = renderer.currentRoll;

    renderer.RotateStore(pitch + mouseXDifference, yaw, roll);

}

// Zoom
function Zoom(event) {
    let amount = event.deltaY;
    Viewport(viewportSize + amount/240);
}



function openModal() {
    document.getElementById("modal-outer").style.display = "block";
}

function closeModal() {
    document.getElementById("modal-outer").style.display = "none";
}