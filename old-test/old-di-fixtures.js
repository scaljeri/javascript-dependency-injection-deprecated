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

export function TireS($engineModelS) { this.args = arguments; }

export class TireSX {
    constructor($engineModelX, valX, $engineModelS, valS) { this.args = arguments; }
}

let inventory = {};
function placeOrder() { this.args = arguments; }
export { inventory, placeOrder };
