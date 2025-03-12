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

    // Création du sol avec plus de subdivisions et crevasses
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 60, height: 60, subdivisions: 150 }, scene);
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.93, 0.83, 0.68); // Couleur par défaut si la texture échoue
    groundMat.diffuseTexture = new BABYLON.Texture("./assets/sand_diffuse.jpg", scene);
    groundMat.diffuseTexture.uScale = 10;
    groundMat.diffuseTexture.vScale = 10;
    groundMat.bumpTexture = new BABYLON.Texture("./assets/sand_normal.jpg", scene);
    groundMat.bumpTexture.uScale = 10;
    groundMat.bumpTexture.vScale = 10;
    groundMat.displacementMap = new BABYLON.Texture("./assets/sand_displacement.svg", scene);
    groundMat.displacementMap.uScale = 10;
    groundMat.displacementMap.vScale = 10;
    groundMat.displacementMapLevel = 2; // Plus de crevasses
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMat.specularPower = 0;
    ground.material = groundMat;

    // Création de la pyramide
    var pyramidHeight = 45;
    var pyramidBaseWidth = 60;
    var pyramid = BABYLON.MeshBuilder.CreatePolyhedron("pyramid", {
        custom: {
            "vertex": [
                [-pyramidBaseWidth / 2, 0, -pyramidBaseWidth / 2],
                [pyramidBaseWidth / 2, 0, -pyramidBaseWidth / 2],
                [pyramidBaseWidth / 2, 0, pyramidBaseWidth / 2],
                [-pyramidBaseWidth / 2, 0, pyramidBaseWidth / 2],
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
    pyramidMat.diffuseColor = new BABYLON.Color3(1, 1, 1); // Couleur blanche par défaut
    pyramid.material = pyramidMat;

    // Fonction pour créer les piédestaux à partir du fichier pedestal.glb
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
                model.metadata = artifactData[i];
                model.metadata.initialY = model.position.y;
                model.metadata.isRotating = false;

                artifacts.push(model);

                for (var j = 0; j < task.loadedMeshes.length; j++) {
                    task.loadedMeshes[j].isPickable = true;
                    task.loadedMeshes[j].metadata = artifactData[i];
                }
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

    loadModels();

    var infoPanel = document.getElementById("info");
    var titleElement = document.getElementById("title");
    var descriptionElement = document.getElementById("description");
    var backButton = document.getElementById("back");

    // Ajouter une catégorie "Contrôles de Vue" dans infoPanel
    var viewControlsDiv = document.createElement("div");
    viewControlsDiv.id = "viewControls";
    viewControlsDiv.className = "control-section"; // Ajouter une classe pour stylisation
    viewControlsDiv.innerHTML = `
        <h4>Contrôles de Vue</h4>
        <div class="button-group">
            <button id="toggleRotation">Activer/Désactiver Rotation</button>
            <button id="viewTop">Vue de Haut</button>
            <button id="viewLeft">Vue de Derrière</button>
            <button id="viewBack">Vue de Droite</button>
            <button id="viewRight">Vue de Face</button>
            <button id="viewFront">Vue de Gauche</button>
        </div>
    `;
    if (infoPanel && backButton) {
        infoPanel.insertBefore(viewControlsDiv, backButton);
    }

    var selectedMesh = null;

    scene.registerBeforeRender(function () {
        artifacts.forEach(artifact => {
            if (artifact.metadata.isRotating) {
                if (artifact.rotationQuaternion) {
                    artifact.rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), artifact.rotationQuaternion.toEulerAngles().y + 0.00349);
                } else {
                    artifact.rotation.y += 0.00349;
                    if (artifact.rotation.y >= Math.PI * 2) artifact.rotation.y -= Math.PI * 2;
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

    // Événements des boutons
    document.getElementById("toggleRotation")?.addEventListener("click", function () {
        if (selectedMesh && selectedMesh.metadata) {
            selectedMesh.metadata.isRotating = !selectedMesh.metadata.isRotating;
            this.textContent = selectedMesh.metadata.isRotating ? "Désactiver Rotation" : "Activer Rotation";
            if (!selectedMesh.metadata.isRotating) {
                selectedMesh.rotation.y = 0;
                if (selectedMesh.rotationQuaternion) {
                    selectedMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0);
                }
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
        // Vue de Derrière
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewLeft", camera, "alpha", 30, 60, camera.alpha, Math.PI, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewLeft", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewLeft", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewBack")?.addEventListener("click", function () {
        // Vue de Droite
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewBack", camera, "alpha", 30, 60, camera.alpha, Math.PI / 2, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewBack", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewBack", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewRight")?.addEventListener("click", function () {
        // Vue de Face
        if (selectedMesh) {
            camera.target = selectedMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation("viewRight", camera, "alpha", 30, 60, camera.alpha, 0, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewRight", camera, "beta", 30, 60, camera.beta, Math.PI / 3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            BABYLON.Animation.CreateAndStartAnimation("viewRight", camera, "radius", 30, 60, camera.radius, 14, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        }
    });

    document.getElementById("viewFront")?.addEventListener("click", function () {
        // Vue de Gauche
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