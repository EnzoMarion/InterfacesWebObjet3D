var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.96, 0.91, 0.82);

    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 40, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 10;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    light.diffuse = new BABYLON.Color3(1, 0.98, 0.8);

    var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;
    dirLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    // Création du sol
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60, subdivisions: 10 }, scene);
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material = groundMat;

    // Création de la pyramide
    var pyramidHeight = 45;
    var pyramidBaseWidth = 60;
    var pyramid = BABYLON.MeshBuilder.CreatePolyhedron("pyramid", {
        custom: {
            "vertex": [
                [-pyramidBaseWidth/2, 0, -pyramidBaseWidth/2],
                [pyramidBaseWidth/2, 0, -pyramidBaseWidth/2],
                [pyramidBaseWidth/2, 0, pyramidBaseWidth/2],
                [-pyramidBaseWidth/2, 0, pyramidBaseWidth/2],
                [0, pyramidHeight, 0]
            ],
            "face": [
                [0, 1, 4],
                [1, 2, 4],
                [2, 3, 4],
                [3, 0, 4]
            ]
        },
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    var pyramidMat = new BABYLON.StandardMaterial("pyramidMat", scene);
    pyramid.material = pyramidMat;

    // Chargement et application des matériaux
    BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "sand_material.glb", scene).then((result) => {
        const loadedMeshes = result.meshes;
        if (loadedMeshes.length > 0 && loadedMeshes[0].material) {
            const material = loadedMeshes[0].material;
            console.log("Matériau pour le sol :", material);
            console.log("Diffuse Texture :", material.diffuseTexture);
            console.log("Bump Texture :", material.bumpTexture);

            if (material.diffuseTexture) {
                groundMat.diffuseTexture = material.diffuseTexture;
                groundMat.diffuseTexture.uScale = 10;
                groundMat.diffuseTexture.vScale = 10;
            }
            groundMat.diffuseColor = material.diffuseColor || new BABYLON.Color3(1, 1, 1);
            if (material.bumpTexture) {
                groundMat.bumpTexture = material.bumpTexture;
                groundMat.bumpTexture.uScale = 10;
                groundMat.bumpTexture.vScale = 10;
            }
            ground.material = groundMat;
        } else {
            console.log("Aucun matériau valide dans sand_material.glb");
            groundMat.diffuseColor = new BABYLON.Color3(0.93, 0.83, 0.68);
        }
        loadedMeshes.forEach(mesh => mesh.dispose());
    }).catch((error) => {
        console.log("Erreur chargement sand_material.glb :", error);
        groundMat.diffuseColor = new BABYLON.Color3(0.93, 0.83, 0.68);
    });

    // Chargement de la texture pour les murs de la pyramide
    BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "sand_bricks_tile_texture.glb", scene).then((result) => {
        const loadedMeshes = result.meshes;
        if (loadedMeshes.length > 0 && loadedMeshes[0].material) {
            const material = loadedMeshes[0].material;
            console.log("Matériau pour les murs de la pyramide :", material);
            console.log("Diffuse Texture :", material.diffuseTexture ? material.diffuseTexture.url : "Aucune");
            console.log("Bump Texture :", material.bumpTexture ? material.bumpTexture.url : "Aucune");

            if (material.diffuseTexture) {
                pyramidMat.diffuseTexture = material.diffuseTexture;
                pyramidMat.diffuseTexture.uScale = 10; // Ajusté pour mieux couvrir les murs
                pyramidMat.diffuseTexture.vScale = 10; // Ajusté pour mieux couvrir les murs
            }
            pyramidMat.diffuseColor = material.diffuseColor || new BABYLON.Color3(1, 1, 1);
            if (material.bumpTexture) {
                pyramidMat.bumpTexture = material.bumpTexture;
                pyramidMat.bumpTexture.uScale = 10; // Ajusté pour mieux couvrir les murs
                pyramidMat.bumpTexture.vScale = 10; // Ajusté pour mieux couvrir les murs
            }
            pyramid.material = pyramidMat;
        } else {
            console.log("Aucun matériau valide dans sand_bricks_tile_texture.glb");
            pyramidMat.diffuseColor = new BABYLON.Color3(0.76, 0.60, 0.42);
        }
        loadedMeshes.forEach(mesh => mesh.dispose());
    }).catch((error) => {
        console.log("Erreur chargement sand_bricks_tile_texture.glb :", error);
        pyramidMat.diffuseColor = new BABYLON.Color3(0.76, 0.60, 0.42);
    });

    // Fonction pour créer les piédestaux
    function createPedestal(position, height = 2) {
        var pedestalBase = BABYLON.MeshBuilder.CreateBox("pedestalBase", { width: 2.4, height: height * 0.9, depth: 2.4 }, scene);
        pedestalBase.position = new BABYLON.Vector3(position[0], height * 0.45, position[2]);

        var pedestalTop = BABYLON.MeshBuilder.CreateBox("pedestalTop", { width: 2.6, height: height * 0.1, depth: 2.6 }, scene);
        pedestalTop.position = new BABYLON.Vector3(position[0], height, position[2]);

        var pedestalMat = new BABYLON.StandardMaterial("pedestalMat", scene);
        pedestalMat.diffuseColor = new BABYLON.Color3(0.8, 0.65, 0.4);

        var pedestalTexture = new BABYLON.DynamicTexture("pedestalTexture", { width: 512, height: 512 }, scene);
        var pedCtx = pedestalTexture.getContext();
        pedCtx.fillStyle = "#D2B96A";
        pedCtx.fillRect(0, 0, 512, 512);
        pedCtx.fillStyle = "#614D3A";
        pedCtx.fillRect(0, 40, 512, 20);
        pedCtx.fillRect(0, 452, 512, 20);
        pedCtx.fillStyle = "#A68A5C";
        pedCtx.fillRect(0, 100, 512, 10);
        pedCtx.fillRect(0, 402, 512, 10);
        pedestalTexture.update();

        pedestalMat.diffuseTexture = pedestalTexture;
        pedestalBase.material = pedestalMat;
        pedestalTop.material = pedestalMat;

        var pedestal = BABYLON.Mesh.MergeMeshes([pedestalBase, pedestalTop], true, true, undefined, false, true);
        pedestal.name = "pedestal";
        return pedestal;
    }

    var positions = [
        [-24, 3, -18], [-24, 3, 0], [-24, 3, 18],
        [24, 3, -18], [24, 3, 0], [24, 3, 18],
        [-18, 3, 24], [0, 3, 24], [18, 3, 24],
        [0, 3, 0]
    ];

    var artifactData = [
        { name: "Masque de Toutânkhamon", desc: "Le célèbre masque funéraire en or du pharaon Toutânkhamon, datant d'environ 1323 av. J.-C." },
        { name: "Statuette d'Anubis", desc: "Représentation du dieu Anubis, gardien des nécropoles et guide des âmes dans l'au-delà." },
        { name: "Scarabée sacré", desc: "Amulette en forme de scarabée, symbole de renaissance et de transformation." },
        { name: "Buste de Néfertiti", desc: "Sculpture représentant la reine Néfertiti, épouse du pharaon Akhenaton." },
        { name: "Ankh égyptien", desc: "Symbole hiéroglyphique représentant la vie éternelle." },
        { name: "Sarcophage miniature", desc: "Reproduction d'un sarcophage égyptien décoré de hiéroglyphes." },
        { name: "Tablette hiéroglyphique", desc: "Pierre gravée de textes hiéroglyphiques anciens." },
        { name: "Vase canope", desc: "Récipient utilisé durant la momification pour conserver les organes." },
        { name: "Statue de Bastet", desc: "Déesse à tête de chat, protectrice du foyer." },
        { name: "Pierre de Rosette", desc: "Reproduction de la pierre qui a permis de déchiffrer les hiéroglyphes." }
    ];

    var artifacts = [];
    var assetsManager = new BABYLON.AssetsManager(scene);

    function loadGLBModel(index, position, pedestalHeight) {
        var pedestal = createPedestal([position[0], 0, position[2]], pedestalHeight);
        var modelTask = assetsManager.addMeshTask("model" + index, "", "./assets/", "oeuvre" + (index + 1) + ".glb");

        modelTask.onSuccess = function(task) {
            var model = task.loadedMeshes[0];
            var scaleFactor;
            var artifactName = artifactData[index].name;
            if (["Masque de Toutânkhamon", "Pierre de Rosette", "Statuette d'Anubis", "Vase canope", "Statue de Bastet"].includes(artifactName)) {
                scaleFactor = 1.5;
            } else if (artifactName === "Buste de Néfertiti") {
                scaleFactor = 0.1;
            } else if (artifactName === "Ankh égyptien") {
                scaleFactor = 2.5;
            } else if (["Scarabée sacré", "Tablette hiéroglyphique"].includes(artifactName)) {
                scaleFactor = 0.01;
            } else if (artifactName === "Sarcophage miniature") {
                scaleFactor = 0.009;
            } else {
                scaleFactor = 0.05;
            }

            model.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
            model.position = new BABYLON.Vector3(position[0], pedestalHeight, position[2]);
            model.metadata = artifactData[index];
            model.metadata.initialY = model.position.y;
            model.metadata.isRotating = false;

            console.log(`Modèle ${index} (${artifactName}):`);
            console.log(`ScaleFactor appliqué: ${scaleFactor}`);
            console.log(`Position: ${model.position}`);
            console.log(`Uses Quaternion: ${model.rotationQuaternion !== null}`);

            artifacts.push(model);

            for (var i = 0; i < task.loadedMeshes.length; i++) {
                task.loadedMeshes[i].isPickable = true;
                task.loadedMeshes[i].metadata = artifactData[index];
            }
        };

        modelTask.onError = function(task, message, exception) {
            console.log("Erreur lors du chargement du modèle " + index + ": " + message);
            var fallbackCube = BABYLON.MeshBuilder.CreateBox("fallbackCube" + index, { width: 0.8, height: 0.8, depth: 0.8 }, scene);
            fallbackCube.position = new BABYLON.Vector3(position[0], pedestalHeight, position[2]);
            fallbackCube.metadata = artifactData[index];
            fallbackCube.metadata.initialY = fallbackCube.position.y;
            fallbackCube.metadata.isRotating = false;
            var cubeMat = new BABYLON.StandardMaterial("cubeMat" + index, scene);
            var colorIndex = index % 5;
            if (colorIndex === 0) cubeMat.diffuseColor = new BABYLON.Color3(0.85, 0.7, 0.2);
            else if (colorIndex === 1) cubeMat.diffuseColor = new BABYLON.Color3(0.15, 0.5, 0.7);
            else if (colorIndex === 2) cubeMat.diffuseColor = new BABYLON.Color3(0.9, 0.88, 0.8);
            else if (colorIndex === 3) cubeMat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.15);
            else cubeMat.diffuseColor = new BABYLON.Color3(0.6, 0.25, 0.2);
            fallbackCube.material = cubeMat;
            fallbackCube.isPickable = true;
            artifacts.push(fallbackCube);
        };
    }

    positions.forEach((pos, i) => {
        var pedestalHeight = (i === 9) ? 3 : 2;
        loadGLBModel(i, pos, pedestalHeight);
    });

    assetsManager.load();

    var infoPanel = document.getElementById("info");
    var titleElement = document.getElementById("title");
    var descriptionElement = document.getElementById("description");
    var backButton = document.getElementById("back");

    // Rotation manuelle, ralentie à 30 secondes par tour
    scene.registerBeforeRender(function () {
        artifacts.forEach(artifact => {
            if (artifact.metadata.isRotating) {
                if (artifact.rotationQuaternion) {
                    // Rotation via quaternion
                    artifact.rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), artifact.rotationQuaternion.toEulerAngles().y + 0.00349); // ~30s par tour
                    console.log("Rotation via Quaternion pour", artifact.metadata.name, "Quaternion:", artifact.rotationQuaternion);
                } else {
                    // Rotation via rotation.y
                    artifact.rotation.y += 0.00349; // ~30s par tour à 60 FPS (2π / 1800 frames)
                    if (artifact.rotation.y >= Math.PI * 2) artifact.rotation.y -= Math.PI * 2;
                    console.log("Rotation via rotation.y pour", artifact.metadata.name, "Rotation:", artifact.rotation.y);
                }
            }
        });
    });

    function resetAllArtifacts() {
        artifacts.forEach(artifact => {
            scene.stopAnimation(artifact);
            artifact.animations = [];
            artifact.rotation.y = 0;
            if (artifact.rotationQuaternion) artifact.rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0);
            artifact.position.y = artifact.metadata.initialY || 0;
            artifact.metadata.isRotating = false;
            console.log("Réinitialisation de", artifact.metadata.name, "Rotation:", artifact.rotation.y, "Position Y:", artifact.position.y, "Quaternion:", artifact.rotationQuaternion);
        });
    }

    function resetView() {
        console.log("Reset View appelé");
        camera.target = BABYLON.Vector3.Zero();
        BABYLON.Animation.CreateAndStartAnimation(
            "unzoom",
            camera,
            "radius",
            30,
            40,
            camera.radius,
            30,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        infoPanel.style.display = "none";
        resetAllArtifacts();
    }

    backButton.addEventListener("click", resetView);

    scene.onPointerDown = function (evt, pickResult) {
        console.log("Clic détecté, pickResult:", pickResult);
        if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.metadata) {
            console.log("Objet cliqué:", pickResult.pickedMesh.metadata.name);
            var mesh = pickResult.pickedMesh;
            titleElement.textContent = mesh.metadata.name;
            descriptionElement.textContent = mesh.metadata.desc;
            infoPanel.style.display = "block";

            var targetMesh = mesh;
            while (targetMesh.parent && targetMesh.parent.name) {
                targetMesh = targetMesh.parent;
            }
            console.log("TargetMesh:", targetMesh.name, "Initial Rotation:", targetMesh.rotation.y, "Initial Y:", targetMesh.position.y, "Has Quaternion:", targetMesh.rotationQuaternion !== null);

            // Réinitialiser tous les artifacts
            resetAllArtifacts();

            // Animation de bounce
            var bounceAnimation = new BABYLON.Animation(
                "bounce",
                "position.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            var bounceKeys = [
                { frame: 0, value: targetMesh.metadata.initialY },
                { frame: 60, value: targetMesh.metadata.initialY + 0.5 },
                { frame: 120, value: targetMesh.metadata.initialY }
            ];
            bounceAnimation.setKeys(bounceKeys);
            bounceAnimation.setEasingFunction(new BABYLON.SineEase());
            targetMesh.animations = [bounceAnimation];
            scene.beginAnimation(targetMesh, 0, 120, true);
            console.log("Animation bounce lancée pour", targetMesh.metadata.name);

            // Activer la rotation manuelle
            targetMesh.metadata.isRotating = true;
            console.log("Rotation manuelle activée pour", targetMesh.metadata.name);

            // Zoom de la caméra (réduit)
            camera.target = targetMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation(
                "zoom",
                camera,
                "radius",
                30,
                60,
                camera.radius,
                14, // Zoom réduit
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
        } else {
            console.log("Aucun objet valide cliqué");
        }
    };

    return scene;
};

var scene = createScene();
engine.runRenderLoop(function () { scene.render(); });
window.addEventListener("resize", function () { engine.resize(); });