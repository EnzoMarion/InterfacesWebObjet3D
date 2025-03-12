var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

// Variables globales
var scene, artifacts, camera, minimapCanvas, minimapCtx, tourTimeout, isTourActive = false, interactionPrompt;
var previousPosition, previousTarget, selectedArtifact = null;
var isMouseDown = false;
var previousMouseX = null;
var previousMouseY = null;
var createScene = function () {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.96, 0.91, 0.82);

    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.speed = 1.5;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 2, 1);
    camera._keys = [];

    camera.keysUp = [90, 38];
    camera.keysDown = [83, 40];
    camera.keysLeft = [81, 37];
    camera.keysRight = [68, 39];

    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
    scene.collisionsEnabled = true;

    camera.jumpSpeed = 3;
    camera._localDirection = new BABYLON.Vector3(0, 0, 0);
    camera._transformedDirection = new BABYLON.Vector3(0, 0, 0);

    window.addEventListener("keydown", function (evt) {
        if (evt.keyCode === 32 && !evt.repeat && !selectedArtifact) {
            if (camera.position.y <= 5.1) {
                camera.cameraDirection.y = camera.jumpSpeed;
            }
        }
    });

    interactionPrompt = document.createElement("div");
    interactionPrompt.style.position = "absolute";
    interactionPrompt.style.top = "50%";
    interactionPrompt.style.left = "50%";
    interactionPrompt.style.transform = "translate(-50%, -50%)";
    interactionPrompt.style.color = "#E6C35C";
    interactionPrompt.style.background = "rgba(31, 20, 15, 0.8)";
    interactionPrompt.style.padding = "10px";
    interactionPrompt.style.borderRadius = "5px";
    interactionPrompt.style.fontFamily = "'Papyrus', 'Copperplate', fantasy";
    interactionPrompt.style.fontSize = "1.2em";
    interactionPrompt.style.display = "none";
    interactionPrompt.textContent = "E : Regarder l'œuvre";
    document.body.appendChild(interactionPrompt);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    light.diffuse = new BABYLON.Color3(1, 0.98, 0.8);

    var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;
    dirLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100, subdivisions: 10 }, scene);
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    var groundTexture = new BABYLON.DynamicTexture("groundTexture", { width: 1024, height: 1024 }, scene);
    var gtx = groundTexture.getContext();
    gtx.fillStyle = "#D2B48C";
    gtx.fillRect(0, 0, 1024, 1024);
    gtx.strokeStyle = "#8B5A2B";
    gtx.lineWidth = 2;
    for (let i = 0; i <= 10; i++) {
        gtx.beginPath();
        gtx.moveTo(i * 102.4, 0);
        gtx.lineTo(i * 102.4, 1024);
        gtx.moveTo(0, i * 102.4);
        gtx.lineTo(1024, i * 102.4);
        gtx.stroke();
    }
    groundTexture.update();
    groundMat.diffuseTexture = groundTexture;
    groundMat.diffuseColor = new BABYLON.Color3(0.93, 0.83, 0.68);
    groundMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    ground.material = groundMat;
    ground.checkCollisions = true;

    var pyramidHeight = 75;
    var pyramidBaseWidth = 100;

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
    pyramid.checkCollisions = true;

    var pyramidMat = new BABYLON.StandardMaterial("pyramidMat", scene);
    pyramidMat.diffuseTexture = groundTexture;
    pyramidMat.diffuseColor = new BABYLON.Color3(0.93, 0.83, 0.68);
    pyramidMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    pyramid.material = pyramidMat;

    function createPedestal(position, height = 2) {
        var pedestalBase = BABYLON.MeshBuilder.CreateBox("pedestalBase", { width: 2.4, height: height * 0.9, depth: 2.4 }, scene);
        pedestalBase.position = new BABYLON.Vector3(position[0], height * 0.45, position[2]);

        var pedestalTop = BABYLON.MeshBuilder.CreateBox("pedestalTop", { width: 2.6, height: height * 0.1, depth: 2.6 }, scene);
        pedestalTop.position = new BABYLON.Vector3(position[0], height, position[2]);

        var pedestalMat = new BABYLON.StandardMaterial("pedestalMat", scene);
        pedestalMat.diffuseColor = new BABYLON.Color3(0.8, 0.65, 0.4);

        var pedestalTexture = new BABYLON.DynamicTexture("pedestalTexture", {width: 512, height: 512}, scene);
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
        pedestal.checkCollisions = true;
        return pedestal;
    }

    var positions = [
        [-35, 3, -30], [-35, 3, 0], [-35, 3, 30],
        [35, 3, -30], [35, 3, 0], [35, 3, 30],
        [-30, 3, 35], [0, 3, 35], [30, 3, 35],
        [0, 3, 0]
    ];

    var artifactData = [
        { name: "Statue de Bastet déesse", desc: "Statue représentant Bastet, déesse égyptienne à tête de chat, protectrice du foyer et symbole de la douceur domestique, datant de la période tardive." },
        { name: "Pyramidion de Ptahemwia", desc: "Pyramidion en pierre, sommet d’une pyramide ou d’un tombeau, appartenant à Ptahemwia, un haut fonctionnaire de la XVIIIe dynastie, orné de symboles solaires." },
        { name: "Scarabée sacré", desc: "Amulette en forme de scarabée, symbole de renaissance et de transformation, souvent utilisée dans les rituels funéraires égyptiens." },
        { name: "Table d'offrande par Defdji", desc: "Table d’offrande en pierre dédiée par Defdji, prêtre de l’Ancien Empire, utilisée pour présenter des offrandes aux défunts dans les tombes." },
        { name: "Buste ptolémaïque", desc: "Buste sculpté d’un dignitaire ou d’une divinité de l’époque ptolémaïque, mêlant styles grec et égyptien, datant d’environ 300-30 av. J.-C." },
        { name: "Sarcophage miniature", desc: "Reproduction d’un sarcophage égyptien décoré de hiéroglyphes, utilisé pour abriter les momies dans les tombes royales." },
        { name: "Tablette hiéroglyphique", desc: "Pierre gravée de textes hiéroglyphiques anciens, probablement une stèle commémorative ou un décret royal." },
        { name: "Maquette de bateau d'Égypte", desc: "Maquette en bois d’un bateau égyptien, symbole du voyage dans l’au-delà, souvent placée dans les tombes pour accompagner le défunt." },
        { name: "Statue de Neith déesse", desc: "Statue de Neith, déesse de la guerre et de la chasse, représentée avec un arc et des flèches, vénérée dès l’époque prédynastique." },
        { name: "Ramsès II Egyptian statue", desc: "Statue colossale de Ramsès II, pharaon de la XIXe dynastie, symbole de puissance et de divinité, érigée dans les temples de l’Égypte antique." }
    ];

    var assetsManager = new BABYLON.AssetsManager(scene);

    function loadGLBModel(index, position, pedestalHeight) {
        var pedestal = createPedestal([position[0], 0, position[2]], pedestalHeight);
        var modelTask = assetsManager.addMeshTask("model" + index, "", "./assets/", "oeuvre" + (index + 1) + ".glb");

        modelTask.onSuccess = function(task) {
            var model = task.loadedMeshes[0];
            var scaleFactor;
            var artifactName = artifactData[index].name;
            if (["Ramsès II Egyptian statue", "Pyramidion de Ptahemwia", "Scarabée sacré"].includes(artifactName)) {
                scaleFactor = 1.5;
            } else if (artifactName === "Table d'offrande par Defdji") {
                scaleFactor = 0.1;
            } else if (artifactName === "Buste ptolémaïque") {
                scaleFactor = 2.5;
            } else if (artifactName === "Statue de Bastet déesse") {
                scaleFactor = 0.03;
            } else if (["Tablette hiéroglyphique"].includes(artifactName)) {
                scaleFactor = 0.01;
            } else if (artifactName === "Sarcophage miniature") {
                scaleFactor = 0.009;
            } else if (artifactName === "Maquette de bateau d'Égypte") {
                scaleFactor = 0.006;
            } else {
                scaleFactor = 0.05;
            }

            model.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
            model.position = new BABYLON.Vector3(position[0], pedestalHeight, position[2]);
            model.metadata = artifactData[index];
            artifacts[index] = model;

            console.log(`Œuvre ${index + 1} chargée : ${artifactData[index].name} (fichier: oeuvre${index + 1}.glb)`);

            for (var i = 0; i < task.loadedMeshes.length; i++) {
                task.loadedMeshes[i].isPickable = true;
                task.loadedMeshes[i].metadata = artifactData[index];
                task.loadedMeshes[i].checkCollisions = true;
            }
        };

        modelTask.onError = function(task, message, exception) {
            console.log(`Erreur chargement œuvre ${index + 1} (oeuvre${index + 1}.glb) : ${message}`);
            var fallbackCube = BABYLON.MeshBuilder.CreateBox("fallbackCube" + index, { width: 0.8, height: 0.8, depth: 0.8 }, scene);
            fallbackCube.position = new BABYLON.Vector3(position[0], pedestalHeight, position[2]);
            var cubeMat = new BABYLON.StandardMaterial("cubeMat" + index, scene);
            var colorIndex = index % 5;
            if (colorIndex === 0) cubeMat.diffuseColor = new BABYLON.Color3(0.85, 0.7, 0.2);
            else if (colorIndex === 1) cubeMat.diffuseColor = new BABYLON.Color3(0.15, 0.5, 0.7);
            else if (colorIndex === 2) cubeMat.diffuseColor = new BABYLON.Color3(0.9, 0.88, 0.8);
            else if (colorIndex === 3) cubeMat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.15);
            else cubeMat.diffuseColor = new BABYLON.Color3(0.6, 0.25, 0.2);
            fallbackCube.material = cubeMat;
            fallbackCube.metadata = artifactData[index];
            artifacts[index] = fallbackCube;
            fallbackCube.checkCollisions = true;
            console.log(`Cube de secours pour œuvre ${index + 1} : ${artifactData[index].name}`);
        };
    }

    artifacts = new Array(positions.length);
    positions.forEach((pos, i) => {
        var pedestalHeight = (i === 9) ? 3 : 2;
        loadGLBModel(i, pos, pedestalHeight);
    });

    assetsManager.load();

    assetsManager.onFinish = function() {
        artifacts.forEach((artifact, idx) => {
            console.log(`Index ${idx}: ${artifact.metadata.name}`);
        });
    };

    var infoPanel = document.getElementById("info");
    var titleElement = document.getElementById("title");
    var descriptionElement = document.getElementById("description");
    var backButton = document.getElementById("back");
    var guidedTourButton = document.getElementById("guidedTour");
    var tourTimeInput = document.getElementById("tourTime");
    var artifactList = document.getElementById("artifactItems");
    minimapCanvas = document.getElementById("minimap");
    minimapCtx = minimapCanvas.getContext("2d");

    artifactData.forEach((artifact, index) => {
        var li = document.createElement("li");
        li.textContent = artifact.name;
        li.dataset.index = index;
        artifactList.appendChild(li);
    });

    function highlightArtifactInList(index) {
        var items = artifactList.getElementsByTagName("li");
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("selected");
        }
        if (index >= 0 && index < items.length) {
            items[index].classList.add("selected");
        }
    }

    function resetView() {
        clearTimeout(tourTimeout);
        isTourActive = false;
        selectedArtifact = null;
        isMouseDown = false;  // Réinitialiser cette variable
        previousMouseX = null;
        previousMouseY = null;
        if (previousPosition && previousTarget) {
            camera.position = previousPosition.clone();
            camera.setTarget(previousTarget.clone());
        }
        infoPanel.style.display = "none";
        highlightArtifactInList(-1);
        document.exitPointerLock();
    }

    backButton.addEventListener("click", resetView);

    artifactList.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            var index = parseInt(e.target.dataset.index);
            var mesh = artifacts[index];
            if (mesh) {
                previousPosition = camera.position.clone();
                previousTarget = camera.target.clone();

                titleElement.textContent = mesh.metadata.name;
                descriptionElement.textContent = mesh.metadata.desc;
                infoPanel.style.display = "block";
                selectedArtifact = mesh;

                animateCamera(mesh.position, new BABYLON.Vector3(mesh.position.x, mesh.position.y + 5, mesh.position.z - 5));
                highlightArtifactInList(index);
            }
        }
    });

    // Animation fluide de la caméra
    function animateCamera(targetPosition, newPosition) {
        // Sortir immédiatement du mode pointer lock quand on commence l'animation
        document.exitPointerLock();

        BABYLON.Animation.CreateAndStartAnimation(
            "camPos",
            camera,
            "position",
            60, // FPS
            60, // Frames totales (1 seconde)
            camera.position,
            newPosition,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.QuadraticEase()
        );
        BABYLON.Animation.CreateAndStartAnimation(
            "camTarget",
            camera,
            "target",
            60,
            60,
            camera.target,
            targetPosition,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.QuadraticEase()
        );
    }

    window.addEventListener("keydown", function (evt) {
        if (evt.keyCode === 69) {
            if (selectedArtifact) {
                resetView();
            } else {
                var nearestArtifact = null;
                var minDistance = Infinity;
                artifacts.forEach((mesh, index) => {
                    var distance = BABYLON.Vector3.Distance(camera.position, mesh.position);
                    if (distance < 5 && distance < minDistance) {
                        nearestArtifact = mesh;
                        minDistance = distance;
                    }
                });
                if (nearestArtifact) {
                    previousPosition = camera.position.clone();
                    previousTarget = camera.target.clone();

                    titleElement.textContent = nearestArtifact.metadata.name;
                    descriptionElement.textContent = nearestArtifact.metadata.desc;
                    infoPanel.style.display = "block";
                    selectedArtifact = nearestArtifact;

                    animateCamera(nearestArtifact.position, new BABYLON.Vector3(nearestArtifact.position.x, nearestArtifact.position.y + 5, nearestArtifact.position.z - 5));
                    var index = artifacts.indexOf(nearestArtifact);
                    highlightArtifactInList(index);
                }
            }
        }
    });

    canvas.addEventListener("mousedown", function (evt) {
        if (evt.button === 0) { // Clic gauche
            if (selectedArtifact) {
                isMouseDown = true;
                previousMouseX = evt.clientX;
                previousMouseY = evt.clientY;
                evt.preventDefault();
                console.log("Clic gauche enfoncé sur œuvre, isMouseDown =", isMouseDown);
            } else {
                // Mode navigation normale FPS
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        }
    });

    window.addEventListener("mouseup", function (evt) {
        if (evt.button === 0 && isMouseDown) {
            isMouseDown = false;
            previousMouseX = null;
            previousMouseY = null;
            console.log("Clic gauche relâché (global), isMouseDown =", isMouseDown);
        }
    });

    canvas.addEventListener("mouseup", function (evt) {
        if (evt.button === 0) {
            isMouseDown = false;
            previousMouseX = null; // Réinitialiser
            previousMouseY = null;
            console.log("Clic gauche relâché, isMouseDown =", isMouseDown);
            document.exitPointerLock(); // Libérer le pointeur si verrouillé
        }
    });

    canvas.addEventListener("mousemove", function (evt) {
        if (!selectedArtifact) { // Mode FPS normal
            // Le code existant pour la navigation FPS
            var sensitivity = 0.002;
            var deltaX = evt.movementX * sensitivity;
            var deltaY = evt.movementY * sensitivity;

            var rotationY = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), deltaX);
            camera.rotationQuaternion = rotationY.multiply(camera.rotationQuaternion || BABYLON.Quaternion.Identity());

            var right = BABYLON.Vector3.Cross(camera.getDirection(BABYLON.Vector3.Forward()), BABYLON.Vector3.Up()).normalize();
            var rotationX = BABYLON.Quaternion.RotationAxis(right, -deltaY);
            var newRotation = rotationX.multiply(camera.rotationQuaternion);

            var euler = newRotation.toEulerAngles();
            if (euler.x > Math.PI / 2) euler.x = Math.PI / 2;
            if (euler.x < -Math.PI / 2) euler.x = -Math.PI / 2;
            camera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(euler.x, euler.y, euler.z);
        } else if (selectedArtifact && isMouseDown) { // Mode rotation autour de l'œuvre
            var deltaX = 0;
            var deltaY = 0;

            // Calcul du déplacement de la souris
            if (previousMouseX !== null && previousMouseY !== null) {
                deltaX = (evt.clientX - previousMouseX) * 0.01;
                deltaY = (evt.clientY - previousMouseY) * 0.01;
                previousMouseX = evt.clientX;
                previousMouseY = evt.clientY;
            }

            // Calculer la position actuelle par rapport à l'œuvre
            var direction = camera.position.subtract(selectedArtifact.position);
            var distance = direction.length();
            direction.normalize();

            // Créer une matrice de rotation pour le mouvement horizontal (autour de l'axe Y)
            var rotationMatrixY = BABYLON.Matrix.RotationY(-deltaX);

            // Calculer l'axe de rotation pour le mouvement vertical
            var right = BABYLON.Vector3.Cross(direction, BABYLON.Vector3.Up()).normalize();
            var rotationMatrixX = BABYLON.Matrix.RotationAxis(right, deltaY);

            // Appliquer les rotations
            var newDirection = BABYLON.Vector3.TransformCoordinates(direction, rotationMatrixY);
            newDirection = BABYLON.Vector3.TransformCoordinates(newDirection, rotationMatrixX);

            // Limiter l'angle vertical
            var angle = Math.acos(BABYLON.Vector3.Dot(newDirection, BABYLON.Vector3.Up()));
            if (angle < 0.1 || angle > Math.PI - 0.1) {
                // Trop près des pôles, ignorer la rotation verticale
                newDirection = BABYLON.Vector3.TransformCoordinates(direction, rotationMatrixY);
            }

            // Calculer la nouvelle position de la caméra
            var newPosition = selectedArtifact.position.add(newDirection.scale(distance));
            camera.position = newPosition;
            camera.setTarget(selectedArtifact.position);
        }
    });

    canvas.addEventListener("wheel", function (evt) {
        if (selectedArtifact) {
            var zoomSpeed = 0.5;
            var distance = BABYLON.Vector3.Distance(camera.position, selectedArtifact.position);
            var direction = camera.position.subtract(selectedArtifact.position).normalize();

            distance += evt.deltaY * zoomSpeed / 100;
            distance = Math.max(2, Math.min(20, distance));

            camera.position = selectedArtifact.position.add(direction.scale(distance));
            camera.setTarget(selectedArtifact.position);
            evt.preventDefault();
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (!selectedArtifact) {
            camera._localDirection.set(0, 0, 0);
            if (camera._keys.includes(90) || camera._keys.includes(38)) {
                camera._localDirection.z = 16;
            }
            if (camera._keys.includes(83) || camera._keys.includes(40)) {
                camera._localDirection.z = -16;
            }
            if (camera._keys.includes(81) || camera._keys.includes(37)) {
                camera._localDirection.x = -16;
            }
            if (camera._keys.includes(68) || camera._keys.includes(39)) {
                camera._localDirection.x = 16;
            }
            if (camera._localDirection.length() > 0) {
                camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
                BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
                camera._transformedDirection.y = 0;
                camera.position.addInPlace(camera._transformedDirection.scaleInPlace(engine.getDeltaTime() / 1000));
            }
        }
    });

    window.addEventListener("keydown", function (evt) {
        if (!selectedArtifact && !camera._keys.includes(evt.keyCode)) {
            camera._keys.push(evt.keyCode);
        }
    });

    window.addEventListener("keyup", function (evt) {
        var index = camera._keys.indexOf(evt.keyCode);
        if (index > -1) {
            camera._keys.splice(index, 1);
        }
    });

    guidedTourButton.addEventListener("click", () => {
        if (isTourActive) return;
        isTourActive = true;
        let i = 0;
        var tourTime = parseInt(tourTimeInput.value) * 1000;

        function nextStep() {
            if (i < artifacts.length && isTourActive) {
                var mesh = artifacts[i];

                if (i === 0) {
                    previousPosition = camera.position.clone();
                    previousTarget = camera.target.clone();
                }

                titleElement.textContent = mesh.metadata.name;
                descriptionElement.textContent = mesh.metadata.desc;
                infoPanel.style.display = "block";
                selectedArtifact = mesh;

                animateCamera(mesh.position, new BABYLON.Vector3(mesh.position.x, mesh.position.y + 5, mesh.position.z - 5));
                highlightArtifactInList(i);
                i++;
                if (isTourActive) {
                    tourTimeout = setTimeout(nextStep, tourTime);
                }
            } else {
                resetView();
            }
        }
        nextStep();
    });

    canvas.addEventListener("click", function (evt) {
        if (!selectedArtifact) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }
    });

    return scene;
};

