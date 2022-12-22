const createNewUserTag = () => {
    // Generate a random number between 0 and 9999
    let tag = Math.floor(Math.random() * 10000);
    
    // Convert the number to a string
    tag = tag.toString();
    
    // Add leading zeros to the tag
    while (tag.length < 4) {
        tag = '0' + tag;
    }

    // Return the tag
    return tag;
}

module.exports = { createNewUserTag }