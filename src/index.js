document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.clear()
    sessionStorage.setItem('transitions', '[]')
    var pointerStatus = sessionStorage.getItem('puntero-estado')
    var pointerTransition = sessionStorage.getItem('puntero-arco')
    sessionStorage.setItem('puntero-estado', 'false')
    sessionStorage.setItem('puntero-arco', 'true')
    onChangeStatus()
    onChangeTransition()

    document.getElementById("transitionDiv").addEventListener("click", () => {
        onChangeStatus()
        onChangeTransition()
    })

    document.getElementById("statusDiv").addEventListener("click", () => {
        onChangeStatus()
        onChangeTransition()
    });

    document.getElementById("dropDiv").addEventListener("mouseover", (ev) => {
        pointerStatus = sessionStorage.getItem('puntero-estado')
        let board = document.getElementById("dropDiv");

        if (pointerStatus === 'true') {
            board.style.cursor = "pointer";
        } else {
            board.style.cursor = "";
        }
    })

    document.getElementById("dropDiv").addEventListener("click", (ev) => {
        pointerStatus = sessionStorage.getItem('puntero-estado')
        let clickOnBoard = ev.target.id === "dropDiv" ? true : false
        let clickOnSvg = ev.target.id === "svg" ? true : false
        if (pointerStatus === 'true' && (clickOnBoard || clickOnSvg)) {
            let board = document.getElementById("dropDiv");
            let rect = ev.target.getBoundingClientRect();
            let x = ev.clientX - rect.x;
            let y = ev.clientY - rect.y;
            // Crear un elemento de imagen y establecer su src
            let divStatus = createStatus(x, y, '')
            board.appendChild(divStatus);
        }
    })
})

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    console.log('drop');
    ev.preventDefault();
    let pointerStatus = sessionStorage.getItem('puntero-estado')
    // Obtener la posicion del board y la posicion de los datos transferidos
    let rect = ev.target.getBoundingClientRect();
    let x = ev.clientX - rect.x;
    let y = ev.clientY - rect.y;
    let divStatus = createStatus(x, y, 'aux-status')

    // Agregar la imagen al div de destino
    document.getElementById("dropDiv").appendChild(divStatus);
}

function dragEndDiv(ev) {
    //En session las coordenadas viejas del div arrastrado, para su posterior uso en updateArrow
    let divStatus = document.getElementById(ev.target.id)
    let x = divStatus.style.left.replace('px', '')
    let y = divStatus.style.top.replace('px', '')
    sessionStorage.setItem('xOld', x)
    sessionStorage.setItem('yOld', y)

    //Actualizo cantidad de estados
    let i = sessionStorage.getItem('cantidad-estados')
    i--
    sessionStorage.setItem('cantidad-estados', i)

    //Elimino el div y le pongo el id al nuevo div que se creo en el evento drop()
    let div = ev.target; // Obtén el elemento que se está arrastrando
    let id = ev.target.id
    let color = getColor(parseInt(id.replace('div-status-', '')))
    div.parentNode.removeChild(div); // Elimina el div
    let newDiv = document.getElementById("aux-status")
    newDiv.id = id
    newDiv.style.border = `solid 1px ${color}`
    updateArrow(ev)
    renderGraphic()
}

function onChangeTransition() {
    pointerTransition = sessionStorage.getItem('puntero-arco')
    let div = document.getElementById("transitionDiv");
    if (pointerTransition === 'true') {
        sessionStorage.setItem('puntero-arco', 'false')
        div.style.backgroundColor = "transparent";
    } else {
        sessionStorage.setItem('puntero-arco', 'true')
        div.style.backgroundColor = "#98acba43";
    }
}

function onChangeStatus() {
    pointerStatus = sessionStorage.getItem('puntero-estado')
    let div = document.getElementById("statusDiv");
    if (pointerStatus === 'true') {
        sessionStorage.setItem('puntero-estado', 'false')
        div.style.backgroundColor = "transparent";
    } else {
        sessionStorage.setItem('puntero-estado', 'true')
        div.style.backgroundColor = "#98acba43";
    }
}

