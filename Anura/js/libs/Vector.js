/*
 * Vector class used in 2D games
 *
 * Gilberto Echeverria
 * 2026-02-10
 */

// TODO: Complete the methods in this class to be able to perform vector operations

class Vector {
    constructor(x, y) { // constructor: es la funcion que se ejecuta al crear un vector
        this.x = x; // this significa "este objeto"
        this.y = y; // la y de ESTE vector = el x que recibimos
    }

    plus(other) { // suma de vectores
        return new Vector(this.x + other.x, this.y + other.y);
    }   // ej. 
        // A = (2, 3), B = (4, 1)
        // A + B = (6, 4)

    minus(other) { // resta de vectores
        return new Vector(this.x - other.x, this.y - other.y);
    }

    times(scalar) { // multiplica el vector por un número, scalar significa un numero
        return new Vector(this.x * scalar, this.y * scalar);
    }

    magnitude() { // longitud del vector
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    squareLength() {
        return this.x ** 2 + this.y ** 2;
    }

    // normalize() : toma un vector cualquiera y lo convierte en otro vector que vaya en la misma dirección pero con tamaño 1
    normalize() {  // definiendo método dentro de la clase Vector, es decir, normalize es una funcion que le pertenece a cada vector
        const mag = this.magnitude(); // creamos nueva variable constante para guardar este vector actual con el calculo de magnitude
        if (mag == 0) { // magnitud del vector = 0?, es decir, el vector no tiene tamaño
            return new Vector(0, 0); // si el vector original era 0,0, no se puede normalizar entonces lo da como 0, 0
        } // cierre de if
        return new Vector(this.x / mag, this.y / mag); // creamos y regresamos el nuevo vector normalizado, vector normalizado = (x / magnitud, y / magnitud)
    }
}


/*
 * Test the Vector class
 */
//let p = new Vector(0, 8);
//let v = new Vector(1, 1);
//p = p.plus(v.times(1));
//console.log("New position: ", p);
//console.log("plus: ", p.plus(v));
//console.log("minus: ", p.minus(v));
//console.log("times: ", p.times(3));
//console.log("magnitude: ", p.magnitude());
//console.log("squareLength: ", p.squareLength());
