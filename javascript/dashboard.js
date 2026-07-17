//Seccion del SideBar para hacer el radioButton
const btnClicked = document.querySelectorAll('.sidebar ul li a');

//buscar que boton esta activo y cambiar el color de fondo
btnClicked.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault(); // Evitar que el enlace se siga como un loop basicamente evita bug

        //passos 1: Remover la clase "active" de todos los botones
        btnClicked.forEach(btn => {
            btn.classList.remove('active');
        });
        //Paso 2: Agregar La clase "active" al boton clickeado
        btn.classList.add('active');



    });
});