var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene, artifacts, camera, artifactCamera, minimapCanvas, minimapCtx, tourTimeout, isTourActive = false, interactionPrompt;
var previousPosition, previousTarget, selectedArtifact = null;
var isMouseDown = false;
var isArtifactMode = false;

var keysPressed = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false
};

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

    window.addEventListener("keydown", function (evt) {
        if (!evt.repeat) {
            if (evt.keyCode === 32 && !selectedArtifact && !isArtifactMode) {
                if (camera.position.y <= 5.1) {
                    camera.cameraDirection.y = camera.jumpSpeed;
                }
            }
            if (isArtifactMode && selectedArtifact) {
                switch (evt.keyCode) {
                    case 90: keysPressed.up = true; break;
                    case 83: keysPressed.down = true; break;
                    case 81: keysPressed.left = true; break;
                    case 68: keysPressed.right = true; break;
                    case 32: keysPressed.jump = true; break;
                    case 70: resetView(); break;
                }
            }
        }
    });

    window.addEventListener("keyup", function (evt) {
        if (isArtifactMode) {
            switch (evt.keyCode) {
                case 90: keysPressed.up = false; break;
                case 83: keysPressed.down = false; break;
                case 81: keysPressed.left = false; break;
                case 68: keysPressed.right = false; break;
                case 32: keysPressed.jump = false; break;
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
    interactionPrompt.textContent = "E : Regarder l’œuvre";
    document.body.appendChild(interactionPrompt);

    var crosshair = document.createElement("div");
    crosshair.id = "crosshair";
    crosshair.style.position = "absolute";
    crosshair.style.top = "50%";
    crosshair.style.left = "50%";
    crosshair.style.width = "20px";
    crosshair.style.height = "20px";
    crosshair.style.pointerEvents = "none";
    crosshair.style.zIndex = "1000";
    crosshair.style.display = "none";

    var horizontal = document.createElement("div");
    horizontal.style.position = "absolute";
    horizontal.style.top = "50%";
    horizontal.style.left = "0";
    horizontal.style.width = "100%";
    horizontal.style.height = "2px";
    horizontal.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
    horizontal.style.transform = "translateY(-50%)";

    var vertical = document.createElement("div");
    vertical.style.position = "absolute";
    vertical.style.top = "0";
    vertical.style.left = "50%";
    vertical.style.width = "2px";
    vertical.style.height = "100%";
    vertical.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
    vertical.style.transform = "translateX(-50%)";

    crosshair.appendChild(horizontal);
    crosshair.appendChild(vertical);
    document.body.appendChild(crosshair);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    light.diffuse = new BABYLON.Color3(1, 0.98, 0.8);

    var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;
    dirLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100, subdivisions: 10 }, scene);
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.90);
    groundMat.diffuseTexture = new BABYLON.Texture("./assets/sand_diffuse.jpg", scene);
    groundMat.diffuseTexture.uScale = 15;
    groundMat.diffuseTexture.vScale = 15;

    groundMat.bumpTexture = new BABYLON.Texture("./assets/sand_normal.jpg", scene);
    groundMat.bumpTexture.uScale = 20;
    groundMat.bumpTexture.vScale = 20;
    groundMat.bumpTexture.level = 1.2;

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
    pyramidMat.diffuseTexture = new BABYLON.Texture("./assets/wall_diffuse.jpg", scene);
    pyramidMat.diffuseTexture.uScale = 1;
    pyramidMat.diffuseTexture.vScale = 1;

    pyramidMat.bumpTexture = new BABYLON.Texture("./assets/wall_normal.jpg", scene);
    pyramidMat.bumpTexture.uScale = 1;
    pyramidMat.bumpTexture.vScale = 1;
    pyramidMat.bumpTexture.level = 1.0;

    pyramid.material = pyramidMat;

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
            mesh.checkCollisions = true;
        });

        pedestal.name = "pedestal";
        return { pedestal, height: height * scaleFactor };
    }

    function createCollisionZone(position, height) {
        var collisionZone = BABYLON.MeshBuilder.CreateCylinder("collisionZone", {
            height: height + 2,
            diameter: 5,
            tessellation: 32
        }, scene);
        collisionZone.position = new BABYLON.Vector3(position[0], (height + 2) / 2, position[2]);
        collisionZone.isVisible = false;
        collisionZone.checkCollisions = true;
        return collisionZone;
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
        { name: "Statue de Raia et Ptah", desc: "Statue représentant Raia, un dignitaire, et Ptah, dieu créateur et patron des artisans, symbolisant la dévotion et l’artisanat dans l’Égypte antique." },
        { name: "Table d'offrande par Defdji", desc: "Table d’offrande en pierre dédiée par Defdji, prêtre de l’Ancien Empire, utilisée pour présenter des offrandes aux défunts dans les tombes." },
        { name: "Buste ptolémaïque", desc: "Buste sculpté d’un dignitaire ou d’une divinité de l’époque ptolémaïque, mêlant styles grec et égyptien, datant d’environ 300-30 av. J.-C." },
        { name: "Ancien relief égyptien avec hiéroglyphes", desc: "Relief en pierre finement sculpté, orné de hiéroglyphes détaillant des événements royaux ou religieux, typique des tombes et temples égyptiens anciens." },
        { name: "La fuite en Égypte", desc: "Statue illustrant une scène mythique ou historique, représentant une famille ou un groupe en déplacement, inspirée des récits liés à l’Égypte antique." },
        { name: "Maquette de bateau d'Égypte", desc: "Maquette en bois d’un bateau égyptien, symbole du voyage dans l’au-delà, souvent placée dans les tombes pour accompagner le défunt." },
        { name: "Statue de Neith déesse", desc: "Statue de Neith, déesse de la guerre et de la chasse, représentée avec un arc et des flèches, vénérée dès l’époque prédynastique." },
        { name: "Ramsès II Egyptian statue", desc: "Statue colossale de Ramsès II, pharaon de la XIXe dynastie, symbole de puissance et de divinité, érigée dans les temples de l’Égypte antique." }
    ];

    var assetsManager = new BABYLON.AssetsManager(scene);

    async function loadGLBModel(index, position, pedestalHeight) {
        const { pedestal, height: adjustedHeight } = await createPedestal([position[0], 0, position[2]], pedestalHeight);
        var collisionZone = createCollisionZone([position[0], 0, position[2]], pedestalHeight);
        var modelTask = assetsManager.addMeshTask("model" + index, "", "./assets/", "oeuvre" + (index + 1) + ".glb");

        modelTask.onSuccess = function(task) {
            var model = task.loadedMeshes[0];
            var scaleFactor, offsetX, offsetY, offsetZ;
            var artifactName = artifactData[index].name;

            switch (artifactName) {
                case "Statue de Bastet déesse":
                    scaleFactor = 0.02;
                    offsetX = 0;
                    offsetY = 2.4;
                    offsetZ = 0.3;
                    break;
                case "Pyramidion de Ptahemwia":
                    scaleFactor = 1.0;
                    offsetX = 0;
                    offsetY = 2.88;
                    offsetZ = 0;
                    break;
                case "Statue de Raia et Ptah":
                    scaleFactor = 1.8;
                    offsetX = -1.6;
                    offsetY = 4.05;
                    offsetZ = 0.8;
                    break;
                case "Table d'offrande par Defdji":
                    scaleFactor = 0.1;
                    offsetX = 0;
                    offsetY = 2.78;
                    offsetZ = 0;
                    break;
                case "Buste ptolémaïque":
                    scaleFactor = 1.5;
                    offsetX = 0;
                    offsetY = 2.788;
                    offsetZ = 0;
                    break;
                case "Ancien relief égyptien avec hiéroglyphes":
                    scaleFactor = 0.015;
                    offsetX = 0;
                    offsetY = 2.789;
                    offsetZ = 0;
                    break;
                case "La fuite en Égypte":
                    scaleFactor = 6.0;
                    offsetX = 0;
                    offsetY = 2.8;
                    offsetZ = 0;
                    break;
                case "Maquette de bateau d'Égypte":
                    scaleFactor = 0.005;
                    offsetX = 0;
                    offsetY = 2.9;
                    offsetZ = 0;
                    break;
                case "Statue de Neith déesse":
                    scaleFactor = 0.02;
                    offsetX = 0;
                    offsetY = 4.0;
                    offsetZ = 0;
                    break;
                case "Ramsès II Egyptian statue":
                    scaleFactor = 1.5;
                    offsetX = 0;
                    offsetY = 2;
                    offsetZ = 0;
                    break;
                default:
                    scaleFactor = 0.05;
                    offsetX = 0;
                    offsetY = 0;
                    offsetZ = 0;
            }

            model.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
            model.position = new BABYLON.Vector3(position[0] + offsetX, adjustedHeight + offsetY, position[2] + offsetZ);
            model.metadata = artifactData[index];
            model.metadata.isRotating = false;
            model.metadata.initialY = model.position.y;

            model.metadata.initialRotationX = model.rotation.x;
            model.metadata.initialRotationZ = model.rotation.z;

            artifacts[index] = model;

            task.loadedMeshes.forEach(mesh => {
                mesh.isPickable = true;
                mesh.metadata = artifactData[index];
                mesh.checkCollisions = true;
                if (mesh.rotationQuaternion) {
                    mesh.rotation = mesh.rotationQuaternion.toEulerAngles();
                    mesh.rotationQuaternion = null;
                }
                mesh.metadata.initialRotationX = mesh.rotation.x;
                mesh.metadata.initialRotationZ = mesh.rotation.z;
            });

        };

        modelTask.onError = function(task, message, exception) {
            var fallbackCube = BABYLON.MeshBuilder.CreateBox("fallbackCube" + index, { width: 0.8, height: 0.8, depth: 0.8 }, scene);
            fallbackCube.position = new BABYLON.Vector3(position[0], adjustedHeight, position[2]);
            var cubeMat = new BABYLON.StandardMaterial("cubeMat" + index, scene);
            var colorIndex = index % 5;
            if (colorIndex === 0) cubeMat.diffuseColor = new BABYLON.Color3(0.85, 0.7, 0.2);
            else if (colorIndex === 1) cubeMat.diffuseColor = new BABYLON.Color3(0.15, 0.5, 0.7);
            else if (colorIndex === 2) cubeMat.diffuseColor = new BABYLON.Color3(0.9, 0.88, 0.8);
            else if (colorIndex === 3) cubeMat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.15);
            else cubeMat.diffuseColor = new BABYLON.Color3(0.6, 0.25, 0.2);
            fallbackCube.material = cubeMat;
            fallbackCube.metadata = artifactData[index];
            fallbackCube.metadata.isRotating = false;
            fallbackCube.metadata.initialY = fallbackCube.position.y;
            fallbackCube.metadata.initialRotationX = 0;
            fallbackCube.metadata.initialRotationZ = 0;
            artifacts[index] = fallbackCube;
            fallbackCube.checkCollisions = true;
        };
    }

    artifacts = new Array(positions.length);
    (async () => {
        for (let i = 0; i < positions.length; i++) {
            var pedestalHeight = (i === 9) ? 3 : 2;
            await loadGLBModel(i, positions[i], pedestalHeight);
        }
        assetsManager.load();

        assetsManager.onFinish = function() {
            artifacts.forEach((artifact, idx) => {
            });
        };
    })();

    var infoPanel = document.getElementById("info");
    var titleElement = document.getElementById("title");
    var descriptionElement = document.getElementById("description");
    var backButton = document.getElementById("back");
    var guidedTourButton = document.getElementById("guidedTour");
    var rotateModelButton = document.getElementById("toggleRotation");
    var becomeArtifactButton = document.getElementById("becomeArtifact");
    var tourTimeInput = document.getElementById("tourTime");
    var artifactList = document.getElementById("artifactItems");
    minimapCanvas = document.getElementById("minimap");
    minimapCtx = minimapCanvas.getContext("2d");

    var viewTopButton = document.getElementById("viewTop");
    var viewLeftButton = document.getElementById("viewLeft");
    var viewBackButton = document.getElementById("viewBack");
    var viewRightButton = document.getElementById("viewRight");
    var viewFrontButton = document.getElementById("viewFront");

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
        isMouseDown = false;
        isArtifactMode = false;
        if (artifactCamera) {
            artifactCamera.dispose();
            artifactCamera = null;
        }
        scene.activeCamera = camera;
        if (previousPosition && previousTarget) {
            camera.position = previousPosition.clone();
            camera.setTarget(previousTarget.clone());
        }
        infoPanel.style.display = "none";
        highlightArtifactInList(-1);
        document.exitPointerLock();
        camera._keys = [];
        camera.attachControl(canvas, true);
        canvas.style.cursor = "default";
        document.getElementById("crosshair").style.display = "none";
        if (rotateModelButton) rotateModelButton.textContent = "Activer Rotation";
        if (becomeArtifactButton) becomeArtifactButton.textContent = "Devenir l'œuvre";
        artifacts.forEach(artifact => {
            artifact.metadata.isRotating = false;
            artifact.metadata.velocityY = 0;
            artifact.position.y = artifact.metadata.initialY;
        });
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

    function animateCamera(targetPosition, newPosition) {
        document.exitPointerLock();
        camera._keys = [];
        camera.detachControl(canvas);
        canvas.style.cursor = "default";
        document.getElementById("crosshair").style.display = "none";
        BABYLON.Animation.CreateAndStartAnimation(
            "camPos",
            camera,
            "position",
            60,
            60,
            camera.position,
            newPosition,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.QuadraticEase(),
            () => {
                if (selectedArtifact && !isArtifactMode) {
                    canvas.style.cursor = "default";
                    document.getElementById("crosshair").style.display = "none";
                }
            }
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

    function moveCameraAroundArtifact(angleY, angleX, distance = 5) {
        if (selectedArtifact && !isArtifactMode) {
            var artifactPos = selectedArtifact.position;
            var newPosX = artifactPos.x + distance * Math.sin(angleY) * Math.cos(angleX);
            var newPosZ = artifactPos.z + distance * Math.cos(angleY) * Math.cos(angleX);
            var newPosY = artifactPos.y + distance * Math.sin(angleX);
            animateCamera(artifactPos, new BABYLON.Vector3(newPosX, newPosY, newPosZ));
        }
    }

    viewTopButton.addEventListener("click", () => moveCameraAroundArtifact(0, Math.PI / 2, 8));
    viewLeftButton.addEventListener("click", () => moveCameraAroundArtifact(Math.PI / 2, 0, 8));
    viewBackButton.addEventListener("click", () => moveCameraAroundArtifact(Math.PI, 0, 8));
    viewRightButton.addEventListener("click", () => moveCameraAroundArtifact(-Math.PI / 2, 0, 8));
    viewFrontButton.addEventListener("click", () => moveCameraAroundArtifact(0, 0, 8));

    if (rotateModelButton) {
        rotateModelButton.addEventListener("click", () => {
            if (selectedArtifact && selectedArtifact.metadata) {
                selectedArtifact.metadata.isRotating = !selectedArtifact.metadata.isRotating;
                rotateModelButton.textContent = selectedArtifact.metadata.isRotating ? "Désactiver Rotation" : "Activer Rotation";
            }
        });
    }

    if (becomeArtifactButton) {
        becomeArtifactButton.addEventListener("click", () => {
            if (selectedArtifact && !isTourActive) {
                isArtifactMode = true;
                becomeArtifactButton.textContent = "Quitter le mode œuvre";
                infoPanel.style.display = "none";

                camera.detachControl(canvas);
                scene.activeCamera = null;

                artifactCamera = new BABYLON.FollowCamera("artifactCamera", new BABYLON.Vector3(0, 10, 20), scene);
                artifactCamera.lockedTarget = selectedArtifact;
                artifactCamera.radius = 5;
                artifactCamera.heightOffset = 3;
                artifactCamera.rotationOffset = 0;
                artifactCamera.cameraAcceleration = 0.1;
                artifactCamera.maxCameraSpeed = 5;
                artifactCamera.noRotationConstraint = true;
                scene.activeCamera = artifactCamera;

                selectedArtifact.metadata.velocityY = 0;
                selectedArtifact.ellipsoid = new BABYLON.Vector3(0.3, 0.5, 0.3);
                selectedArtifact.checkCollisions = true;
                selectedArtifact.applyGravity = true;

                selectedArtifact.position.y += 2;
                selectedArtifact.position.x += 2;

                canvas.requestPointerLock();
            }
        });
    }

    window.addEventListener("keydown", function (evt) {
        evt.preventDefault();
        if (evt.key === "Escape" && modal && modal.style.display === "flex") {
            modal.style.display = "none";
        } else if (evt.keyCode === 69) {
            if (selectedArtifact && !isArtifactMode) {
                resetView();
            } else if (!isArtifactMode) {
                var nearestArtifact = null;
                var minDistance = Infinity;
                artifacts.forEach((mesh, index) => {
                    var distance = BABYLON.Vector3.Distance(camera.position, mesh.position);
                    if (distance < 10 && distance < minDistance) {
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
        } else if (evt.key === "Alt" && document.pointerLockElement === canvas) {
            document.exitPointerLock();
        } else if (evt.key === "c" && !selectedArtifact && !isArtifactMode && document.pointerLockElement !== canvas) {
            canvas.requestPointerLock();
        } else if (evt.key === "a" && modal) {
            modal.style.display = "flex";
        } else if (evt.key === "r") {
            location.reload(true);
        }
    });

    document.addEventListener("mousedown", function (evt) {
        if (evt.button === 0) {
            if (!selectedArtifact && !isArtifactMode && (!modal || modal.style.display === "none")) {
                canvas.requestPointerLock();
                canvas.style.cursor = "none";
                document.getElementById("crosshair").style.display = "block";
            } else if (selectedArtifact && !isArtifactMode) {
                isMouseDown = true;
                canvas.style.cursor = "grabbing";
            }
        }
    });

    document.addEventListener("mouseup", function (evt) {
        if (evt.button === 0) {
            isMouseDown = false;
            if (selectedArtifact && !isArtifactMode) {
                canvas.style.cursor = "grab";
            }
        }
    });

    document.addEventListener("pointerlockchange", function () {
        if (document.pointerLockElement === canvas && !selectedArtifact && !isArtifactMode) {
            canvas.style.cursor = "none";
            document.getElementById("crosshair").style.display = "block";
        } else if (document.pointerLockElement === canvas && isArtifactMode) {
            canvas.style.cursor = "none";
            document.getElementById("crosshair").style.display = "block";
        } else if (selectedArtifact && !isArtifactMode) {
            canvas.style.cursor = "grab";
            document.getElementById("crosshair").style.display = "none";
        } else {
            canvas.style.cursor = "default";
            document.getElementById("crosshair").style.display = "none";
        }
    });

    document.addEventListener("mousemove", function (evt) {
        if (!selectedArtifact && !isArtifactMode && document.pointerLockElement === canvas) {
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
        } else if (selectedArtifact && !isArtifactMode && isMouseDown) {
            var sensitivity = 0.005;
            var deltaX = evt.movementX * sensitivity;
            var deltaY = evt.movementY * sensitivity;

            var distance = BABYLON.Vector3.Distance(camera.position, selectedArtifact.position);
            var direction = camera.position.subtract(selectedArtifact.position).normalize();

            var rotationMatrixY = BABYLON.Matrix.RotationY(-deltaX);
            direction = BABYLON.Vector3.TransformCoordinates(direction, rotationMatrixY);

            var right = BABYLON.Vector3.Cross(direction, BABYLON.Vector3.Up()).normalize();
            var rotationMatrixX = BABYLON.Matrix.RotationAxis(right, deltaY);
            direction = BABYLON.Vector3.TransformCoordinates(direction, rotationMatrixX);

            if (direction.y < -0.9) direction.y = -0.9;
            if (direction.y > 0.9) direction.y = 0.9;

            camera.position = selectedArtifact.position.add(direction.scale(distance));
            camera.setTarget(selectedArtifact.position);
        } else if (isArtifactMode && selectedArtifact && artifactCamera && document.pointerLockElement === canvas) {
            var sensitivity = 0.5;
            var deltaX = evt.movementX * sensitivity;
            var deltaY = evt.movementY * sensitivity;

            artifactCamera.rotationOffset += deltaX;
            artifactCamera.heightOffset = Math.max(1, Math.min(10, artifactCamera.heightOffset - deltaY));
        }
    });

    canvas.addEventListener("wheel", function (evt) {
        if (selectedArtifact && !isArtifactMode) {
            var zoomSpeed = 0.5;
            var distance = BABYLON.Vector3.Distance(camera.position, selectedArtifact.position);
            var direction = camera.position.subtract(selectedArtifact.position).normalize();

            distance += evt.deltaY * zoomSpeed / 100;
            distance = Math.max(2, Math.min(20, distance));

            camera.position = selectedArtifact.position.add(direction.scale(distance));
            camera.setTarget(selectedArtifact.position);
            evt.preventDefault();
        } else if (isArtifactMode && selectedArtifact && artifactCamera) {
            artifactCamera.radius = Math.max(2, Math.min(10, artifactCamera.radius + evt.deltaY * 0.1));
            evt.preventDefault();
        }
    });

    camera.attachControl(canvas, true);

    guidedTourButton.addEventListener("click", () => {
        if (isTourActive || isArtifactMode) return;
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

    scene.registerBeforeRender(function () {
        if (selectedArtifact && selectedArtifact.metadata && selectedArtifact.metadata.isRotating && !isArtifactMode) {
            selectedArtifact.rotation.y += 0.02;
        }
        if (isArtifactMode && selectedArtifact && artifactCamera) {
            var deltaTime = engine.getDeltaTime() / 1000;
            var direction = artifactCamera.getFrontPosition(1).subtract(artifactCamera.position).normalize();
            direction.y = 0;
            var moveSpeed = 0.2;
            var movement = new BABYLON.Vector3(0, 0, 0);

            if (keysPressed.up) {
                movement.addInPlace(direction.scale(moveSpeed));
            }
            if (keysPressed.down) {
                movement.addInPlace(direction.scale(-moveSpeed));
            }
            if (keysPressed.left) {
                movement.addInPlace(BABYLON.Vector3.Cross(direction, BABYLON.Vector3.Up()).scale(moveSpeed));
            }
            if (keysPressed.right) {
                movement.addInPlace(BABYLON.Vector3.Cross(direction, BABYLON.Vector3.Up()).scale(-moveSpeed));
            }

            if (keysPressed.jump && Math.abs(selectedArtifact.position.y - selectedArtifact.metadata.initialY) <= 0.2) {
                selectedArtifact.metadata.velocityY = 5;
                keysPressed.jump = false;
            }
            if (selectedArtifact.applyGravity) {
                selectedArtifact.metadata.velocityY += -2 * deltaTime * 20;
            }
            movement.y = selectedArtifact.metadata.velocityY * deltaTime;

            selectedArtifact.moveWithCollisions(movement);

            if (selectedArtifact.position.y < selectedArtifact.metadata.initialY) {
                selectedArtifact.position.y = selectedArtifact.metadata.initialY;
                selectedArtifact.metadata.velocityY = 0;
            }
        }
    });

    return scene;
};

scene = createScene();

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

    var camX = (scene.activeCamera.position.x + 50) * 1.5;
    var camZ = (scene.activeCamera.position.z + 50) * 1.5;
    minimapCtx.fillStyle = "red";
    minimapCtx.beginPath();
    minimapCtx.arc(camX, camZ, 5, 0, 2 * Math.PI);
    minimapCtx.fill();
}

var modal = document.getElementById("welcomeModal");
var startButton = document.getElementById("startExploration");
var museumTitle = document.getElementById("museumTitle");

window.onload = function() {
    if (modal) modal.style.display = "flex";
};

if (startButton) {
    startButton.addEventListener("click", function(evt) {
        evt.stopPropagation();
        if (modal) {
            modal.style.display = "none";
        }
    });
}

if (museumTitle) {
    museumTitle.addEventListener("click", function() {
        if (modal) modal.style.display = "flex";
    });
}

engine.runRenderLoop(function () {
    scene.render();
    updateMinimap();

    if (!selectedArtifact && !isArtifactMode && camera.position.y > 5) {
        camera.cameraDirection.y += scene.gravity.y * engine.getDeltaTime() / 1000;
    } else if (!selectedArtifact && !isArtifactMode && camera.position.y < 5) {
        camera.position.y = 5;
        camera.cameraDirection.y = 0;
    }

    var showPrompt = false;
    if (!selectedArtifact && !isArtifactMode) {
        artifacts.forEach((mesh) => {
            var distance = BABYLON.Vector3.Distance(camera.position, mesh.position);
            if (distance < 10) {
                showPrompt = true;
            }
        });
    }
    interactionPrompt.style.display = showPrompt ? "block" : "none";
});

window.addEventListener("resize", function () {
    engine.resize();
});