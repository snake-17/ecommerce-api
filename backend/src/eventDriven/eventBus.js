const EventEmitter = require("events");
class CarritoEventBus extends EventEmitter {}
const eventBus = new CarritoEventBus();
module.exports = eventBus;
