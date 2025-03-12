var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.96, 0.91, 0.82);

    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 40, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 200;
    camera.wheelPrecision = 10;

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

    var pyramidMat = new BABYLON.StandardMaterial("pyramidMat", scene);
    pyramidMat.diffuseTexture = groundTexture;
    pyramidMat.diffuseColor = new BABYLON.Color3(0.93, 0.83, 0.68);
    pyramidMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    pyramid.material = pyramidMat;

    function createPedestal(position, height = 2) {
        var pedestalBase = BABYLON.MeshBuilder.CreateBox("pedestalBase", {
            width: 2.4,
            height: height * 0.9,
            depth: 2.4
        }, scene);
        pedestalBase.position = new BABYLON.Vector3(position[0], height * 0.45, position[2]);

        var pedestalTop = BABYLON.MeshBuilder.CreateBox("pedestalTop", {
            width: 2.6,
            height: height * 0.1,
            depth: 2.6
        }, scene);
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

    var artifacts = [];
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

            console.log(`Modèle ${index} (${artifactName}):`);
            console.log(`ScaleFactor appliqué: ${scaleFactor}`);
            console.log(`Position: ${model.position}`);

            model.metadata = artifactData[index];
            artifacts.push(model);

            for (var i = 0; i < task.loadedMeshes.length; i++) {
                task.loadedMeshes[i].isPickable = true;
                task.loadedMeshes[i].metadata = artifactData[index];
            }
        };

        modelTask.onError = function(task, message, exception) {
            console.log("Erreur lors du chargement du modèle " + index + ": " + message);
            var fallbackCube = BABYLON.MeshBuilder.CreateBox("fallbackCube" + index, {
                width: 0.8,
                height: 0.8,
                depth: 0.8
            }, scene);
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

    function resetView() {
        camera.target = BABYLON.Vector3.Zero();
        BABYLON.Animation.CreateAndStartAnimation(
            "unzoom",
            camera,
            "radius",
            60,
            40,
            camera.radius,
            50,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        infoPanel.style.display = "none";
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

            camera.target = targetMesh.position.clone();
            BABYLON.Animation.CreateAndStartAnimation(
                "zoom",
                camera,
                "radius",
                30,
                60,
                camera.radius,
                8,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
        }
    };

    return scene;
};

var scene = createScene();

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

engine.runRenderLoop(function () { scene.render(); });
window.addEventListener("resize", function () { engine.resize(); });