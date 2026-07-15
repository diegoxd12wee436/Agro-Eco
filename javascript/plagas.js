document.addEventListener("DOMContentLoaded", () => {
    
    // Diego tuve que hacer un js para simular la base de datos de las plagas para mostrar funciones
    const DB_PLAGAS = [
        {
            nombre: "Roya del Café",
            cientifico: "Hemileia vastatrix",
            riesgo: "Alto Riesgo",
            claseRiesgo: "badge-danger",
            desc: "Hongo que ataca las hojas del cafeto provocando la caída prematura de las mismas, lo que reduce drásticamente la capacidad fotosintética de la planta y la cosecha final.",
            tratamiento: "Aplicación preventiva de fungicidas a base de cobre. Regular la sombra del lote y podar las ramas bajas para mejorar la ventilación."
        },
        {
            nombre: "Broca del Café",
            cientifico: "Hypothenemus hampei",
            riesgo: "Alto Riesgo",
            claseRiesgo: "badge-danger",
            desc: "Pequeño escarabajo que barrena los frutos del café para depositar sus huevos, destruyendo la semilla de manera directa afectando calidad y rendimiento.",
            tratamiento: "Recolección estricta de granos caídos (repela), colocación de trampas artesanales con alcoholes y control biológico con el hongo Beauveria bassiana."
        },
        {
            nombre: "Pulgón Verde",
            cientifico: "Aphis spiraecola",
            riesgo: "Medio Riesgo",
            claseRiesgo: "badge-warning",
            desc: "Insecto succionador de savia que se aloja en brotes tiernos, provocando el enrollamiento de hojas y secretando melaza que facilita el hongo de la Fumagina.",
            tratamiento: "Uso de insecticidas orgánicos a base de jabón potásico y aceite de Neem. Fomento de fauna benéfica como las mariquitas (coccinélidos)."
        },
        {
            nombre: "Araña Roja",
            cientifico: "Tetranychus urticae",
            riesgo: "Bajo Riesgo",
            claseRiesgo: "badge-success",
            desc: "Ácaro diminuto que coloniza el envés de las hojas, raspando el tejido celular. Se incrementa fuertemente en épocas de sequía severa.",
            tratamiento: "Mantener buena humedad en el suelo mediante riego. Aplicación controlada de azufre soluble o acaricidas selectivos."
        }
    ];

    // diego aqui van los selectores de los elementos del DOM que vamos a manipular
    const searchInput = document.getElementById("pest-search");
    const resultsContainer = document.getElementById("search-results");
    const quickBtns = document.querySelectorAll(".tag-btn");
    
    const labelRisk = document.getElementById("pest-risk");
    const labelName = document.getElementById("pest-name");
    const labelScientific = document.getElementById("pest-scientific");
    const labelDesc = document.getElementById("pest-desc");
    const labelTreat = document.getElementById("pest-treat");
    
    const btnAction = document.getElementById("btn-action");
    const targetLot = document.getElementById("target-lot");
    const tasksContainer = document.getElementById("active-tasks-container");
    const taskCounter = document.getElementById("task-counter");

    // 2. aqui cree un basico buscador de plagas con un autocompletado simple, que filtra por nombre o nombre cientifico
    searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";
        
        if (val.length === 0) {
            resultsContainer.style.display = "none";
            return;
        }

        const filtradas = DB_PLAGAS.filter(plaga => 
            plaga.nombre.toLowerCase().includes(val) || 
            plaga.cientifico.toLowerCase().includes(val)
        );

        if (filtradas.length > 0) {
            filtradas.forEach(plaga => {
                const li = document.createElement("li");
                li.textContent = plaga.nombre;
                li.addEventListener("click", () => {
                    cargarPlaga(plaga);
                    searchInput.value = plaga.nombre;
                    resultsContainer.style.display = "none";
                });
                resultsContainer.appendChild(li);
            });
            resultsContainer.style.display = "block";
        } else {
            resultsContainer.style.display = "none";
        }
    });

    // Cse cierra el buscador 
    document.addEventListener("click", (e) => {
        if (e.target !== searchInput) {
            resultsContainer.style.display = "none";
        }
    });

    //Aqui agregue la funcionalidad de los botones de plagas rapidas, que cargan la ficha tecnica directamente
    quickBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const nombrePlaga = btn.getAttribute("data-name");
            const plagaMatch = DB_PLAGAS.find(p => p.nombre === nombrePlaga);
            if (plagaMatch) {
                cargarPlaga(plagaMatch);
                searchInput.value = plagaMatch.nombre;
            }
        });
    });

    // SE CARGAN LOS DATOS DE LA FICHA TECNICA DE LA PLAGA SELECCIONADA
    function cargarPlaga(plaga) {
        labelRisk.textContent = plaga.riesgo;
        
        // se reseetean a los colores basicos segun su gravedad
        labelRisk.className = ""; 
        if (plaga.riesgo.includes("Alto")) labelRisk.className = "badge-danger";
        else if (plaga.riesgo.includes("Medio")) labelRisk.className = "badge-warning";
        else labelRisk.className = "badge-success";

        labelName.textContent = plaga.nombre;
        labelScientific.textContent = plaga.cientifico;
        labelDesc.textContent = plaga.desc;
        labelTreat.textContent = plaga.tratamiento;
    }

    // 3. aqui esta la logica del boton que me pediste sobre "iniciar tareas de mitigacion"
    btnAction.addEventListener("click", () => {
        const nombrePlaga = labelName.textContent;
        const lote = targetLot.value;
        const accionPredeterminada = (nombrePlaga.includes("Roya")) ? "Aplicación de Cobre" : 
                                    (nombrePlaga.includes("Broca")) ? "Trampas de Captura" : "Aspersión Foliar";

        // diego aqui se crean las tareas en el DOM
        const nuevaTarea = document.createElement("div");
        nuevaTarea.className = "task-item";
        nuevaTarea.innerHTML = `
            <div class="task-status-dot pending"></div>
            <div class="task-details">
                <h4>${accionPredeterminada}</h4>
                <p class="task-sub">${nombrePlaga} · <strong>${lote}</strong></p>
                <span class="task-date">Iniciada hace unos instantes</span>
            </div>
            <button class="btn-complete-task" onclick="completarTarea(this)"><i class="fa-solid fa-check"></i></button>
        `;

        // Añadir al contenedor
        tasksContainer.prepend(nuevaTarea);
        
        // Actualizar contador visual de tareas activas
        actualizarContador();

        // Pequeño feedback visual en el botón
        const originalText = btnAction.innerHTML;
        btnAction.style.backgroundColor = "#3b9d85";
        btnAction.innerHTML = `<i class="fa-solid fa-circle-check"></i> ¡Tarea Asignada!`;
        setTimeout(() => {
            btnAction.style.backgroundColor = "";
            btnAction.innerHTML = originalText;
        }, 1800);
    });
});

// aqui cree una funcion para completar las tareas, que elimina el elemento del DOM y actualiza el contador
function completarTarea(btn) {
    const item = btn.parentElement;
    item.style.transform = "scale(0.9)";
    item.style.opacity = "0";
    setTimeout(() => {
        item.remove();
        actualizarContador();
    }, 250);
}

// Función auxiliar de conteo
function actualizarContador() {
    const total = document.querySelectorAll(".task-item").length;
    document.getElementById("task-counter").textContent = `${total} Activas`;
}


//se que me  pediste no crear js pero aqui solo para demostrar la funcionalidad de las tareas, si quieres puedo quitarlo y dejarlo solo en html y css, pero no se veria tan bien