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
    light.intensity = 0.9; // Augmenté pour plus de luminosité
    light.diffuse = new BABYLON.Color3(1, 1, 0.95); // Teinte plus neutre

    var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.7; // Augmenté pour plus de luminosité
    dirLight.diffuse = new BABYLON.Color3(1, 1, 0.95); // Teinte plus neutre

    // Ground creation with improved terrain effect (texture intacte)
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 60,
        height: 60,
        subdivisions: 200
    }, scene);

    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.90); // Plus clair, moins jaune
    groundMat.diffuseTexture = new BABYLON.Texture("./assets/sand_diffuse.jpg", scene);
    groundMat.diffuseTexture.uScale = 15;
    groundMat.diffuseTexture.vScale = 15;

    groundMat.bumpTexture = new BABYLON.Texture("./assets/sand_normal.jpg", scene);
    groundMat.bumpTexture.uScale = 20;
    groundMat.bumpTexture.vScale = 20;
    groundMat.bumpTexture.level = 1.2;

    groundMat.displacementMap = new BABYLON.Texture("./assets/sand_displacement.jpg", scene);
    groundMat.displacementMap.uScale = 15;
    groundMat.displacementMap.vScale = 15;
    groundMat.displacementMapLevel = 4;

    var vertexData = BABYLON.VertexData.CreateGround({
        width: 60,
        height: 60,
        subdivisions: 200
    });
    var positions = vertexData.positions;
    for (var i = 0; i < positions.length; i += 3) {
        if (Math.abs(positions[i]) < 29 && Math.abs(positions[i + 2]) < 29) {
            var distanceFromCenter = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
            var randomFactor = (Math.random() - 0.5) * 0.6;
            var adjustedHeight = randomFactor * (1 - distanceFromCenter / 30);
            positions[i + 1] = adjustedHeight;
        }
    }
    vertexData.applyToMesh(ground);

    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    groundMat.specularPower = 64;
    groundMat.useParallax = true;
    groundMat.parallaxScaleBias = 0.15;
    groundMat.useParallaxOcclusion = true;

    ground.material = groundMat;

    // Pyramid creation with brick wall texture and custom UVs
    var pyramidHeight = 45;
    var pyramidBaseWidth = 60;
    var pyramid = BABYLON.MeshBuilder.CreatePolyhedron("pyramid", {
        custom: {
            vertex: [
                [-pyramidBaseWidth / 2, 0, -pyramidBaseWidth / 2], // 0
                [pyramidBaseWidth / 2, 0, -pyramidBaseWidth / 2],  // 1
                [pyramidBaseWidth / 2, 0, pyramidBaseWidth / 2],   // 2
                [-pyramidBaseWidth / 2, 0, pyramidBaseWidth / 2],  // 3
                [0, pyramidHeight, 0]                              // 4 (sommet)
            ],
            face: [
                [0, 1, 4], // Face 1
                [1, 2, 4], // Face 2
                [2, 3, 4], // Face 3
                [3, 0, 4]  // Face 4
            ],
            // Coordonnées UV personnalisées pour chaque face triangulaire
            uv: [
                [0, 0], [1, 0], [0.5, 1], // Face 0,1,4 (bas gauche, bas droit, sommet)
                [0, 0], [1, 0], [0.5, 1], // Face 1,2,4
                [0, 0], [1, 0], [0.5, 1], // Face 2,3,4
                [0, 0], [1, 0], [0.5, 1]  // Face 3,0,4
            ]
        },
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    var pyramidMat = new BABYLON.StandardMaterial("pyramidMat", scene);
    pyramidMat.diffuseTexture = new BABYLON.Texture("./assets/wall_diffuse.jpg", scene); // Texture diffuse des briques
    pyramidMat.diffuseTexture.uScale = 1; // Ajustez l'échelle si besoin
    pyramidMat.diffuseTexture.vScale = 1;

    pyramidMat.bumpTexture = new BABYLON.Texture("./assets/wall_normal.jpg", scene); // Texture normale des briques
    pyramidMat.bumpTexture.uScale = 1;
    pyramidMat.bumpTexture.vScale = 1;
    pyramidMat.bumpTexture.level = 1.0; // Ajustez l'intensité du normal map

    pyramidMat.displacementMap = new BABYLON.Texture("./assets/wall_displacement.jpg", scene); // Texture de displacement
    pyramidMat.displacementMap.uScale = 1;
    pyramidMat.displacementMap.vScale = 1;
    pyramidMat.displacementMapLevel = 2.0; // Ajustez l'intensité du displacement

    pyramid.material = pyramidMat;

    // Pedestal creation function
    async function createPedestal(position, height = 2) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "pedestal.glb", scene);
        const pedestal = result.meshes[0];
        pedestal.position = new BABYLON.Vector3(position[0], 0, position[2]);
        const scaleFactor = 0.3;
        pedestal.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

        const pedestalMat = new BABYLON.StandardMaterial("pedestalMat", scene);
        pedestalMat.diffuseColor = new BABYLON.Color3(0.8, 0.65, 0.4);

        const pedestalTexture = new BABYLON.DynamicTexture("pedestalTexture", { width: 512, height: 512 }, scene);
        const pedCtx = pedestalTexture.getContext();
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
        pedestalMat.specularColor = new BABYLON.Color3(0, 0, 0);

        result.meshes.forEach(mesh => {
            mesh.material = pedestalMat;
            mesh.isPickable = false;
        });

        pedestal.name = "pedestal";
        return { pedestal, height: height * scaleFactor };
    }

    var positions = [
        [24, 3, 18], [24, 3, 0], [24, 3, -18],
        [-24, 3, 18], [-24, 3, 0], [-24, 3, -18],
        [18, 3, -24], [0, 3, -24], [-18, 3, -24],
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
    var pedestals = [];
    var assetsManager = new BABYLON.AssetsManager(scene);

    async function loadPedestals() {
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const pedestalHeight = (i === 9) ? 3 : 2;
            const { pedestal, height } = await createPedestal([pos[0], 0, pos[2]], pedestalHeight);
            pedestals.push({ pedestal, effectiveHeight: height });
        }
    }

    async function loadModels() {
        await loadPedestals();

        positions.forEach((pos, i) => {
            const pedestalHeight = (i === 9) ? 3 : 2;
            const effectiveHeight = pedestals[i].effectiveHeight;
            var modelTask = assetsManager.addMeshTask("model" + i, "", "./assets/", "oeuvre" + (i + 1) + ".glb");

            modelTask.onSuccess = function (task) {
                var model = task.loadedMeshes[0];
                var scaleFactor;
                var artifactName = artifactData[i].name;
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
                model.position = new BABYLON.Vector3(pos[0], effectiveHeight, pos[2]);
                model.rotation = new BABYLON.Vector3(0, 0, 0);

                model.metadata = artifactData[i];
                model.metadata.initialY = model.position.y;
                model.metadata.isRotating = false;

                var hitbox = BABYLON.MeshBuilder.CreateBox("hitbox" + i, { size: 1.5 }, scene);
                hitbox.position = model.position.clone();
                hitbox.isVisible = false;
                hitbox.isPickable = true;
                hitbox.metadata = artifactData[i];
                hitbox.parent = model;

                artifacts.push(model);

                task.loadedMeshes.forEach(mesh => {
                    mesh.isPickable = true;
                    mesh.metadata = artifactData[i];
                });
            };

            modelTask.onError = function (task, message, exception) {
                console.log("Erreur lors du chargement du modèle " + i + ": " + message);
                var fallbackCube = BABYLON.MeshBuilder.CreateBox("fallbackCube" + i, { width: 0.8, height: 0.8, depth: 0.8 }, scene);
                fallbackCube.position = new BABYLON.Vector3(pos[0], effectiveHeight + 0.4, pos[2]);
                fallbackCube.metadata = artifactData[i];
                fallbackCube.metadata.initialY = fallbackCube.position.y;
                fallbackCube.metadata.isRotating = false;
                var cubeMat = new BABYLON.StandardMaterial("cubeMat" + i, scene);
                var colorIndex = i % 5;
                if (colorIndex === 0) cubeMat.diffuseColor = new BABYLON.Color3(0.85, 0.7, 0.2);
                else if (colorIndex === 1) cubeMat.diffuseColor = new BABYLON.Color3(0.15, 0.5, 0.7);
                else if (colorIndex === 2) cubeMat.diffuseColor = new BABYLON.Color3(0.9, 0.88, 0.8);
                else if (colorIndex === 3) cubeMat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.15);
                else cubeMat.diffuseColor = new BABYLON.Color3(0.6, 0.25, 0.2);
                fallbackCube.material = cubeMat;
                fallbackCube.isPickable = true;
                artifacts.push(fallbackCube);
            };
        });

        assetsManager.load();
    }

    loadModels().then(() => {
        resetAllArtifacts();
    });

    var infoPanel = document.getElementById("info");
    var titleElement = document.getElementById("title");
    var descriptionElement = document.getElementById("description");
    var backButton = document.getElementById("back");

    var viewControlsDiv = document.getElementById("viewControls");
    viewControlsDiv.innerHTML = `
        <h4>Contrôles de Vue</h4>
        <div class="button-group">
            <button id="toggleRotation">Activer/Désactiver Rotation</button>
            <button id="viewTop">Vue de Haut</button>
            <button id="viewLeft">Vue de Droite</button>
            <button id="viewBack">Vue de Face</button>
            <button id="viewRight">Vue de Gauche</button>
            <button id="viewFront">Vue de Derrière</button>
        </div>
    `;

    var selectedMesh = null;

    scene.registerBeforeRender(function () {
        if (selectedMesh && selectedMesh.metadata && selectedMesh.metadata.isRotating) {
            selectedMesh.rotation.y += 0.00349;
            if (selectedMesh.rotation.y >= Math.PI * 2) selectedMesh.rotation.y -= Math.PI * 2;
        }
    });

    function resetAllArtifacts() {
        artifacts.forEach(artifact => {
            scene.stopAnimation(artifact);
            artifact.animations = [];
            artifact.rotation = new BABYLON.Vector3(0, 0, 0);
            artifact.position.y = artifact.metadata.initialY || 0;
            artifact.metadata.isRotating = false;
        });
    }

    function resetView() {
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
        selectedMesh = null;
    }

    backButton.addEventListener("click", resetView);

    scene.onPointerDown = function (evt, pickResult) {
        if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.metadata) {
            var mesh = pickResult.pickedMesh;
            titleElement.textContent = mesh.metadata.name;
            descriptionElement.textContent = mesh.metadata.desc;
            infoPanel.style.display = "block";

            var targetMesh = mesh;
            while (targetMesh.parent && targetMesh.parent.name) {
                targetMesh = targetMesh.parent;
            }

            resetAllArtifacts();

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

            targetMesh.metadata.isRotating = true;
            selectedMesh = targetMesh;

            camera.target = targetMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation(
                "zoom",
                camera,
                "radius",
                30,
                60,
                camera.radius,
                14,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            document.getElementById("toggleRotation").textContent = targetMesh.metadata.isRotating ? "Désactiver Rotation" : "Activer Rotation";
        }
    };

    document.getElementById("toggleRotation")?.addEventListener("click", function () {
        if (selectedMesh && selectedMesh.metadata) {
            selectedMesh.metadata.isRotating = !selectedMesh.metadata.isRotating;
            this.textContent = selectedMesh.metadata.isRotating ? "Désactiver Rotation" : "Activer Rotation";
            if (!selectedMesh.metadata.isRotating) {
                selectedMesh.rotation = new BABYLON.Vector3(0, 0, 0);
            }
        }
    });

    document.getElementById("viewTop")?.addEventListener("click", function () {
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewTop", camera, "alpha", 30, 60, camera.alpha, Math.PI / 2, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewTop", camera, "beta", 30, 60, camera.beta, 0, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewTop", camera, "radius", 30, 60, camera.radius, 10, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewLeft")?.addEventListener("click", function () {
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewLeft", camera, "alpha", 30, 60, camera.alpha, Math.PI, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewLeft", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewLeft", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewBack")?.addEventListener("click", function () {
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewBack", camera, "alpha", 30, 60, camera.alpha, Math.PI / 2, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewBack", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewBack", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewRight")?.addEventListener("click", function () {
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewRight", camera, "alpha", 30, 60, camera.alpha, 0, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewRight", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewRight", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewFront")?.addEventListener("click", function () {
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewFront", camera, "alpha", 30, 60, camera.alpha, -Math.PI / 2, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewFront", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewFront", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    return scene;
};

var scene = createScene();
engine.runRenderLoop(function () { scene.render(); });
window.addEventListener("resize", function () { engine.resize(); });