function createStatus(x, y, id) {
    let i = sessionStorage.getItem('cantidad-estados')
    i++

    sessionStorage.setItem('cantidad-estados', i)
    // Crear un elemento de imagen y establecer su src
    let divStatus = document.createElement("div");
    divStatus.className = "element-status"
    id == '' ? divStatus.id = `div-status-${i}` : divStatus.id = id
    let color = getColor(parseInt(divStatus.id.replace('div-status-', '')))
    divStatus.style.width = "36px";
    divStatus.style.height = "36px";
    divStatus.style.backgroundImage = "url('../public/images/sombra.png')";
    divStatus.style.backgroundSize = "cover";
    divStatus.style.borderRadius = "50%"
    divStatus.style.position = "absolute";
    divStatus.style.border = `solid 1px ${color}`
    divStatus.style.left = x + "px";
    divStatus.style.top = y + "px";
    divStatus.draggable = true;


    divStatus.ondragend = function (event) {
        dragEndDiv(event);
    };

    divStatus.onclick = function (event) {
        onClickStatus(event)
    }

    return divStatus
}

function onClickStatus(event) {
    console.log("click status");
    let divStatus = document.getElementById(event.target.id)
    let q = {
        num: event.target.id.replace('div-status-', ''),
        id: event.target.id,
        x: divStatus.style.left.replace('px', ''),
        y: divStatus.style.top.replace('px', '')
    }

    let qOrigin = JSON.parse(sessionStorage.getItem('estado-origen'))
    if (qOrigin === null || qOrigin === '') {
        //No hay nada asi que es el origen
        divStatus.style.boxShadow = "0 0 15px rgba(255, 125, 0, 0.5)"
        sessionStorage.setItem('estado-origen', JSON.stringify(q))
    } else {
        //Hay nodo origen
        if (qOrigin.id === q.id) {
            //Se hizo click sobre el nodo origen
            divStatus.style.boxShadow = ""
            sessionStorage.removeItem('estado-origen')
        } else {
            //NO se hizo click sobre el nodo origen
            if (divStatus.style.boxShadow !== "") {
                divStatus.style.boxShadow = ""
                sessionStorage.removeItem('estado-destino')
                deleteTrasition()
            } else {
                //Quito la sombra a un nodo destino previo si hubiera
                let qDestiny = JSON.parse(sessionStorage.getItem('estado-destino'))
                if (qDestiny !== null && qDestiny !== '') {
                    let divPrevStatus = document.getElementById(qDestiny.id)
                    divPrevStatus.style.boxShadow = ""
                }
                divStatus.style.boxShadow = "0 0 15px rgba(125, 255, 0, 0.5)"
                sessionStorage.setItem('estado-destino', JSON.stringify(q))
                createTransition()
            }
        }
    }
}

function createTransition() {
    let qOrigin = JSON.parse(sessionStorage.getItem('estado-origen'))
    let qDestiny = JSON.parse(sessionStorage.getItem('estado-destino'))
    let input = 101
    let output = 1
    createArrow(qOrigin.x, qOrigin.y, qDestiny.x, qDestiny.y, input, output, qOrigin.num)
    renderGraphic()

    document.getElementById(qOrigin.id).style.boxShadow = ""
    document.getElementById(qDestiny.id).style.boxShadow = ""
    // sessionStorage.setItem('estado-origen', '')
    // sessionStorage.setItem('estado-destino', '')
    sessionStorage.removeItem('estado-origen')
    sessionStorage.removeItem('estado-destino')

}

function renderGraphic() {
    //Borro todo
    // Obtener todos los elementos con id "arrow"
    let elementosArrow = document.querySelectorAll('[id="arrow"]');
    elementosArrow.forEach(function (elemento) {
        elemento.parentNode.removeChild(elemento);
    });

    //Creo de nuevo
    let divBoard = document.getElementById("dropDiv");
    let arrArrow = JSON.parse(sessionStorage.getItem('transitions'))
    let svg = ''
    if (arrArrow !== null) {
        arrArrow.forEach(element => {
            svg = getSvgArrow(element)
            divBoard.appendChild(svg);
        });
    }
}

