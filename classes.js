class Vector3 {
    constructor (x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Translate(x, y, z) {
        return new Vector3(this.x + x, this.y + y, this.z + z);
    }


    LinearTransform(matrix) {
        // Extract values from point;
        let x = this.x;
        let y = this.y;
        let z = this.z;



        let result = new Vector3(0,0,0);
        result.x = matrix.c0r0*x + matrix.c1r0*y + matrix.c2r0*z;
        result.y = matrix.c0r1*x + matrix.c1r1*y + matrix.c2r1*z;
        result.z = matrix.c0r2*x + matrix.c1r2*y + matrix.c2r2*z;

        return result;
    }

    Project() {
        return renderer.Perspective(this);
    }
}

class Polygon {
    constructor(vertices, normal = null)
    {
        this.vertices = vertices;
        this.normal = normal;
    }

    // Project the polygon onto the screen
    Project() {
        let newVertices = [];
        this.vertices.forEach((vertex) => {
            newVertices.push(vertex.Project());
        });

        return new Polygon(newVertices, this.normal);
    }

    // Return corners of bounding box on x-y plane
    BoundingCorners() {
        let min = new Vector3(this.vertices[0].x, this.vertices[0].y, this.vertices[0].z);
        let max = new Vector3(this.vertices[0].x, this.vertices[0].y, this.vertices[0].z);

        // Find min and max values
        this.vertices.forEach((vertex) => {
            if (min.x > vertex.x) {
                min.x = vertex.x;
            }
            if (min.y > vertex.y) {
                min.y = vertex.y;
            }
            if (max.x < vertex.x) {
                max.x = vertex.x;
            }
            if (max.y < vertex.y) {
                max.y = vertex.y;
            }
        });

        return [min, max];
    }

    // Shift a polygon by a vector
    Translate(x, y, z) {
        // Get vertices
        let vertices = this.vertices;

        // Array for translated vertices
        let newVertices = [];

        // Translate each vertex and push to array
        vertices.forEach((vertex) => {
            newVertices.push(vertex.Translate(x, y, z));
        });

        // Return new polygon made from translated vertices
        return new Polygon(newVertices);
    }

    LogAverageZ() {
        console.log(this.AverageZ());
    }

    AverageZ()
    {
        let total = 0;
        this.vertices.forEach((vertex) => {
            total += vertex.z;
        });
        let average = total/this.vertices.length;
        return average;
    }

    CalculateNormal() {
        // Implement surface normal calculation
        let normal = [0,0,0];
        let vertices = this.vertices;
        for(let i = 0; i < vertices.length; i++) {
            let j = (i + 1) % (vertices.length);      
            normal[0] += (vertices[i].y - vertices[j].y) * (vertices[i].z + vertices[j].z);
            normal[1] += (vertices[i].z - vertices[j].z) * (vertices[i].x + vertices[j].x);
            normal[2] += (vertices[i].x - vertices[j].x) * (vertices[i].y + vertices[j].y);

        }
        let magnitude = Math.hypot(normal[0], normal[1], normal[2]);
        normal = new Vector3(normal[0]/magnitude, normal[1]/magnitude, normal[2]/magnitude);
        this.normal = normal;
        return normal;
    }

    GetFacing() {
        return (this.normal.z);
    }
}

class Model {
    constructor(polygons)
    {
        this.polygons = polygons;
    }

    // Project the model onto the screen
    Project() {
        let newPolygons = [];
        this.polygons.forEach((polygon) => {
            newPolygons.push(polygon.Project());
        });

        return new Model(newPolygons);
    }

    // Shift a polygon by a vector
    Translate(x, y, z) {
        // Get model polygons
        let polygons = this.polygons;

        // Array for translated polygons
        let newPolygons = [];

        // Translate each polygon and add to array
        polygons.forEach((polygon) => {
            newPolygons.push(polygon.Translate(x, y, z));
        });

        // Return new model with new polygons;
        return new Model(newPolygons);
    }

    // For debug
    DumpVertices() {
        this.polygons.forEach((polygon) => {
            polygon.vertices.forEach((vertex) => {
                console.log(vertex);
            });
        });
    }

    SaveSurfaceNormals() {
        this.polygons.forEach((polygon) => {
            polygon.CalculateNormal();
        });
    }

    FindMinValues() {
        let min = new Vector3(0,0,0);
        this.polygons.forEach((polygon) => {
            polygon.vertices.forEach((vertex) => {
                if (vertex.x < min.x) {min.x = vertex.x;}
                if (vertex.y < min.y) {min.y = vertex.y;}
                if (vertex.z < min.z) {min.z = vertex.z;}
            });
        });
        return min;
    }

    FindMaxValues() {
        let max = new Vector3(0,0,0);
        this.polygons.forEach((polygon) => {
            polygon.vertices.forEach((vertex) => {
                if (vertex.x > max.x) {max.x = vertex.x;}
                if (vertex.y > max.y) {max.y = vertex.y;}
                if (vertex.z > max.z) {max.z = vertex.z;}
            });
        });
        return max;
    }

    CenterPoint() {
        let max = this.FindMaxValues();
        let min = this.FindMinValues();

        let center = new Vector3((max.x+min.x)/2, (max.y+min.y)/2, (max.z+min.z)/2);

        console.log(center);
    }
}

class RotationMatrix {
    constructor (a, b, c, d, e, f, g, h, i)
    {
        this.c0r0 = a;
        this.c1r0 = b;
        this.c2r0 = c;
        this.c0r1 = d;
        this.c1r1 = e;
        this.c2r1 = f;
        this.c0r2 = g;
        this.c1r2 = h;
        this.c2r2 = i;
    }
}