function updateMinimap() {
    minimapCtx.clearRect(0, 0, 150, 150);
    minimapCtx.fillStyle = "#D2B48C";
    minimapCtx.fillRect(0, 0, 150, 150);

    artifacts.forEach(mesh => {
        var x = (mesh.position.x + 50) * 1.5;
        var z = (mesh.position.z + 50) * 1.5;
        minimapCtx.fillStyle = "#C0972F";
        minimapCtx.beginPath();
        minimapCtx.arc(x, z, 3, 0, 2 * Math.PI);
        minimapCtx.fill();
    });

    var camX = (camera.position.x + 50) * 1.5;
    var camZ = (camera.position.z + 50) * 1.5;
    minimapCtx.fillStyle = "red";
    minimapCtx.beginPath();
    minimapCtx.arc(camX, camZ, 5, 0, 2 * Math.PI);
    minimapCtx.fill();
}

scene = createScene();

var modal = document.getElementById("welcomeModal");
var closeModalBtn = document.getElementById("closeModal");
var museumTitle = document.getElementById("museumTitle");

window.onload = function() {
    modal.style.display = "flex";
};

closeModalBtn.addEventListener("click", function() {
    modal.style.display = "none";
});

museumTitle.addEventListener("click", function() {
    modal.style.display = "flex";
});

engine.runRenderLoop(function () {
    scene.render();
    updateMinimap();

    if (!selectedArtifact && camera.position.y > 5) {
        camera.cameraDirection.y += scene.gravity.y * engine.getDeltaTime() / 1000;
    } else if (!selectedArtifact && camera.position.y < 5) {
        camera.position.y = 5;
        camera.cameraDirection.y = 0;
    }

    var showPrompt = false;
    if (!selectedArtifact) {
        artifacts.forEach((mesh) => {
            var distance = BABYLON.Vector3.Distance(camera.position, mesh.position);
            if (distance < 5) {
                showPrompt = true;
            }
        });
    }
    interactionPrompt.style.display = showPrompt ? "block" : "none";
});

window.addEventListener("resize", function () {
    engine.resize();
});