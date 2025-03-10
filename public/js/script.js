var createScene = function () {
    // Create a basic Babylon Scene object
    var scene = new BABYLON.Scene(engine);

    // Set the scene's clear color (background)
    scene.clearColor = new BABYLON.Color3(1, 1, 1);

    // Create an ArcRotateCamera
    var camera = new BABYLON.ArcRotateCamera(
        "camera",
        BABYLON.Tools.ToRadians(0), // Alpha (rotation around Y-axis)
        BABYLON.Tools.ToRadians(90), // Beta (rotation around X-axis)
        10, // Radius (distance from target)
        BABYLON.Vector3.Zero(), // Target point
        scene
    );
    camera.attachControl(canvas, true);

    // Create a hemispheric light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create the ground
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    // Load the .glb model from the assets folder
    BABYLON.SceneLoader.Append(
        "/assets/test.glb", // Path to your model
        "", // Leave empty since we're using the full path in the first argument
        scene,
        function (loadedScene) {
            // Callback function when the model is loaded
            console.log("Model loaded successfully!");

            // Optional: Adjust the model's position or scale if needed
            var importedRoot = loadedScene.meshes[0]; // The root mesh of the imported model
            importedRoot.position.y = 0; // Adjust position if necessary
            // importedRoot.scaling = new BABYLON.Vector3(1, 1, 1); // Adjust scale if needed

            // Optional: Ensure the camera targets the loaded model
            camera.setTarget(importedRoot.position);
        },
        null, // Progress callback (optional)
        function (scene, message) {
            // Error callback
            console.error("Error loading model: ", message);
        }
    );

    return scene;
};