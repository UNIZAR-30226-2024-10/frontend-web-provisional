import React, { useEffect, useState } from 'react';
import Casilla from './Casilla';
import '../styles/Tablero.css'
import { tab } from '@testing-library/user-event/dist/tab';
const apiUrl = process.env.REACT_APP_API_URL;
import damaNegra from '../images/pieces/cburnett/bQ.svg'
import damaBlanca from '../images/pieces/cburnett/wQ.svg'
import caballoNegra from '../images/pieces/cburnett/bN.svg'
import caballoBlanca from '../images/pieces/cburnett/wN.svg'
import alfilNegra from '../images/pieces/cburnett/bB.svg'
import alfilBlanca from '../images/pieces/cburnett/wB.svg'
import torreNegra from '../images/pieces/cburnett/bR.svg'
import torreBlanca from '../images/pieces/cburnett/wR.svg'

const TableroOnline = ({blancasAbajo, tableroUpdate,setTableroEnviar ,pauseTimer1, pauseTimer2}) => {
    const gridStyle = {
        display: 'grid',
    };
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const openModal = () => {
      setShowModal(true);
  };

  const closeModal = () => {
      setShowModal(false);
  };
  const [torreBlancaIzdaMovida, setTorreBlancaIzdaMovida] = useState(false);
  const [torreBlancaDchaMovida, setTorreBlancaDchaMovida] = useState(false);
  const [torreNegraIzdaMovida, setTorreNegraIzdaMovida] = useState(false);
  const [torreNegraDchaMovida, setTorreNegraDchaMovida] = useState(false);
  const [reyBlancoMovido, setReyBlancoMovido] = useState(false);
  const [reyNegroMovido, setReyNegroMovido] = useState(false);

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
            ha_movido_rey_blanco: reyBlancoMovido,
            ha_movido_rey_negro: reyNegroMovido,
            ha_movido_torre_blanca_dcha: torreBlancaDchaMovida,
            ha_movido_torre_blanca_izqda: torreBlancaIzdaMovida,
            ha_movido_torre_negra_dcha: torreNegraDchaMovida,
            ha_movido_torre_negra_izqda: torreNegraIzdaMovida,    
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
        console.log(json)
        return json;
    }

    function transformarMovimientos(json) {
        const movsPosiblesIni = {};
        Object.keys(json.allMovements).forEach(pieza => {
               if (pieza === 'comer' || pieza === 'bloquear') {
                  // Obtener la sección de movimientos correspondiente
                  let movimientos = json.allMovements[pieza][0];
                  
                  // Recorrer cada tipo de pieza dentro de la sección de movimientos
                  for (let pieza2 in movimientos) {
                      // Obtener los movimientos de la pieza
                      let movimientosPieza = movimientos[pieza2];
                      
                      // Procesar cada movimiento de la pieza
                      movimientosPieza.forEach((movimiento) => {
                        let newX = 0;
                        let newY = 0;
                        let key = 0;
                        console.log("movimiento", movimiento)
                              newX = movimiento.fromColor === 'blancas' ? 7 - movimiento.fromY : 7 - movimiento.fromY;
                              newY = movimiento.fromX;
                              key = `[${newX}-${newY}]`;
                          if (!movsPosiblesIni[key]) {
                              movsPosiblesIni[key] = [];  
                          }
                          // Agregar los movimientos posibles al objeto
                          movsPosiblesIni[key].push([7 - movimiento.y, movimiento.x]);
                      });
                  }
              }else{
              json.allMovements[pieza].forEach((movimientos) => {
                  let newX=0;
                  let newY=0;
                  let key=0;
                  if (Array.isArray(movimientos)) {
                      movimientos.forEach((movimiento, i) => {
                          if(i===0){
                              // newX = movimiento.fromColor === 'blancas' ? 7 - movimiento.fromY : 7 - movimiento.fromY;
                              let newX = 7 - movimiento.fromY;
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
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['' , '' , '' , '' ,'' , '' , '' , '' ],
        ['' , '' , '' , '' ,'' , '' , '' , '' ],
        ['' , '' , '' , '' ,'' , '' , '' , '' ],
        ['' , '' , '' , '' ,'' , '' , '' , '' ],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ]
    const [tablero, setTablero] = useState(matrizIni)
    useEffect(()=>{
      if(tableroUpdate){
        setTablero(tableroUpdate)
        setTurno((turno === 0)? 1:0) //Cambia el color que tiene el turno
        pauseTimer1()
        submitMov(tableroUpdate)
        console.log("movio")

      }
    },[tableroUpdate])

    //Coordenadas de la pieza seleccionada
    const [piezaSel, setPiezaSel] = useState(null)

    //movimiento es:
    //{fil:x, col:y} (coordenadas a las que se ha movido piezasel)
    const [movimiento, setNewMov] = useState(0)

    // Que color esta jugando. 0: blancas, 1: negras
    const [turno, setTurno] = useState(0) 
      const [X, setX] = useState(null);
  const [Y, setY] = useState(null);
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
              console.log(parseRes.allMovements);
              setMovsPosibles(transformarMovimientos(parseRes));
              return true;
            }
            else { //La jugada no es legal
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
        if(piezaSel && movimiento !== 0  && ((turno===0 && blancasAbajo===true) || (turno===1 && blancasAbajo===false))){ //Si ha ocurrido un movimiento
          //Se obtienen las coordenadas de la casilla origen
            const oldX = piezaSel.fila
            const oldY = piezaSel.col
            //Se obtienen las coordenadas de la casilla destino
            const newX = movimiento.fila
            const newY = movimiento.col
            if(tablero[oldX][oldY]==='k'){
              setReyNegroMovido(true);
            }else if(tablero[oldX][oldY]==='K'){
              setReyBlancoMovido(true);
            }else if(tablero[oldX][oldY]==='r'){
              if(oldY===0){
                setTorreNegraIzdaMovida(true)
              }else{
                setTorreNegraDchaMovida(true)
              }
            }else if (tablero[oldX][oldY]==='R'){
              if(oldY===0){
                setTorreBlancaIzdaMovida(true)
              }else{
                setTorreBlancaDchaMovida(true)
              }
            }
            // const originalTablero = [...tablero]
          // console.log(oldX, oldY)
          // console.log(newX, newY)
            // Se intercambian los contenidos de las casillas
            const newTablero = JSON.parse(JSON.stringify(tablero)) //asi se hace una copia
            newTablero[newX][newY] = tablero[oldX][oldY]
            newTablero[oldX][oldY] = ''
            console.log(newTablero[newX][newY])
            if((newTablero[newX][newY]==='K' || newTablero[newX][newY]==='k')&&(Math.abs(oldY-newY))===2){
              if(newY===6){
                newTablero[newX][5] = newTablero[newX][newY+1]
                newTablero[newX][7]=''
              }
              if(newY===2){
                newTablero[newX][3] = newTablero[newX][newY-2]
                newTablero[newX][0]=''
              }
            } else if((newTablero[newX][newY]==='P' && newX==0 )||  (newTablero[newX][newY]==='p' && newX==7)){
                setX(prevX => newX);
                setY(prevY => newY);
                openModal();
                return
            }
            submitMov(newTablero)
            .then(isLegal => {
              if (isLegal) {
                setTablero(newTablero) //Se cambia el tablero
                setTurno((turno === 0)? 1:0) //Cambia el color que tiene el turno
                pauseTimer2()
                setTableroEnviar(newTablero)
              }
              setPiezaSel(null); // No hay piezas seleccionadas
            })
            .catch(error => {
              // Manejar el error aquí si es necesario
              console.error("Error al procesar el movimiento:", error);
            });

            setPiezaSel(null) //No hay piezas seleccionadas
        }
    }, [movimiento])
    useEffect(()=>{

    }, tablero)
    useEffect(()=>{
      !blancasAbajo ? pauseTimer2() : null;
    }, [])
    useEffect(() =>{
      if(!showModal && selectedOption){
        console.log("Se lia")
         const newTablero = JSON.parse(JSON.stringify(tablero)) //asi se hace una copia 
           newTablero[X][Y]= selectedOption;
          newTablero[turno === 0 ? X+1 : X-1][Y] = ''
         submitMov(newTablero)
            .then(isLegal => {
              if (isLegal) {
                setTablero(newTablero); // Se cambia el tablero
                // turno === 0 ? pauseTimer2() : pauseTimer1();
                pauseTimer2()
                setTurno(turno === 0 ? 1 : 0); // Cambia el color que tiene el turno
              }
              setPiezaSel(null); // No hay piezas seleccionadas
            })
            .catch(error => {
              // Manejar el error aquí si es necesario
              console.error("Error al procesar el movimiento:", error);
            });
      }
    },[showModal])
    return (
        <>
        <div style={gridStyle} className={`tablero ${!blancasAbajo ? 'rotated' : ''}`}>
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
                            blancasAbajo={blancasAbajo}
                        />
                    ))}
                </div>
            ))}
        </div>
        {showModal && (
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <p>Selecciona una opción para coronar:</p>
                    <div className='opciones-modal-tablero'> 
                        <img style={{ width: '50px', height: '50px' }} src={turno === 0 ? `${damaBlanca}` : `${damaNegra}`} onClick={() => { setSelectedOption(turno === 0 ? 'Q' : 'q'); closeModal(); }} alt="Dama" />
                        <img style={{ width: '50px', height: '50px' }} src={turno === 0 ? `${alfilBlanca}` : `${alfilNegra}`} onClick={() => { setSelectedOption(turno === 0 ? 'B' : 'b'); closeModal(); }} alt="Alfil" />
                        <img style={{ width: '50px', height: '50px' }} src={turno === 0 ? `${caballoBlanca}` : `${caballoNegra}`} onClick={() => { setSelectedOption(turno === 0 ? 'N' : 'n'); closeModal(); }} alt="Caballo" />
                        <img style={{ width: '50px', height: '50px' }} src={turno === 0 ? `${torreBlanca}` : `${torreNegra}`} onClick={() => { setSelectedOption(turno === 0 ? 'R' : 'r'); closeModal(); }} alt="Torre" />
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default TableroOnline;
