const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, latitude, longitude) => {
    const location = `https://google.com/maps?q=${latitude},${longitude}`
    return {
        username,
        location,
        createAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage,
}