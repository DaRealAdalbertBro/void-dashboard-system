export const RGBtoHSV = (r, g, b) => {
    // declare variables for red, green, blue, hue, saturation, value, and max color value
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;

    // Make r, g, and b fractions of 1
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;

    // Find greatest and smallest channel values
    v = Math.max(rabs, gabs, babs)
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;

    // Round to nearest 100th
    percentRoundFn = num => Math.round(num * 100) / 100;

    // Make grey if there is no color difference
    if (diff == 0) {
        h = s = 0;
    } else {
        // Find saturation and hue
        s = diff / v;

        // Find the red/green/blue difference
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        // Find the greatest channel and assign hue based on which channel it is
        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }

        // Make negative hues positive behind 360°
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    // return the hue, saturation, and value
    return {
        H: Math.round(h * 360),
        S: percentRoundFn(s * 100),
        V: percentRoundFn(v * 100)
    };
}

const HSVtoRGB = (hue, saturation, value) => {
    // convert saturation and value to fractions
    if (saturation > 1) {
        saturation /= 100;
    }

    if (value > 1) {
        value /= 100;
    }

    let d = 0.0166666666666666 * hue;
    let c = value * saturation;
    let x = c - c * Math.abs(d % 2.0 - 1.0);
    let m = value - c;
    c += m;
    x += m;

    // Declare variables for red, green, blue
    let R = 0, G = 0, B = 0;

    // Find the red, green, and blue values based on the hue
    switch (d >>> 0) {
        case 0:
            R = c;
            G = x;
            B = m;
            break;
        case 1:
            R = x;
            G = c;
            B = m;
            break;
        case 2:
            R = m;
            G = c;
            B = x;
            break;
        case 3:
            R = m;
            G = x;
            B = c;
            break;
        case 4:
            R = x;
            G = m;
            B = c;
            break;
        default:
            R = c;
            G = m;
            B = x;
    }

    // return the red, green, and blue values
    return { R: R, G: G, B: B };
};

export function getAverageColor(imageElement, ratio = 1) {
    // create canvas
    const canvas = document.createElement("canvas")

    // set canvas size
    let height = canvas.height = imageElement.naturalHeight
    let width = canvas.width = imageElement.naturalWidth

    // draw image on canvas
    const context = canvas.getContext("2d")
    context.drawImage(imageElement, 0, 0)

    let data, length;
    let i = -4;         // start at -4 so first iteration is 0
    let count = 0;      // keep track of number of pixels

    try {
        // get image data
        data = context.getImageData(0, 0, width, height)
        // get length of data
        length = data.data.length

    } catch (err) {
        // if error, return black color
        return {
            R: 0,
            G: 0,
            B: 0
        }
    }

    // set initial values for red, green, blue
    let R, G, B
    R = G = B = 0

    // loop through each pixel based on ratio
    // ratio is used to reduce the number of pixels used to calculate average color
    // this is done to improve performance
    // ratio is set to 1 by default
    while ((i += ratio * 4) < length) {
        // increment count
        count++;

        // add red, green, blue values
        R += data.data[i]
        G += data.data[i + 1]
        B += data.data[i + 2]
    }

    // divide by count to get average
    R = ~~(R / count)
    G = ~~(G / count)
    B = ~~(B / count)

    // return average color
    return {
        R,
        G,
        B
    }
};

export const addPaddingToStringNumber = (number, padding) => {
    // convert number to string if it is not a string
    let stringNumber = typeof number === "string" ? number : number.toString()

    if (stringNumber.length == 0) {
        return stringNumber;
    }

    // check if string is longer than padding
    if (stringNumber.length >= padding) {
        // cut the string to padding length
        stringNumber = stringNumber.slice(0, padding)
    }

    // add padding
    while (stringNumber.length < padding) {
        stringNumber = "0" + stringNumber
    }

    // check if string is all zeros
    // if yes, replace last zero with 1
    if (stringNumber == "0".repeat(padding)) {
        stringNumber = stringNumber.slice(0, -1) + "1"
    }

    // return padded string
    return stringNumber;
};

export const compareTwoStrings = (string1, string2) => {
    return string1 === string2;
}

export const arrayStringToArray = (string) => {
    try {
        return JSON.parse(string);
    } catch (err) {
        return [];
    }
};

export const makeColorLighter = (color) => {
    // convert color to RGB
    let colorHSV = RGBtoHSV(color[0], color[1], color[2]);

    // make color lighter
    colorHSV.S = (colorHSV.S < 50) ? colorHSV.S + 20 : (colorHSV.S < 60) ? colorHSV.S + 10 : colorHSV.S;
    colorHSV.V = (colorHSV.V < 60) ? colorHSV.V + 20 : (colorHSV.V < 70) ? colorHSV.V + 10 : colorHSV.V;

    // edit saturation
    if (colorHSV.S < 50) {
        colorHSV.S += 20;
    }
    else if (colorHSV.S < 60) {
        colorHSV.S += 10;
    }

    // edit value
    if (colorHSV.V < 60) {
        colorHSV.V += 20;
    }
    else if (colorHSV.V < 70) {
        colorHSV.V += 10;
    }

    // convert color back to RGB
    let colorRGB = HSVtoRGB(colorHSV.H, colorHSV.S, colorHSV.V);

    // return color
    return {
        R: Math.round(255 * colorRGB.R),
        G: Math.round(255 * colorRGB.G),
        B: Math.round(255 * colorRGB.B)
    };
};

export const makeColorDarker = (color) => {
    // convert color to RGB
    let colorHSV = RGBtoHSV(color[0], color[1], color[2]);


    // edit hue
    if (colorHSV.H > 20) {
        colorHSV.H += 10;
    }
    else if (colorHSV.H > 10) {
        colorHSV.H += 20;
    }

    // edit saturation
    if (colorHSV.S > 90) {
        colorHSV.S -= 15;
    }
    else if (colorHSV.S > 80) {
        colorHSV.S -= 10;
    }

    // edit value
    if (colorHSV.V > 60) {
        colorHSV.V -= 25;
    }
    else if (colorHSV.V > 50) {
        colorHSV.V -= 10;
    }

    // convert color back to RGB
    let colorRGB = HSVtoRGB(colorHSV.H, colorHSV.S, colorHSV.V);

    // return color
    return {
        R: Math.round(255 * colorRGB.R),
        G: Math.round(255 * colorRGB.G),
        B: Math.round(255 * colorRGB.B)
    };
};

export const averageColorToGradient = (averageColor) => {
    // lighter the color up
    const lighterColor = makeColorLighter(averageColor);

    // darker the color down
    const darkerColor = makeColorDarker([lighterColor.R, lighterColor.G, lighterColor.B]);

    // convert colors to rgb string for gradient
    const rgb = `${lighterColor.R}, ${lighterColor.G}, ${lighterColor.B}`;
    const rgb2 = `${darkerColor.R}, ${darkerColor.G}, ${darkerColor.B}`;

    // construct gradient
    return `linear-gradient(to bottom, rgba(${rgb}, 1), rgba(${rgb2}, 0.6))`;
};

export const permissionLevelToString = (permissionLevel) => {
    switch (permissionLevel) {
        case 0:
            return "User";

        case 1:
            return "Editor";

        case 2:
            return "Administrator";

        default:
            return "User";
    };
};

export const stringToPermissionLevel = (permissionLevelString) => {
    switch (permissionLevelString) {
        case "User":
            return 0;

        case "Editor":
            return 1;

        case "Administrator":
            return 2;

        default:
            return 0;
    };
};