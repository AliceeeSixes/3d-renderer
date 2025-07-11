function ParseObjRaw(rawText) {
    // Split raw text by line for parsing
    let lines = rawText.split("\n");

    // Arrays init
    let vertices = [];
    let normals = [];
    let polygons = [];

    lines.forEach((line) => {
        // Determine purpose of line and execute
        // Only supports basic vertices and faces - no normals or other values
        
        // v - create vertex
        if (line.substring(0,2) == "v ") {
            // extract vertrex co-ordinates
            let values = line.substring(2).split(" ");

            // add values to vertices list
            vertices.push(values);
        }

        // vn - create vertex normal
        if (line.substring(0,2) == "vn") {
            // extract vertrex co-ordinates
            let values = line.substring(3).split(" ");

            // add values to vertices list
            normals.push(values);
        }

        // f - create face
        if (line.substring(0,2) == "f ") {
            let values = line.substring(2).split(" ");


            // init vertices array

            let polygonVertices = [];
            values.forEach((value) => {
                value = value.split("/")[0];
                polygonVertices.push(new Vector3(
                    parseFloat(vertices[parseInt(value) - 1][0]), // take the index provided in the obj file, take the corresponding vertex from the list, fetch its values
                    parseFloat(vertices[parseInt(value) - 1][1]),
                    parseFloat(vertices[parseInt(value) - 1][2])
                ));
            });

            let polygon = new Polygon(polygonVertices);
            // Add new polygon to array
            polygons.push(polygon);
        }


    });

    let model = new Model(polygons);
    console.log("Loaded from obj");

    return model;
}


function LoadFromInput() {
    let rawText = document.getElementById("obj-input").value;

    return ParseObjRaw(rawText);
}

