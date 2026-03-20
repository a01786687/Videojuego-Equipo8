# Product Backlog - Proyecto Anura

## Requerimientos Funcionales

_Requerimiento funcional -> describe algo que el sistema hace_

### Gameplay

**RF-01** El sistema debe permitir iniciar una partida
*HU: #27*
 
**RF-02** El sistema debe permitir finalizar una partida (game over)
*HU: #27*
 
**RF-03** El sistema debe incluir múltiples niveles jugables (mínimo 2)
*HU: #2*
 
**RF-04** El sistema debe permitir agregar más niveles en el futuro
*HU: #2*
 
**RF-05** El sistema debe implementar dificultad progresiva entre niveles (progresión roguelite)
*HU: #3*
 
**RF-06** El sistema debe generar diferentes variaciones en los niveles entre partidas
*HU: #37*
 
**RF-07** El sistema debe permitir enfrentar enemigos durante el juego
*HU: #4*
 
**RF-08** El sistema debe permitir que los enemigos reciban daño
*HU: #38*
 
**RF-09** El sistema debe permitir que el jugador reciba daño
*HU: #5, #39*
 
**RF-10** El sistema debe permitir derrotar enemigos
*HU: #38*
 
**RF-11** El sistema debe guardar parte del progreso del jugador después de morir (cartas del deck y mosquitos acumulados)
*HU: #29*

**RF-12** El sistema debe eliminar el progreso del run activo al morir (posición, vida y avance en el nivel)
*HU: #29*
 
**RF-13** El sistema debe implementar una reacción del enemigo a las acciones del jugador
*HU: #4*


 
### Sistema de combate

**RF-14** El sistema debe mostrar un HUD de vida del jugador
*HU: #39*
 
**RF-15** El sistema debe mostrar un contador de daño recibido
*HU: #5*
 
**RF-16** El sistema debe actualizar los indicadores de vida y daño en tiempo real durante las partidas y combates
*HU: #5, #39*
 

 
### Sistema de cartas

**RF-17** El sistema debe permitir la interacción entre el jugador y las cartas
*HU: #6*
 
**RF-18** El sistema debe permitir que las cartas le den al jugador habilidades o potenciadores
*HU: #6, #7*
 
**RF-19** El sistema debe permitir que la activación de ciertas cartas afecte o dañe al enemigo
*HU: #7, #30*
 
**RF-20** El sistema debe permitir combinaciones estratégicas de las cartas
*HU: #7*

**RF-21** El sistema debe modificar el gameplay dependiendo de las cartas activas
*HU: #30*

**RF-22** El sistema debe permitir al jugador obtener nuevas cartas en la card selection screen post-muerte, comprándolas con mosquitos

**RF-23** El sistema debe mostrar una card selection screen después de cada muerte, con 3 opciones de cartas y sus costos en mosquitos
*HU: #31*

**RF-24** El sistema debe gestionar los mosquitos como moneda persistente entre runs, permitiendo recolectarlos, acumularlos y gastarlos en la card selection screen
*HU: #29, #31*

**RF-25** El sistema debe limitar el deck del jugador a un máximo de 3 cartas activas simultáneas
*HU: #31*

**RF-26** El sistema no debe permitir tener más de una carta de la misma categoría en el deck activo del jugador
*HU: #31*

**RF-27** El sistema debe permitir al jugador intercambiar una carta de su deck por una nueva cuando el deck esté lleno (3 cartas), con pérdida permanente de la carta reemplazada
*HU: #31*
 

 
### Sistema de jefes

**RF-28** El sistema debe incluir un jefe al final de cada nivel
*HU: #9*
 
**RF-29** El sistema debe incluir un jefe final para terminar el juego
*HU: #10*
 
**RF-30** El sistema debe implementar mecánicas diferentes para cada jefe
*HU: #40*
 
**RF-31** El sistema debe implementar mecánicas especiales para el jefe final
*HU: #41*
 

 
### Interfaz del juego

**RF-32** El sistema debe incluir un menú de inicio
*HU: #11*
 
**RF-33** El sistema debe permitir al usuario iniciar o continuar una partida desde el menú de inicio
*HU: #11*
 
**RF-34** El sistema debe permitir al usuario continuar la partida después de pausar
*HU: #12*
 
**RF-35** El sistema debe incluir una opción para ajustar el brillo dentro de una sección de configuración desde el menú
*HU: #11*
 
**RF-36** El sistema debe incluir opciones dentro del menú de pausa (sonido, guardar estado, checar cartas activas)
*HU: #13*
 
**RF-37** El sistema debe incluir un cronómetro por partida
*HU: #8*
 
**RF-38** El sistema debe permitir comparar tiempos entre partidas
*HU: #8*
 

 
### Cinemáticas

**RF-39** El sistema debe incluir una cinemática de entrada
*HU: #14*
 
**RF-40** El sistema debe incluir una cinemática de salida
*HU: #14*
 
