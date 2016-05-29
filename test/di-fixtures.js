/*
The story:

A factory builds engines. And engine consists of parts. Users work
for this factory and have different roles (employee, boss, etc).
There is an inventory of available parts. If needed, new parts
can be ordered (placeOrder)

 */

export class MachineFactory {
    constructor() { this.args = arguments; }
}

export class Engine {
    constructor() { this.args = arguments; }
}

export class EnginePart {
    constructor() { this.args = arguments; }
}
export class User {
    constructor() { this.args = arguments; }
}

let inventory = {};
function placeOrder() { this.args = arguments; }
export { inventory, placeOrder };
