window.native = require("./native.node");

class ExchangeHouse {
  listeners: Record<string, (arg: string) => void> = {};
}

const house = new ExchangeHouse();

window.exchange = {
  send(tunnel, arg) {
    const fn = house.listeners[tunnel];
    fn && fn(arg);
  },
  listen(tunnel, cb) {
    house.listeners[tunnel] = cb;
  },
};
