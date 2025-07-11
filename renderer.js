class Renderer
{
    constructor(id) {
        this.canvasId = id;

        this.currentPitch = 0;
        this.currentYaw = 0;
        this.currentRoll = 0;
    }

    // Perspective projection function
    static Perspective (point)
    {
        const canvas = document.getElementById("canvas");
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;


        let d = -500; // constant for z position of camera plane
 
        let x = point.x;
        let y = point.y;
        let z = point.z;



        // Basic perspective projection
        x = x/(1+z/d);
        y = y/(1+z/d);

        // Apply viewport scaling
        x = x*(canvasWidth/viewportWidth);
        y = y*(canvasHeight/viewportHeight);


        return [x, y];
    }

    // Draw polygon to canvas
    DrawPolygon(polygon, min = null, max = null)
    {
        const canvas = document.getElementById(this.canvasId);
        const ctx = canvas.getContext("2d");
        const center = [canvas.width/2, canvas.height/2];

        ctx.beginPath();
        let start = Renderer.Perspective(polygon.vertices[0]);
        ctx.moveTo(start[0] + center[0], -start[1] + center[1]);
        for (let i = 1; i < polygon.vertices.length; i++)
        {
            let point = Renderer.Perspective(polygon.vertices[i]);
            ctx.lineTo(point[0] + center[0], -point[1] + center[1]);
        }
        ctx.lineTo(start[0] + center[0], -start[1] + center[1]);
        // ctx.stroke();

        // Starting shade
        let colour = [200,200,200]; // white


        // Distance falloff
        if (distanceFalloff) {
            let z = polygon.AverageZ();
            let mult = ((max.z - z)/(max.z-min.z));
            mult = Math.min(mult, 0.5);
            colour.forEach((num, index) => {
                num *= 1- mult**2;
                num = Math.min(Math.max(num, 50), colour[index]);
                colour[index] = num;
            });
        }

        // Normals
        if (normalDiffusion) {
            let facing = polygon.GetFacing();
            colour.forEach((num, index) => {
                num *= Math.sqrt(facing);
                num = Math.min(Math.max(num, 50), colour[index]);
                colour[index] = num;
            });
        }

        if (edges) {
            ctx.stroke();
        }
        ctx.fillStyle = rgbToHex(colour);
        ctx.fill();
        ctx.closePath();
    }

    DrawModel(model)
    {
        model.SaveSurfaceNormals(); // Get surface normals

        const canvas = document.getElementById(this.canvasId);
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0,0,canvas.width,canvas.height); // clear canvas before drawing

        // Find min/max values
        let min = model.FindMinValues();
        let max = model.FindMaxValues();

        // Sort polygons by z value to prevent z-index issues
        let polygons = model.polygons;
        polygons.sort(SortByZ);
        polygons.forEach((polygon) => {
            this.DrawPolygon(polygon, min, max);
        });


    }


    LoadModel(model)
    {
        this.currentModel = model;
        let min = model.FindMinValues();
        let max = model.FindMaxValues();
        let xSize = Math.abs(min.x - max.x);
        let ySize = Math.abs(min.y - max.y);
        let zSize = Math.abs(min.z - max.z);
        let size = Math.max(xSize, ySize, zSize);
        Viewport(size * 1.5);
        this.Draw();
    }

    Draw() {
        this.DrawModel(this.currentModel);
    }

    StoreRotation(pitch, yaw, roll) {
        // Store current values for acces from dragging function;
        this.currentPitch = pitch;
        this.currentYaw = yaw;
        this.currentRoll = roll;
    }

    RotateStore(pitch, yaw, roll) {
        this.StoreRotation(pitch,yaw,roll);
        this.Rotate(pitch,yaw,roll);
    }

    Rotate(pitch, yaw, roll)
    {
        // Convert to radians for calculations
        pitch = pitch * Math.PI / 180;
        yaw = yaw * Math.PI / 180;
        roll = roll * Math.PI / 180;

        // find rotation matrix
        let rotationMatrix = new RotationMatrix(
            Math.cos(yaw)*Math.cos(pitch),
            Math.cos(yaw)*Math.sin(pitch)*Math.sin(roll) - Math.sin(yaw)*Math.cos(roll),
            Math.cos(yaw)*Math.sin(pitch)*Math.cos(roll) + Math.sin(yaw)*Math.sin(roll),
            Math.sin(yaw)*Math.cos(pitch),
            Math.sin(yaw)*Math.sin(pitch)*Math.sin(roll) + Math.cos(yaw)*Math.cos(roll),
            Math.sin(yaw)*Math.sin(pitch)*Math.cos(roll) - Math.cos(yaw)*Math.sin(roll),
            - Math.sin(pitch),
            Math.cos(pitch)*Math.sin(roll),
            Math.cos(pitch)*Math.cos(roll)
        );



        // rotate each point by matrix
        
        // array for storing new values
        let newPolygons = [];

        // Iterate through original mode, rotate points, assign to new model
        this.currentModel.polygons.forEach((polygon) => {
            let newVertices = [];
            polygon.vertices.forEach((vertex) => {
                let transformPosition = vertex.LinearTransform(rotationMatrix);
                let x = transformPosition.x;
                let y = transformPosition.y;
                let z = transformPosition.z;
                newVertices.push(new Vector3(x,y,z));
            });
            newPolygons.push(new Polygon(newVertices));
        });

        let model = new Model(newPolygons); // creates new dummy model

        // render new model
        this.DrawModel(model);

    }

}


// Comparison function for sorting by average z value
function SortByZ(a, b) {
    if (a.AverageZ() > b.AverageZ()) {
        return 1;
    } else {
        return -1;
    }
}


let viewportHeight = 8;
let viewportWidth = 8;
function Viewport(width, height = null) {
    if (height) {
        viewportWidth = width;
        viewportHeight = height;
    } else {
        viewportWidth = width;
        viewportHeight = width;
    }
}

// RGB to Hex function
function rgbToHex(rgb) {
    red = rgb[0];
    green = rgb[1];
    blue = rgb[2]
    let redHex = parseInt(red).toString(16);
    while (redHex.length < 2) {
        redHex = "0" + redHex;
    }
    let greenHex = parseInt(green).toString(16);
    while (greenHex.length < 2) {
        greenHex = "0" + greenHex;
    }
    let blueHex = parseInt(blue).toString (16);
    while (blueHex.length < 2) {
        blueHex = "0" + blueHex;
    }

    newHex = "#"+redHex+greenHex+blueHex;
    return(newHex);
}

let distanceFalloff = true;
let normalDiffusion = true;
let edges = false;