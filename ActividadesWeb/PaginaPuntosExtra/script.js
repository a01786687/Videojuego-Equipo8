$(document).ready(function () {

    let text = $("#title").text();
    $("#title").text("");

    let i = 0;
    let speed = 80;

    function typeWriter() {
        if (i < text.length) {
            $("#title").append(text.charAt(i));
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();
});


function StarRatings(x) {

    let stars = document.querySelectorAll(".star-button"); // querySelectorAll() method returns all elements that matches a CSS selector(s).

    // reset all stars
    stars.forEach(function (star) {
        star.classList.remove("active");
    });

    // Activate stars up to selected
    for (let i = 0; i < x; i++) {
        stars[i].classList.add("active");
    }


    if (x == 1) {
        document.getElementById("par").innerHTML = "It’s okay. Tomorrow’s a new start.";
    }
    else if (x == 2) {
        document.getElementById("par").innerHTML = "Not the best, but that’s alright!";
    }
    else if (x == 3) {
        document.getElementById("par").innerHTML = "A pretty normal day.";
    }
    else if (x == 4) {
        document.getElementById("par").innerHTML = "Nice job, keep it up!";
    }
    else if (x == 5) {
        document.getElementById("par").innerHTML = "That was a really good day!";
    }
    else {
        return;
    }

}

function resetRating() { // esta funcion se ejecuta al presionar el botón

    // document -> pagina HTML
    // getElementById("par") -> busca el elemento con id="par"
    // .innerText -> cambia el texto que esta dentro del elemento
    // es decir, al hacer click en el boton Reset, cambia el texto que muestra al presionar estrellas al original que es "Click on buttons to rate your day"
    document.getElementById("par").innerText = "Click on buttons to rate your day";


    // guardar todas las estrellas
    // querySelectorAll(".star-button") -> selecciona todos los elementos con la clase .star-button, en este caso los 5 botones de estrellas
    // se guardan en la variable stars
    // NOTA: stars es una NodeList, no es un solo elemento
    let stars = document.querySelectorAll(".star-button");


    // para cada elemento de stars "star" es cada boton individual de estrella
    stars.forEach(function (star) {
        // eliminamos la clase active de cada estrella, al quitarla dejan de ser color gold y regresan a su color og
        star.classList.remove("active");
    });

    // resetRating: funcion que al presionar el boton Reset, cambia el texto al mensaje original, quita la clase active de todas las estrellas y las regresa a gris
}