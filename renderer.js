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

        this.tileSize = 2;
        this.tilemap = [];
        this.tilemapempty = [];

        for (let i = 0; i < this.canvasWidth/this.tileSize; i++) {
            let array = [];
            for (let j = 0; j < this.canvasWidth/this.tileSize; j++) {
                array.push(-Infinity);
            }
            this.tilemapempty[i] = array;
        }

        this.occlusionlenience = 2;

    }

    Occluded(polygon) {
        polygon = polygon.Project();
        let min = polygon.BoundingCorners()[0];
        let max = polygon.BoundingCorners()[1];


        // Find appropraite tiles to check
        let tilemin = new Vector3(Math.floor((min.x+this.canvasWidth/2)/this.tileSize),Math.floor((min.y+this.canvasHeight/2)/this.tileSize),0);
        let tilemax = new Vector3(Math.floor((max.x+this.canvasWidth/2)/this.tileSize),Math.floor((max.y+this.canvasHeight/2)/this.tileSize),0);

        let occluded = true;
        // Determine if occluded
        // For each tile in the vertical direction
        for (let ty = tilemin.y; ty <= tilemax.y; ty++) {
            // For each tile in the horizontal direction
            for (let tx = tilemin.x; tx <= tilemax.x; tx++) {
                // Get existing minimum depth
                let mapz = this.tilemap[tx][ty];
                let polygonz = polygon.AverageZ();
                // If polygon depth is greater or almost greater than stored depth, marked as not occluded (strict greater leads to missing polygons)
                if (polygonz > mapz-this.occlusionlenience) {
                    occluded = false;
                    // If this polygon is shallower than this, update new minimum depth
                    if (polygonz > mapz) {
                        this.tilemap[tx][ty] = polygonz;
                    }
                }
            }
        }

        return occluded;

    }

    OcclusionCull(polygons) {
        // Reverse z-ordering of polygons to cull front-to-back
        let reversed = polygons.reverse();

        this.tilemap = this.tilemapempty;

        let newPolygons = [];
        reversed.forEach((polygon) => {
            if (!this.Occluded(polygon)) {
                newPolygons.push(polygon);
            }
            
        });

        return newPolygons;
    }

    // Perspective projection function
    Perspective (point)
    {
        let d = -500; // constant for z position of camera plane
 
        let x = point.x;
        let y = point.y;
        let z = point.z;



        // Basic perspective projection
        x = x*d/(z+d);
        y = y*d/(z+d);

        // Apply viewport scaling
        x = x*(this.canvasWidth/viewportSize);
        y = y*(this.canvasHeight/viewportSize);

        return new Vector3(x, y, point.z);
    }

    // Draw polygon to canvas
    DrawPolygon(polygon, min = null, max = null)
    {
        const center = [canvas.width/2, canvas.height/2];

        let maxz = max.z;
        let minz = min.z;

        this.ctx.beginPath();
        let start = polygon.vertices[0];
        this.ctx.moveTo(start.x + center[0], -start.y + center[1]);

        // Draw shape from vertices
        for (let i = 1; i < polygon.vertices.length; i++)
        {
            let point = polygon.vertices[i];
            this.ctx.lineTo(point.x + center[0], -point.y + center[1]);
        }
        this.ctx.lineTo(start.x + center[0], -start.y + center[1]);

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
                num = Math.min(Math.max(num, 80), colour[index]);
                colour[index] = num;
            });
        }

        if (edges) {
            this.ctx.stroke();
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

        
        let polygons = model.polygons;

        // New array which excludes occluded polygons
        if (occlusionCulling) {
            polygons = this.OcclusionCull(polygons);
        }

        // Sort polygons by z value to prevent z-index issues
        polygons.sort(SortByZ);
        
        polygons.forEach((polygon) => {
            polygon = polygon.Project();
            this.DrawPolygon(polygon, min, max);
        });


    }


    LoadModel(model)
    {
        this.currentModel = CenterModelVertically(model);
        let min = model.FindMinValues();
        let max = model.FindMaxValues();
        let xSize = Math.abs(min.x - max.x);
        let ySize = Math.abs(min.y - max.y);
        let zSize = Math.abs(min.z - max.z);
        let size = Math.max(xSize, ySize, zSize);
        
        this.occlusionlenience = zSize/2;
        Viewport(size * 1.5);
        this.Draw();
    }

    LoadModelRaw(model)
    {
        this.LoadModel(ParseObjRaw(model));
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
        this.StoreRotation(pitch%360,yaw%360,roll%360);
        this.Rotate(pitch%360,yaw%360,roll%360);
    }

    Rotate(pitch, yaw, roll)
    {
        // Update rotation input values
        document.getElementById("pitch").value = pitch;
        document.getElementById("yaw").value = yaw;
        document.getElementById("roll").value = roll;

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
let occlusionCulling = false;