function updateArrow(ev) {
    //Obteno las coordenadas viejas del div-status que cambio de lugar
    let xOld = sessionStorage.getItem('xOld')
    let yOld = sessionStorage.getItem('yOld')
    sessionStorage.removeItem('xOld')
    sessionStorage.removeItem('yOld')
    //Obteno las coordenadas nuevas del div-status que cambio de lugar
    let divStatus = document.getElementById(ev.target.id)
    let x = divStatus.style.left.replace('px', '')
    let y = divStatus.style.top.replace('px', '')

    //Cambio las ordenadas viejas por las nuevas en el array de transiciones
    let arrArrow = JSON.parse(sessionStorage.getItem('transitions'))
    if (arrArrow !== null) {
        arrArrow.forEach(element => {
            if (element.xO == xOld) element.xO = x
            if (element.xD == xOld) element.xD = x
            if (element.yO == yOld) element.yO = y
            if (element.yD == yOld) element.yD = y
        });
    }

    sessionStorage.setItem('transitions', JSON.stringify(arrArrow))
}

function createArrow(xO, yO, xD, yD, input, output, num) {
    let arrow = {
        xO,
        yO,
        xD,
        yD,
        input,
        output,
        num
    }
    let arrArrow = JSON.parse(sessionStorage.getItem('transitions'))
    arrArrow.push(arrow)
    sessionStorage.setItem('transitions', JSON.stringify(arrArrow))
}

function getSvgArrow(arrow) {
    let posOriginX = parseInt(arrow.xO) + 16
    let posOriginY = parseInt(arrow.yO)
    let posDestinyX = 0
    if (parseInt(arrow.xO) < parseInt(arrow.xD)) {
        posDestinyX = parseInt(arrow.xD)
    } else {
        posDestinyX = parseInt(arrow.xD) + 31
        console.log(parseInt(arrow.xO), parseInt(arrow.xD));
    }
    let posDestinyY = parseInt(arrow.yD) - 2
    let color = getColor(parseInt(arrow.num))
    // let cX = posOriginX + Math.abs(posDestinyX - posOriginX)
    // let cY = posOriginY + Math.abs(posDestinyY - posOriginY)
    let divSvg = document.createElement("div");
    divSvg.id = "arrow"
    divSvg.style = "top: ${arrow.xO}px; left: ${arrow.yO}px; pointer-events: none;"
    let svgString = `
        <svg pointer-events:"none" id="svg" width="100%" height="100%">
            <path
            id="flechaCurva"
            fill="none"
            stroke="${color}"
            stroke-width="2"
            d="M ${posOriginX},${posOriginY} ${posDestinyX},${posDestinyY}"
            marker-end="url(#flecha${arrow.num})"
            />
            <marker
            id="flecha${arrow.num}"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
            >
            <path d="M0,0 L0,6 L9,3 z" fill="${color}" />
            </marker>
        </svg>
    `
    divSvg.innerHTML = svgString
    return divSvg
}

function deleteTrasition() { }

function getColor(numero) {
    let color;

    switch (numero) {
        case 1:
            color = '#ff00ff'; // Magenta neon
            break;
        case 2:
            color = '#00ffff'; // Cyan neon
            break;
        case 3:
            color = '#ffff00'; // Amarillo neon
            break;
        case 4:
            color = '#ff0000'; // Rojo neon
            break;
        case 5:
            color = '#00ff00'; // Verde neon
            break;
        case 6:
            color = '#0000ff'; // Azul neon
            break;
        case 7:
            color = '#ff0088'; // Rosa neon
            break;
        case 8:
            color = '#00ff88'; // Verde menta neon
            break;
        case 9:
            color = '#0088ff'; // Azul cielo neon
            break;
        case 10:
            color = '#ff8800'; // Naranja neon
            break;
        case 11:
            color = '#8800ff'; // Morado neon
            break;
        case 12:
            color = '#00ffaa'; // Verde lima neon
            break;
        case 13:
            color = '#aaff00'; // Lima neon
            break;
        case 14:
            color = '#ffaa00'; // Ámbar neon
            break;
        case 15:
            color = '#ff00aa'; // Rosa fucsia neon
            break;
        case 16:
            color = '#00aaff'; // Azul eléctrico neon
            break;
        case 17:
            color = '#00aaff'; // Azul índigo neon
            break;
        case 18:
            color = '#aaff00'; // Verde manzana neon
            break;
        case 19:
            color = '#ffaa00'; // Dorado neon
            break;
        case 20:
            color = '#ff00aa'; // Rosado neon
            break;
        default:
            color = '#ffffff'; // Blanco (por defecto)
            break;
    }
    console.log(color);
    return color;
}
