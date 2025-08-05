class Renderer
{
    constructor(id) {
        this.canvasId = id;

        this.currentPitch = 0;
        this.currentYaw = 0;
        this.currentRoll = 0;

        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
    }

    // Perspective projection function
    Perspective (point)
    {
        let d = -500; // constant for z position of camera plane
 
        let x = point.x;
        let y = point.y;
        let z = point.z;



        // Basic perspective projection
        x = x/(1+z/d);
        y = y/(1+z/d);

        // Apply viewport scaling
        x = x*(this.canvasWidth/viewportSize);
        y = y*(this.canvasHeight/viewportSize);

        return [x, y];
    }

    // Draw polygon to canvas
    DrawPolygon(polygon, min = null, max = null)
    {
        const center = [canvas.width/2, canvas.height/2];

        let maxz = max.z;
        let minz = min.z;

        this.ctx.beginPath();
        let start = this.Perspective(polygon.vertices[0]);
        this.ctx.moveTo(start[0] + center[0], -start[1] + center[1]);
        for (let i = 1; i < polygon.vertices.length; i++)
        {
            let point = this.Perspective(polygon.vertices[i]);
            this.ctx.lineTo(point[0] + center[0], -point[1] + center[1]);
        }
        this.ctx.lineTo(start[0] + center[0], -start[1] + center[1]);
        // ctx.stroke();

        // Starting shade
        let colour = [200,200,200]; // white


        // Distance falloff
        if (distanceFalloff) {
            let z = polygon.AverageZ();
            let mult = ((maxz - z)/(maxz - minz));
            mult = Math.min(mult, 0.5);
            colour.forEach((num, index) => {
                num *= 1 - mult**2;
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
        this.ctx.fillStyle = "rgb(" + colour[0] + ", " + colour[1] + ", " + colour[2] + ")";
        this.ctx.fill();
        this.ctx.closePath();
    }

    DrawModel(model)
    {
        model.SaveSurfaceNormals(); // Get surface normals


        this.ctx.clearRect(0,0,canvas.width,canvas.height); // clear canvas before drawing

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


let viewportSize = 8;

function Viewport(size) {
    viewportSize = size;
    renderer.Draw();
}

let distanceFalloff = true;
let normalDiffusion = true;
let edges = false;