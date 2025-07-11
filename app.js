// Set up renderer object
let renderer = new Renderer("canvas");

// Load default model
renderer.LoadModel(ParseObjRaw(teapot));
renderer.Draw();