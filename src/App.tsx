import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

/*
 These colors are from my personal color palette. In a production app, you could either reuse colors and assure no two
 adjacent rooms share a color OR randomly generate colors. For now, 7 is enough.
*/
const colors = [
    '#ED5A5A', // Red
    '#EDBC5A', // Orange
    '#E2E25A', // Yellow
    '#5AE29E', // Green
    '#45F7F7', // Teal
    '#459EF7', // Blue
    '#9E45F7' // Purple
];

const wallColor = '#161618';
const hallwayColor = '#FFFFFF';

type FloorPlan = string[][];

const example = `##########
#   #    #
#   #    #
## #### ##
#        #
#        #
##  ######
#   #    #
#        #
##########`;

const AppWrapper = styled.div`
    display: flex;
    gap: 20px;

    & > div {
        min-width: 500px;

        textarea {
            width: 100%;
        }
    }
`;

const Floor = styled.div`
    display: flex;
    flex-direction: column;
`;

const FloorRow = styled.div`
    display: flex;
`;

const FloorBlock = styled.div<{ floorColor?: string }>`
    height: 30px;
    width: 30px;
    background-color: ${(props) => props.floorColor ?? '#e7e7e7'};
`;

const App = () => {
    const [ascii, setASCII] = useState<string>(example);
    const [floorPlan, setFloorPlan] = useState<FloorPlan>([]);

    const isHallway = (floorPlan: string[][], i: number, j: number): boolean => {
        if (!floorPlan[i + 1] || !floorPlan[i - 1] || !floorPlan[i][j + 1] || !floorPlan[i][j - 1]) {
            return true;
        }

        if (floorPlan[i][j + 1] === '#' && floorPlan[i][j - 1] === '#') {
            return true;
        }

        return floorPlan[i + 1][j] === '#' && floorPlan[i - 1][j] === '#';
    };

    useEffect(() => {
        const asciiFloorPlan = ascii
            .trim()
            .split('\n')
            .map((row) => row.split(''));

        // Code assumes a rectangular floor plan. If not, too bad!
        const newFloorPlan: FloorPlan = [];

        asciiFloorPlan.forEach((row, i) => {
            newFloorPlan[i] = [];

            row.forEach((block, j) => {
                if (block === '#') {
                    newFloorPlan[i][j] = wallColor;
                } else if (block === ' ') {
                    if (isHallway(asciiFloorPlan, i, j)) {
                        newFloorPlan[i][j] = hallwayColor;
                    } else {
                        newFloorPlan[i][j] = '';
                    }
                }
            });
        });

        const fillSquare = (i: number, j: number, color?: string) => {
            if (newFloorPlan[i][j] !== '') {
                return;
            }

            // If no color was provided, see if we can get one
            if (!color) {
                // Check the adjacent squares for a color. This indicates the current square must be a part of the same room
                if (![wallColor, hallwayColor, ''].includes(newFloorPlan[i + 1][j])) {
                    color = newFloorPlan[i + 1][j];
                } else if (![wallColor, hallwayColor, ''].includes(newFloorPlan[i][j + 1])) {
                    color = newFloorPlan[i][j + 1];
                } else {
                    // Otherwise, must be a new room. Generate a new random color.
                    const randomColorIndex = Math.floor(Math.random() * colors.length);
                    color = colors[randomColorIndex];
                }
            }

            newFloorPlan[i][j] = color;

            if (newFloorPlan[i][j + 1] === '') {
                fillSquare(i, j + 1, color); // Fill adjacent squares with the color.
            }

            if (newFloorPlan[i + 1][j] === '') {
                fillSquare(i + 1, j, color); // Fill adjacent squares with the color.
            }
        };

        newFloorPlan.forEach((row, i) => {
            row.forEach((block, j) => {
                console.log(block);

                // Use recursion to check all the squares on the matrix.
                fillSquare(i, j);
            });
        });

        setFloorPlan(newFloorPlan);

        return () => {
            setFloorPlan([]);
        };
    }, [ascii]);

    return (
        <AppWrapper>
            <div>
                <textarea rows={20} value={ascii} onChange={(e) => setASCII(e.target.value)} />
            </div>

            <Floor>
                {floorPlan.map((floorRow, i) => (
                    <FloorRow key={i}>
                        {floorRow.map((floorBlock, j) => (
                            <FloorBlock floorColor={floorBlock} key={j} />
                        ))}
                    </FloorRow>
                ))}
            </Floor>
        </AppWrapper>
    );
};

export default App;
