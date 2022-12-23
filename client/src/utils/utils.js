
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
}