import Konva from "konva";
import { createMachine, interpret } from "xstate";


const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

const layer = new Konva.Layer();
stage.add(layer);

const MAX_POINTS = 10;
let polyline // La polyline en cours de construction;

const polylineMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QFEAeYBOBjAllsABAAoD2ANgJ5k4B2hEhAUmAIY0C0AQiwA4AuOWH0KdkAOWQAVSQEkAdDJo4BLMgSEthAYgCyAeQCqAZWQBhADIzTAaQDaABgC6iUDxKxlOEjRchUiADYAZgAOOXsARgAmAKiAVgAWCPsogE4IiIAaEApEdjCI1KL01KD7IIB2SIiQgF9a7LRMXHxicipaeiZWDm5+QWECUQlpeQB1FmVdQxN9ADVkB2ckEDcPAW9ffwR2CIqwhJCKqP2a+wC4lOzchCiQiLlioqCghKiUqPrG9Gw8QlJKNQ6AQGARmGwuLwBEIROIpLI5BMpshYFheGAlr41p5NittpcAnIQpVYiE4lETkETtdEBFXnJyQlUhVUnF9lEEhU4l8QE1fq0AR1gaDwb0oQNYSMEUi+FpkDRhBgCDIAGIAXh4LFgRDIYFoBDYEGV6p4ZAArrAACJga1m1CkWh8WCYlbYjY+PGIBL2CpyZKRNIhEKpexxUJxGm3IpyJnFSqhCJM+wJHl8lr-dpArpgnqQ-owoZw0aIyay-TGMyWGzGjW62gu1zuHEe0D42JyAL2SLBVIxS6cyOc31BS41EfHOIhCkphq8n7ptqAzog7oQvrQwbDeHjUtabhYADWsE1rVVGq1Or1NGQfB1FuttvtJEdzqcWKb7q2eW9CXCXfKgYknEqSRskhIpEyVQjl2bJ7Km85-IuQrZqKeYbpK24llM5YmBYVjWDWmranWNANqsH5eC2fh5AEqR+v+QSFMyITnCOkbsGUchVP+hQVAESTMuS9SzjQJAMPAKxpohgpZiuOZruKBZbqM77rJRX47Ak5J-l2VKpMSfHAexGS+k8+mGe8xIBPBzTSZmy4irm64SoWUryIoniqOofCaGAqnNhpU5xESsSXBUFScgExxBJGaRRAyEVFO8XKlHEiY2fyGZLsKq5ivmm5FtKpb+Z+noIBE7bcZERxhkcQSpAEkZhr+07Ml24XJBUQTCbUQA */
        id: "Exercice Polyline de Jean-Baptiste BENETTI",
        initial: "Initial state",
        states: {
            "Initial state": {
                on: {
                    MOUSECLICK: {
                        target: "Wait",
                        actions: "createLine",
                    }
                }
            },

            "Wait": {
                on: {
                    "MOUSEMOVE": {
                        target: "Wait",
                        cond: pasPlein,
                        actions: "setLastPoint",
                    },

                    "Escape": {
                        target: "Initial state",
                        cond: plusDeDeuxPoints,
                        actions: {
                            type: "abandon",
                        },
                    },

                    "Enter IF=pasPlein and IF=plusDeDeuxPoints": {
                        target: "Initial state",
                        actions: {
                            type: "saveLine",
                        },
                    },

                    "MOUSECLICK IF=plein": {
                        target: "Initial state",
                        actions: {
                            type: "saveLine",
                        },
                    },

                    "MOUSECLICK IF=pasPlein": {
                        target: "Wait",
                        actions: {
                            type: "addPoint",
                        },
                    }
                },
            }
        },
    },

    // Quelques actions et guardes que vous pouvez utiliser dans votre machine
    {
        actions: {
            // Créer une nouvelle polyline
            createLine: (context, event) => {
                const pos = stage.getPointerPosition();
                polyline = new Konva.Line({
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: "red",
                    strokeWidth: 2,
                });
                layer.add(polyline);
            },
            // Mettre à jour le dernier point (provisoire) de la polyline
            setLastPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;

                const newPoints = currentPoints.slice(0, size - 2); // Remove the last point
                polyline.points(newPoints.concat([pos.x, pos.y]));
                layer.batchDraw();
            },
            // Enregistrer la polyline
            saveLine: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                // Le dernier point(provisoire) ne fait pas partie de la polyline
                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints);
                layer.batchDraw();
            },
            // Ajouter un point à la polyline
            addPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const newPoints = [...currentPoints, pos.x, pos.y]; // Add the new point to the array
                polyline.points(newPoints); // Set the updated points to the line
                layer.batchDraw(); // Redraw the layer to reflect the changes
            },
            // Abandonner le tracé de la polyline
            abandon: (context, event) => {
                polyline.remove();
            },
            // Supprimer le dernier point de la polyline
            removeLastPoint: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                const provisoire = currentPoints.slice(size - 2, size); // Le point provisoire
                const oldPoints = currentPoints.slice(0, size - 4); // On enlève le dernier point enregistré
                polyline.points(oldPoints.concat(provisoire)); // Set the updated points to the line
                layer.batchDraw(); // Redraw the layer to reflect the changes
            },
        },
        guards: {
            // On peut encore ajouter un point
            pasPlein: (context, event) => {
                return polyline.points().length < MAX_POINTS * 2;
            },
            plein: (context, event) => {
                return polyline.points().length >= MAX_POINTS * 2;
            },
            // On peut enlever un point
            plusDeDeuxPoints: (context, event) => {
                // Deux coordonnées pour chaque point, plus le point provisoire
                return polyline.points().length >= 6;
            },
            pasPleinEtPlusDeDeuxPoints: (context, event) => {
                // Deux coordonnées pour chaque point, plus le point provisoire
                if (polyline.points().length >= 6 && polyline.points().length < MAX_POINTS * 2) {
                    return true;
                } else {
                    return false;
                };
            },
        },
    }
);

// On démarre la machine
const polylineService = interpret(polylineMachine)
    .onTransition((state) => {
        console.log("Current state:", state.value);
    })
    .start();
// On envoie les événements à la machine
stage.on("click", () => {
    polylineService.send("MOUSECLICK");
});

stage.on("mousemove", () => {
    polylineService.send("MOUSEMOVE");
});

// Envoi des touches clavier à la machine
window.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);
    // Enverra "a", "b", "c", "Escape", "Backspace", "Enter"... à la machine
    polylineService.send(event.key);
});
