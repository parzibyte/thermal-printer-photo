document.addEventListener("DOMContentLoaded", async () => {
    /*
        Imprimir fotos seleccionadas en impresora térmica
        @date 2024-09-20
        @author parzibyte
        @web parzibyte.me/blog
    */

    const $impresoras = document.querySelector("#impresoras"),
        $imprimir = document.querySelector("#imprimir"),
        $algoritmo = document.querySelector("#algoritmo"),
        $licencia = document.querySelector("#licencia"),
        $fotosSeleccionadas = document.querySelector("#fotosSeleccionadas"),
        $maximoAncho = document.querySelector("#maximoAncho"),
        $aplicarDithering = document.querySelector("#aplicarDithering");

    const imprimirFoto = async (nombreImpresora, fotoEnBase64, algoritmo, licencia, maximoAncho, aplicarDithering) => {
        const payload = {
            "serial": licencia,
            "nombreImpresora": nombreImpresora,
            "operaciones": [
                {
                    "nombre": "Iniciar",
                    "argumentos": [
                    ]
                },
                {
                    "nombre": "ImprimirImagenEnBase64",
                    "argumentos": [
                        fotoEnBase64,
                        maximoAncho,
                        algoritmo,
                        aplicarDithering
                    ]
                },
                {
                    "nombre": "Feed",
                    "argumentos": [
                        2
                    ]
                },
            ]
        };
        const httpResponse = await fetch("http://localhost:8000/imprimir",
            {
                method: "POST",
                body: JSON.stringify(payload),
            });

        const jsonResponse = await httpResponse.json();
        if (jsonResponse.ok) {
            // Everything is ok
            console.log("Printed successfully");
        } else {
            // Error message is on message property
            console.error(jsonResponse.message)
        }
    }

    const obtenerImpresoras = async () => {
        const respuesta = await fetch("http://localhost:8000/impresoras");
        const impresoras = await respuesta.json();
        for (const impresora of impresoras) {
            const option = Object.assign(document.createElement("option"), {
                value: impresora,
                text: impresora,
            })
            $impresoras.appendChild(option);
        }
    }

    const fileToBase64 = async function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                resolve(reader.result);
            };
            reader.onerror = error => {
                reject(error);
            }
            reader.readAsDataURL(file);
        });
    }

    await obtenerImpresoras();
    $imprimir.addEventListener("click", async () => {
        for (const foto of $fotosSeleccionadas.files) {
            const imagenEnBase64 = await fileToBase64(foto);
            await imprimirFoto($impresoras.value, imagenEnBase64, parseInt($algoritmo.value), $licencia.value, $maximoAncho.valueAsNumber, $aplicarDithering.checked);
        }
    });
});