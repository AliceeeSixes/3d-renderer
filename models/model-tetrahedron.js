let tetrahedron = new Model([
    new Polygon([
        new Vector3(-50, -50, -50),
        new Vector3(50,50,-50),
        new Vector3(50,-50,50),
    ]),
    new Polygon([
        new Vector3(-50,-50,-50),
        new Vector3(50,50,-50),
        new Vector3(-50,50,50),
    ]),
    new Polygon([
        new Vector3(-50,-50,-50),
        new Vector3(50,-50,50),
        new Vector3(-50,50,50),
    ]),
    new Polygon([
        new Vector3(50,50,-50),
        new Vector3(50,-50,50),
        new Vector3(-50,50,50),
    ]),
]);