class Vector3 {
    constructor (x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
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
}

class Polygon {
    constructor(vertices, normal = null)
    {
        this.vertices = vertices;
        this.normal = normal;
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
            normal[0] += (parseFloat(vertices[i].y) - parseFloat(vertices[j].y)) * (parseFloat(vertices[i].z) + parseFloat(vertices[j].z));
            normal[1] += (parseFloat(vertices[i].z) - parseFloat(vertices[j].z)) * (parseFloat(vertices[i].x) + parseFloat(vertices[j].x));
            normal[2] += (parseFloat(vertices[i].x) - parseFloat(vertices[j].x)) * (parseFloat(vertices[i].y) + parseFloat(vertices[j].y));

        }
        let magnitude = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2)
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