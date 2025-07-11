let cube = new Model([
    new Polygon([
        new Vector3(0.5, 0.5, 0.5),
        new Vector3(-0.5, 0.5, 0.5),
        new Vector3(-0.5, 0.5, -0.5),
        new Vector3(0.5, 0.5, -0.5)
    ]), // Top face;
    new Polygon([
        new Vector3(0.5, -0.5, 0.5),
        new Vector3(-0.5, -0.5, 0.5),
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, -0.5, -0.5)
    ]), // Bottom face;
    new Polygon([
        new Vector3(-0.5, 0.5, 0.5),
        new Vector3(-0.5, -0.5, 0.5),
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(-0.5, 0.5, -0.5)
    ]), // Left face;
    new Polygon([
        new Vector3(0.5, 0.5, 0.5),
        new Vector3(0.5, -0.5, 0.5),
        new Vector3(0.5, -0.5, -0.5),
        new Vector3(0.5, 0.5, -0.5)
    ]), // Right face;
    new Polygon([
        new Vector3(0.5, 0.5, 0.5),
        new Vector3(-0.5, 0.5, 0.5),
        new Vector3(-0.5, -0.5, 0.5),
        new Vector3(0.5, -0.5, 0.5)
    ]), // Front face;
    new Polygon([
        new Vector3(0.5, 0.5, -0.5),
        new Vector3(-0.5, 0.5, -0.5),
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, -0.5, -0.5)
    ]), // Back face;
]);