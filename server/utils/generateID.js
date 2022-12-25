let lastSnowflakeID = [];
const epoch = 1420070400000;

function toBinary(n) {
    let binary = n.toString(2);
    return binary;
}

function toDecimal(n) {
    let decimal = parseInt(n, 2);
    return decimal;
}


function createSnowflakeId() {
    let timestamp = Date.now();
    let timeSinceEpoch = toBinary(timestamp - epoch);
    let internalWorkerID = toBinary((timestamp & 0x3E0000) >> 17);
    let internalProcessID = toBinary((timestamp & 0x1F000) >> 12);
    let increment = toBinary(timestamp & 0xFFF);

    // add leading zeros
    while (increment.length < 12) {
        increment = '0' + increment;
    }

    while (internalProcessID.length < 5) {
        internalProcessID = '0' + internalProcessID;
    }

    while (internalWorkerID.length < 5) {
        internalWorkerID = '0' + internalWorkerID;
    }


    //convert largeNumber from base 2 to base 10
    let snowflakeID = toDecimal(timeSinceEpoch + internalWorkerID + internalProcessID + increment);

    // check if ID is already used
    if (lastSnowflakeID.includes(snowflakeID)) {
        return createSnowflakeId();
    }

    // clear lastSnowflakeID array
    if (lastSnowflakeID.length > 1000) {
        lastSnowflakeID = [];
    }

    // add ID to lastSnowflakeID array
    lastSnowflakeID.push(snowflakeID);
    return snowflakeID;
};

function snowflakeIdCreatedAt(snowflakeID) {
    try {
        snowflakeID = parseInt(snowflakeID);
    } catch (error) {
        console.log(error);
    }

    let binary = toBinary(snowflakeID);
    let timeSinceEpoch = toDecimal(binary.slice(0, -22)) + epoch;
    let timestampToDate = new Date(timeSinceEpoch);

    return { timestamp: timeSinceEpoch, date: timestampToDate };
}

module.exports = { createSnowflakeId, snowflakeIdCreatedAt };