import { makeColorLighter, makeColorDarker, arrayStringToArray } from '../../utils/utils';

export const averageColorToLighterGradient = (averageColor) => {
    averageColor = arrayStringToArray(averageColor);
    // lighter the color up
    const lighterColor = makeColorLighter(averageColor);

    // darker the color down
    const darkerColor = makeColorDarker([lighterColor.R, lighterColor.G, lighterColor.B]);

    // convert colors to rgb string for gradient
    const rgb = `${lighterColor.R}, ${lighterColor.G}, ${lighterColor.B}`;
    const rgb2 = `${darkerColor.R}, ${darkerColor.G}, ${darkerColor.B}`;

    // construct gradient
    return `linear-gradient(to bottom, rgba(${rgb2}, 0.1), rgba(${rgb2}, 0.3), rgba(${rgb}, 0.8))`;
};