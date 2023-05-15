import React, { useEffect, useMemo, useState } from "react";

const State: React.FC<{
  stateIndex: number;
  active?: boolean;
  onClick?: () => void;
}> = ({ stateIndex, active = false, onClick }) => {
  const stateIndexMap: { [stateIndex: number]: string } = {
    0: "black",
    1: "green",
    2: "blue",
    3: "yellow",
    4: "orange",
    5: "purple",
    6: "pink",
    7: "brown",
    8: "grey",
    9: "white",
  };
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block",
        border: "1px solid black",
        width: "20px",
        height: "20px",
        margin: "5px",
        backgroundColor: stateIndexMap[stateIndex],
        ...(active && { border: "1px dotted red" }),
      }}
    ></span>
  );
};

function StateCombinations() {
  const [numRobots, setNumRobots] = useState(30);
  const robotsInitialState = useMemo(() => {
    // all robots start in state 0 except for the first one which starts in
    // state 1
    const robots: { [key: number]: number } = {};
    for (let i = 0; i < numRobots; i++) {
      robots[i] = i === 0 ? 1 : 0;
    }
    return robots;
  }, [numRobots]);
  const [robots, setRobots] = useState<{ [key: number]: number }>(
    robotsInitialState
  );

  const [robotsHistory, setRobotsHistory] = useState<{
    [key: number]: number[];
  }>({});

  const [numStates, setNumStates] = useState(3);

  const middleStateMapInitialState = useMemo(() => {
    const stateMap: {
      [key: number]: { [key: number]: { [key: number]: number } };
    } = {};
    for (let i = 0; i < numStates; i++) {
      stateMap[i] = {};
      for (let j = 0; j < numStates; j++) {
        stateMap[i][j] = {};
        for (let k = 0; k < numStates; k++) {
          stateMap[i][j][k] = 0;
        }
      }
    }
    return stateMap;
  }, [numStates]);

  const sideStateMapInitialState = useMemo(() => {
    const stateMap: {
      [key: number]: { [key: number]: number };
    } = {};
    for (let i = 0; i < numStates; i++) {
      stateMap[i] = {};
      for (let j = 0; j < numStates; j++) {
        stateMap[i][j] = 0;
      }
    }
    return stateMap;
  }, [numStates]);

  const [leftStateMap, setLeftStateMap] = useState<{
    [key: number]: { [key: number]: number };
  }>(sideStateMapInitialState);

  const [middleStateMap, setMiddleStateMap] = useState<{
    [key: number]: { [key: number]: { [key: number]: number } };
  }>(middleStateMapInitialState);

  const [rightStateMap, setRightStateMap] = useState<{
    [key: number]: { [key: number]: number };
  }>(sideStateMapInitialState);

  useEffect(() => {
    // if any robots are in the state with value === numStates, return
    for (let i = 0; i < numRobots; i++) {
      if (robots[i] === numStates) {
        return;
      }
    }

    // if history has 50 entries, return
    for (let i = 0; i < numRobots; i++) {
      if (robotsHistory[i] !== undefined && robotsHistory[i].length === 50) {
        return;
      }
    }

    const timeout = setInterval(() => {
      setRobotsHistory((robotsHistory) => {
        const newRobotsHistory = { ...robotsHistory };
        for (let i = 0; i < numRobots; i++) {
          if (newRobotsHistory[i] === undefined) {
            newRobotsHistory[i] = [];
          }
          newRobotsHistory[i].push(robots[i]);
        }
        return newRobotsHistory;
      });
      // at each time step, each robot moves to the state specified by the
      // stateMap. the previous stateMap is moved into the history
      const newRobots: { [index: number]: number } = {};
      for (let i = 0; i < numRobots; i++) {
        // leftmost robot:
        if (i === 0) {
          newRobots[i] = leftStateMap[robots[i]][robots[i + 1]];
        }
        // rightmost robot:
        else if (i === numRobots - 1) {
          newRobots[i] = rightStateMap[robots[i - 1]][robots[i]];
        }
        // middle robots:
        else {
          newRobots[i] =
            middleStateMap[robots[i - 1]][robots[i]][robots[i + 1]];
        }
      }
      console.log(newRobots);
      setRobots(newRobots);
    }, 10);
    return () => clearInterval(timeout);
  }, [numRobots, middleStateMap, leftStateMap, rightStateMap, robots]);

  // clear robots and history when statemaps change
  useEffect(() => {
    setRobots(robotsInitialState);
    setRobotsHistory({});
  }, [numRobots, middleStateMap, leftStateMap, rightStateMap]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div>
        <label>
          Number of states:
          <select
            value={numStates}
            onChange={(e) => setNumStates(Number(e.target.value))}
          >
            {[...Array(10).keys()].map((n) => (
              <option value={n + 2} key={n + 2}>
                {n + 2}
              </option>
            ))}
          </select>
        </label>
        <br />
        {[...Array(numStates).keys()].map((s1) =>
          [...Array(numStates).keys()].map((s2) =>
            s1 === 0 && s2 === 0 ? null : (
              <div key={`${s1},${s2}`}>
                <span>
                  <State stateIndex={s1} />
                  <State stateIndex={s2} />
                </span>
                -&gt;
                <span>
                  {[...Array(numStates + 1).keys()].map((n) => (
                    <State
                      stateIndex={n}
                      key={n}
                      active={leftStateMap[s1][s2] === n}
                      onClick={() =>
                        setLeftStateMap((s) => ({
                          ...s,
                          [s1]: { ...s[s1], [s2]: n },
                        }))
                      }
                    />
                  ))}
                </span>
              </div>
            )
          )
        )}
        <br />
        {[...Array(numStates).keys()].map((s1) =>
          [...Array(numStates).keys()].map((s2) =>
            [...Array(numStates).keys()].map((s3) =>
              s1 === 0 && s2 === 0 && s3 === 0 ? null : (
                <div key={`${s1},${s2},${s3}`}>
                  <span>
                    <State stateIndex={s1} />
                    <State stateIndex={s2} />
                    <State stateIndex={s3} />
                  </span>
                  -&gt;
                  <span>
                    {[...Array(numStates + 1).keys()].map((n) => (
                      <State
                        stateIndex={n}
                        key={n}
                        active={middleStateMap[s1][s2][s3] === n}
                        onClick={() =>
                          setMiddleStateMap((s) => ({
                            ...s,
                            [s1]: { ...s[s1], [s2]: { ...s[s1][s2], [s3]: n } },
                          }))
                        }
                      />
                    ))}
                  </span>
                </div>
              )
            )
          )
        )}
        <br />
        {[...Array(numStates).keys()].map((s1) =>
          [...Array(numStates).keys()].map((s2) =>
            s1 === 0 && s2 === 0 ? null : (
              <div key={`${s1},${s2}`}>
                <span>
                  <State stateIndex={s1} />
                  <State stateIndex={s2} />
                </span>
                -&gt;
                <span>
                  {[...Array(numStates + 1).keys()].map((n) => (
                    <State
                      stateIndex={n}
                      key={n}
                      active={rightStateMap[s1][s2] === n}
                      onClick={() =>
                        setRightStateMap((s) => ({
                          ...s,
                          [s1]: { ...s[s1], [s2]: n },
                        }))
                      }
                    />
                  ))}
                </span>
              </div>
            )
          )
        )}
      </div>
      <div>
        {/* display robot history. this way puts history on the horizontal axis and robots on the vertical axis */}
        {[...Array(numRobots).keys()].map((i) => (
          <div key={i}>
            {robotsHistory[i] &&
              robotsHistory[i].map((r, j) => <State stateIndex={r} key={j} />)}
            {/* also display the current state */}
            <State stateIndex={robots[i]} />
          </div>
        ))}
        {/* we can also put the history on the vertical axis like this: */}
      </div>
    </div>
  );
}
export default StateCombinations;
