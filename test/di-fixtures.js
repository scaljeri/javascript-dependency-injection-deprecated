export class BarSimple {
    constructor() { this.args = arguments; }
}

export class BarBasic {
    constructor(a, b, c) { this.args = arguments; }
}

export class BarComplex {
    constructor(a, $foo, c, $barBasic, d) { this.args = arguments; }
}

export class FooSimple {
    constructor() { this.args = arguments; }
}

export function FooBasic(a, b, c) {
    this.args = arguments;
}

export function FooComplex(a, $foo, $barComplex, b, c) { this.args = arguments; }

