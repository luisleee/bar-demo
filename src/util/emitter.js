let emitter = null;

function getEmitter() {
    return emitter;
}

function setEmitter(e) {
    emitter = e;
}

module.exports = { getEmitter, setEmitter };