**RF-41** El sistema debe permitir al usuario saltar la cinemática de entrada/salida
*HU: #14*
 

 
### Sistema web, acceso de cuentas y almacenamiento

**RF-42** El sistema debe permitir el registro de usuarios mediante login y contraseña
*HU: #15*
 
**RF-43** El sistema debe guardar el progreso del jugador en su cuenta ligada
*HU: #22*
 
**RF-44** El sistema debe almacenar la información de las cartas que tiene cada usuario
*HU: #16*
 
**RF-45** El sistema debe almacenar la cantidad de mosquitos que el jugador tiene en su cuenta
*HU: #16*
 
**RF-46** El sistema debe registrar y persistir el número de run actual del jugador
*HU: #29, #31*
 

 
### Base de datos

**RF-47** El sistema debe almacenar en la base de datos información de partidas, personajes y cartas
*HU: #18*
 
**RF-48** El sistema debe implementar operaciones CRUD para la administración y almacenamiento de datos
*HU: #21*
 
**RF-49** El sistema debe conectar el videojuego con la base de datos mediante una API
*HU: #22*
 
**RF-50** El sistema debe permitir consultar la información almacenada
*HU: #21*
 

 
### Pagina Web

**RF-51** El sistema debe incluir una página web con múltiples secciones informativas (mecánicas, tutorial, historia, personajes, estadísticas)
*HU: #17*
 
**RF-52** El sistema debe incluir una sección de estadísticas del jugador (corridas, cartas, personaje)
*HU: #23*
 
**RF-53** El sistema debe incluir visualizaciones de estadísticas interactivas
*HU: #24*
 
**RF-54** El sistema debe integrar el juego dentro de la página web
*HU: #25*
 
**RF-55** El sistema debe permitir desplegar la página web de manera local y en la nube
*HU: #26*
 

 
### Analítica

**RF-56** El sistema debe recopilar estadísticas de las partidas
*HU: #32*
 
**RF-57** El sistema debe registrar estadísticas por nivel y por jefe
*HU: #33*
 

 
## Requerimientos No Funcionales

_Requerimiento NO funcional -> describe como debe sentirse, verse o comportarse_


**RNF-01** El juego debe sentirse divertido
*HU: #1*
 
**RNF-02** El juego debe ser fácil de entender
*HU: #1*
 
**RNF-03** El juego debe sentirse como un producto completo
*HU: #1*
 

 
### Jugabilidad
 
**RNF-04** La dificultad debe sentirse equilibrada (ni muy fácil, ni muy difícil)
*HU: #3*
 
**RNF-05** Cada partida debe sentirse diferente y más retadora que la anterior, el jugador no debe experimentar el mismo recorrido en cada run
*HU: #3, #37*
 
**RNF-06** Los combates deben sentirse rápidos y emocionantes
*HU: #4, #9*
 

 
### Interfaz
 
**RNF-07** El HUD debe ser claro y visible durante el juego
*HU: #5, #39*
 
**RNF-08** El HUD no debe estorbar la vista del jugador
*HU: #5, #39*
 
**RNF-09** El menú debe ser fácil de entender
*HU: #11*
 
**RNF-10** La navegación debe ser intuitiva con opciones claras y ordenadas
*HU: #11, #17*
 

 
### Rendimiento
 
**RNF-11** Cambiar entre niveles debe ser rápido
*HU: #2*
 
**RNF-12** El sistema debe actualizar indicadores en tiempo real
*HU: #5, #39*
 

 
### Seguridad
 
**RNF-13** La información del usuario debe mantenerse segura
*HU: #15*
 

 
### Base de datos
 
**RNF-14** La base de datos debe mantener los datos organizados
*HU: #19*
 
**RNF-15** Los datos deben guardarse con un método de ordenamiento
*HU: #20*
 
**RNF-16** La base de datos debe evitar la redundancia de información
*HU: #20*
 
**RNF-17** La base de datos debe mantenerse limpia y clara
*HU: #20*
 
**RNF-18** Las consultas de datos deben ser eficientes
*HU: #19*
 
**RNF-19** Las tablas deben estar normalizadas hasta 3FN
*HU: #20*
 

 
### Diseño visual
 
**RNF-20** El juego debe mantener coherencia visual en sprites y elementos
*HU: #34*
 
**RNF-21** El frontend debe mantener estilo pixel art consistente
*HU: #36*
 
**RNF-22** La página web debe mantener identidad visual coherente con el juego
*HU: #35*
 
**RNF-23** La página debe usar colores coherentes con el juego
*HU: #35*
 
**RNF-24** La tipografía y elementos visuales deben coincidir con el estilo del juego
*HU: #35, #36*
 
**RNF-25** La navegación de la página web debe sentirse clara y organizada
*HU: #17, #35*
 
**RNF-26** La página debe verse visualmente consistente en todas sus secciones
*HU: #35*
 

 
### Usabilidad de la página web
 
**RNF-27** La página web debe ser clara y fácil de navegar
*HU: #17*
 
**RNF-28** La información debe mostrarse de forma comprensible
*HU: #17, #23*