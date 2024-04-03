import React, { useEffect, useState } from 'react';
import Casilla from './Casilla';
import '../styles/Tablero.css'
const apiUrl = process.env.REACT_APP_API_URL;

const Tablero = ({pauseTimer1, pauseTimer2}) => {
    const gridStyle = {
        display: 'grid',
    };

    function traducirTableroAJSON(matrizAux) {
        const piezas = {
            'p': 'peon',
            'n': 'caballo',
            'b': 'alfil',
            'r': 'torre',
            'q': 'dama',
            'k': 'rey',
        };
        const json = {
            turno: turno === 1 ? 'blancas' : 'negras', // Añadir el turno al principio del JSON
            peon: [],
            alfil: [],
            caballo: [],
            torre: [],
            dama: [],
            rey: []
        };
        const matrizReorganizada = matrizAux.slice().reverse();

        matrizReorganizada.forEach((fila, x) => {
            fila.forEach((pieza, y) => {
                if (pieza !== '') {
                    const color = (pieza === pieza.toUpperCase() ? 'blancas' : 'negras');
                    const tipo = piezas[pieza.toLowerCase()];
                    json[tipo].push({
                        x: y,
                        y: x, // Invertir la posición
                        color: color
                    });
                }
            });
        });
        // console.log(json)
        return json;
    }

    function transformarMovimientos(json) {
        const movsPosiblesIni = {};

        Object.keys(json.allMovements).forEach(pieza => {

              json.allMovements[pieza].forEach((movimientos) => {
                  let newX=0;
                  let newY=0;
                  let key=0;
                  if (Array.isArray(movimientos)) {
                      movimientos.forEach((movimiento, i) => {
                          if(i===0){
                              newX = movimiento.fromColor === 'blancas' ? 7 - movimiento.fromY : 7 - movimiento.fromY;
                              newY = movimiento.fromX;
                              key = `[${newX}-${newY}]`;
                          }
                          if (!movsPosiblesIni[key]) {
                              movsPosiblesIni[key] = [];  
                          }else{
                              movsPosiblesIni[key].push([7 - movimiento.y, movimiento.x]);
                          }
                      });
                  }
              });
            }
        );

        return movsPosiblesIni;
    }


    //cjto de movimientos posibles con la conf. de tablero actual
    const movsPosiblesIni = {
        '[7-0]': [], //En este caso es para las negras
        '[7-1]': [[5,0], [5,2]],
        '[7-2]': [],
        '[7-3]': [],
        '[7-4]': [],
        '[7-5]': [],
        '[7-6]': [[5,5], [5,7]],
        '[7-7]': [],
        '[6-0]': [[5,0],[4,0]],
        '[6-1]': [[5,1],[4,1]],
        '[6-2]': [[5,2],[4,2]],
        '[6-3]': [[5,3],[4,3]],
        '[6-4]': [[5,4],[4,4]],
        '[6-5]': [[5,5],[4,5]],
        '[6-6]': [[5,6],[4,6]],
        '[6-7]': [[5,7],[4,7]],
    }

    const [movsPosibles, setMovsPosibles] = useState(movsPosiblesIni)


    // K: rey
    // Q: reina
    // B: alfil
    // N: caballo
    // R: torre
    // P: peón
    // minúsculas: negras
    // mayúsculas: blancas
    const matrizIni = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', '', 'p', 'p', 'p'],
        ['' , '' , '' , '' ,'' , '' , '' , '' ],
        ['' , '' , '' , '' ,'p' , '' , '' , 'Q' ],
        ['' , '' , 'B' , '' ,'P' , '' , '' , '' ],
        ['' , '' , '' , '' ,'' , '' , '' , '' ],
        ['P', 'P', 'P', 'P', '', 'P', 'P', 'P'],
        ['R', 'N', 'B', '', '', '', 'N', 'R'],
    ]
    const [tablero, setTablero] = useState(matrizIni)


    //Coordenadas de la pieza seleccionada
    const [piezaSel, setPiezaSel] = useState(null)

    //movimiento es:
    //{fil:x, col:y} (coordenadas a las que se ha movido piezasel)
    const [movimiento, setNewMov] = useState(0)

    // Que color esta jugando. 0: blancas, 1: negras
    const [turno, setTurno] = useState(0) 
    
    // Funcion que envia tablero al servidor
    // Si el movimiento es legal: actualiza los movimientos posibles dado el nuevo tablero y devuelve true
    // Si el movimiento no es legal: devuelve false y no actualiza los movimientos posibles
    const submitMov = async(nuevoTablero)=>{
      try {
        const jsonMatriz = traducirTableroAJSON(nuevoTablero); // Convertir el nuevo tablero en una cadena JSON
            // Se envia el tablero al back para que valide si el movimiento es legal y devuelva los movimientos posibles
            // const response = await fetch('http://13.51.136.199:3001/play', {
            const response = await fetch(`${apiUrl}/play`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(jsonMatriz),
            });

            const parseRes = await response.json(); // parseRes es el objeto JSON que se recibe
            console.log(parseRes)
            if (parseRes.jugadaLegal === true) { // Si la jugada es legal (campo jugadaLegal) se cambian los movimientos posibles
              console.log('movimientos posibles:');
              // console.log(parseRes.allMovements);
              setMovsPosibles(transformarMovimientos(parseRes));
              // console.log(movsPosibles)
              return true;
            }else { //La jugada no es legal
              console.log('ERROR: Jugada no legal. Deja al rey en mate.');

              return false;
            }
        } catch (err) {
            console.error('pillao un error en submitMov:');
            console.error(err.message);
            return false;
        }
    }

    //Ocurre un movimiento
    useEffect(() => {
        if(piezaSel && movimiento !== 0){ //Si ha ocurrido un movimiento
          //Se obtienen las coordenadas de la casilla origen
            const oldX = piezaSel.fila
            const oldY = piezaSel.col
            //Se obtienen las coordenadas de la casilla destino
            const newX = movimiento.fila
            const newY = movimiento.col
            // const originalTablero = [...tablero]
            // console.log(newX, newY)
            // Se intercambian los contenidos de las casillas
            const newTablero = JSON.parse(JSON.stringify(tablero)) //asi se hace una copia  
            newTablero[newX][newY] = tablero[oldX][oldY]
            newTablero[oldX][oldY] = ''
            // console.log(tablero[oldX][oldY]);
            if((newTablero[newX][newY]==='K' || newTablero[newX][newY]==='k')&&(Math.abs(oldY-newY))===2){
              if(newY===6){
                newTablero[newX][5] = newTablero[newX][newY+1]
                newTablero[newX][7]=''
              }
              if(newY===2){
                newTablero[newX][3] = newTablero[newX][newY-2]
                newTablero[newX][0]=''
              }
            }
            submitMov(newTablero)
            .then(isLegal => {
              if (isLegal) {
                setTablero(newTablero); // Se cambia el tablero
                turno === 0 ? pauseTimer2() : pauseTimer1();
                setTurno(turno === 0 ? 1 : 0); // Cambia el color que tiene el turno
              }
              setPiezaSel(null); // No hay piezas seleccionadas
            })
            .catch(error => {
              // Manejar el error aquí si es necesario
              console.error("Error al procesar el movimiento:", error);
            });

        }
    }, [movimiento])
    return (
        <>
        <div style={gridStyle} className={`tablero`}>
            {[...Array(8)].map((_, rowIndex) => (
                <div key={rowIndex}  className="filatab">
                    {[...Array(8)].map((_, colIndex) => (
                        <Casilla 
                            key={`${rowIndex}-${colIndex}`} // Add unique key prop here
                            tablero={tablero}
                            rowIndex={rowIndex} 
                            colIndex={colIndex} 
                            piezaSel={piezaSel} 
                            setPiezaSel={setPiezaSel}
                            movsPosibles={movsPosibles}
                            mov={movimiento} 
                            setNewMov={setNewMov}
                            turno={turno}
                            blancasAbajo={true}
                        />
                    ))}
                </div>
            ))}
        </div>
        </>
    );
};

export default Tablero;
