import { useState, useEffect, useRef } from "react";
import { Player } from "./Player";
import { Environment } from "./Environment";
import background_1 from "./assets/backgrounds/1/background.png";
import punk_idle from "./assets/main-characters/punk/Punk_run.png";
import hyena_idle from "./assets/enemies/Hyena/Hyena_idle.png";
import * as d3 from "d3";

// Custom hook that keeps track of currently pressed keys
function useCurrentlyPressed() {
  const [currentlyPressed, setCurrentlyPressed] = useState([]);

  function downHandler({ repeat, key }) {
    if (repeat) return;
    let allowedKeys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
    setCurrentlyPressed((currentlyPressed) => {
      if (allowedKeys.includes(key) && !currentlyPressed.includes(key)) {
        return [...currentlyPressed, key];
      }
      return currentlyPressed;
    });
  }

  function upHandler({ repeat, key }) {
    if (repeat) return;
    setCurrentlyPressed((currentlyPressed) => {
      if (currentlyPressed.includes(key)) {
        let updatedCurrentlyPressed = currentlyPressed.slice();
        updatedCurrentlyPressed.splice(currentlyPressed.indexOf(key), 1);
        return updatedCurrentlyPressed;
      }
      return currentlyPressed;
    });
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);
  return currentlyPressed;
}

// Custom hook that enables animation via a callback function
const useAnimationFrame = (callback, dependencies) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, dependencies);
};

export const GameLoop = () => {
  let gameHeight = 720;
  let gameWidth = 800;
  const currentlyPressed = useCurrentlyPressed();
  let [environmentX, setEnvironmentX] = useState(-3);
  let [environmentY, setEnvironmentY] = useState(0);

  let [playerX, setPlayerX] = useState(0);
  let [playerY, setPlayerY] = useState(0);

  const [playerDirection, setPlayerDirection] = useState("right");
  const [playerActivity, setPlayerActivity] = useState("idle");

  let [playerSpeed, setPlayerSpeed] = useState(2.5);

  let [playerStartX, playerStartY] = [350, -600];

  let [playerSpriteFrameNumber, setPlayerSpriteFrameNumber] = useState(0);

  let timeElapsed = 0;

  useAnimationFrame(
    (deltaTime) => {
      // Pass on a function to the setter of the state
      // to make sure we always have the latest state
      // setCount(prevCount => (prevCount + deltaTime * 0.01) % 100)
      timeElapsed = (timeElapsed + deltaTime / 1000) % 20;
      setPlayerSpriteFrameNumber(Math.round(timeElapsed * 3.5));

      let playerTranslationAmount = playerSpeed * deltaTime * 0.1;
      let playerIsAtLeftBound = playerX <= -340;
      let playerIsNearTheCenter = playerX < 4 && playerX > -4;
      let environmentIsAtLeftBound = environmentX >= -3;

      if (environmentX >= -3) {
        setEnvironmentX(-3);
      }

      if (currentlyPressed.includes("ArrowLeft")) {
        if (environmentIsAtLeftBound && !playerIsAtLeftBound) {
          setPlayerX((x) => x - playerTranslationAmount);
        } else if (!environmentIsAtLeftBound && !playerIsAtLeftBound) {
          setEnvironmentX((x) => x + playerTranslationAmount);
        }

        setPlayerDirection("left");
        setPlayerActivity("walk");
      } else if (currentlyPressed.includes("ArrowRight")) {
        if (environmentIsAtLeftBound && !playerIsNearTheCenter) {
          setPlayerX((x) => x + playerTranslationAmount);
        } else {
          setEnvironmentX((x) => x - playerTranslationAmount);
        }
        setPlayerDirection("right");
        setPlayerActivity("walk");
      } else if (currentlyPressed.length === 0) {
        setPlayerActivity("idle");
      }
    },
    [currentlyPressed, environmentX, playerX]
  );

  return (
    <>
      <Environment
        environmentX={environmentX}
        environmentY={environmentY}
        currentlyPressed={currentlyPressed}
        gameHeight={gameHeight}
        gameWidth={gameWidth}
        imageSource={background_1}
      ></Environment>
      <Player
        playerDirection={playerDirection}
        playerActivity={playerActivity}
        playerX={playerX}
        playerY={playerY}
        playerStartX={playerStartX}
        playerStartY={playerStartY}
        playerSpriteFrameNumber={playerSpriteFrameNumber}
      ></Player>
    </>
  );
};
