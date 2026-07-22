document.addEventListener("DOMContentLoaded", () => {
    
    // Base de datos simulada de plagas para la demostración interactiva
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

    // Límite máximo de tareas activas simultáneas
    const MAX_TAREAS = 5;

    // Referencias a los elementos del DOM
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

    // Buscador con filtrado en tiempo real (por nombre común o científico)
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

    // Cerrar la lista desplegable al hacer clic fuera del buscador
    document.addEventListener("click", (e) => {
        if (e.target !== searchInput) {
            resultsContainer.style.display = "none";
        }
    });

    // Accesos rápidos por etiquetas (tags)
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

    // Carga dinámicamente la información técnica de la plaga seleccionada
    function cargarPlaga(plaga) {
        labelRisk.textContent = plaga.riesgo;
        
        // Ajuste de los estilos visuales del nivel de riesgo
        labelRisk.className = ""; 
        if (plaga.riesgo.includes("Alto")) labelRisk.className = "badge-danger";
        else if (plaga.riesgo.includes("Medio")) labelRisk.className = "badge-warning";
        else labelRisk.className = "badge-success";

        labelName.textContent = plaga.nombre;
        labelScientific.textContent = plaga.cientifico;
        labelDesc.textContent = plaga.desc;
        labelTreat.textContent = plaga.tratamiento;
    }

    // Creación y asignación de tareas de mitigación en el panel
    btnAction.addEventListener("click", () => {
        // Validar que no se supere el límite de tareas activas
        const tareasActuales = tasksContainer.querySelectorAll(".task-item").length;
        if (tareasActuales >= MAX_TAREAS) {
            const originalText = btnAction.innerHTML;
            btnAction.style.backgroundColor = "#e74c3c"; // Rojo de advertencia
            btnAction.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Límite (${MAX_TAREAS}) alcanzado`;
            
            setTimeout(() => {
                btnAction.style.backgroundColor = "";
                btnAction.innerHTML = originalText;
            }, 2000);
            return;
        }

        const nombrePlaga = labelName.textContent;
        const lote = targetLot.value;
        const accionPredeterminada = (nombrePlaga.includes("Roya")) ? "Aplicación de Cobre" : 
                                     (nombrePlaga.includes("Broca")) ? "Trampas de Captura" : "Aspersión Foliar";

        const nuevaTarea = document.createElement("div");
        nuevaTarea.className = "task-item";
        nuevaTarea.innerHTML = `
            <div class="task-status-dot pending"></div>
            <div class="task-details">
                <h4>${accionPredeterminada}</h4>
                <p class="task-sub">${nombrePlaga} · <strong>${lote}</strong></p>
                <span class="task-date">Iniciada hace unos instantes</span>
            </div>
            <button class="btn-complete-task"><i class="fa-solid fa-check"></i></button>
        `;

        // Agregar la nueva tarea al inicio de la lista
        tasksContainer.prepend(nuevaTarea);
        actualizarContador();

        // Retroalimentación visual interactiva en el botón
        const originalText = btnAction.innerHTML;
        btnAction.style.backgroundColor = "#3b9d85";
        btnAction.innerHTML = `<i class="fa-solid fa-circle-check"></i> ¡Tarea Asignada!`;
        setTimeout(() => {
            btnAction.style.backgroundColor = "";
            btnAction.innerHTML = originalText;
        }, 1800);
    });

    // Gestión para completar y remover tareas con animación
    tasksContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-complete-task");
        if (!btn) return;

        const item = btn.parentElement;
        item.style.transform = "scale(0.9)";
        item.style.opacity = "0";
        setTimeout(() => {
            item.remove();
            actualizarContador();
        }, 250);
    });

    // Actualiza el indicador visual de tareas activas
    function actualizarContador() {
        const total = tasksContainer.querySelectorAll(".task-item").length;
        if (taskCounter) {
            taskCounter.textContent = `${total} Activas`;
        }
    }
});