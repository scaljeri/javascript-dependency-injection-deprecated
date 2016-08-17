export class Bar {
    constructor(a, b) { this.total = this.sum(a, b); }

    sum(a, b) {
        return a + b;
    }
}

export class Baz {
    constructor(base) { this.base = base; }

    sum(a, b) {
        return this.$bar.sum(a, b) + this.base;
    }
}

function Foo(a, b) {
    this.total = this.sum(a, b)
}

Foo.prototype.sum = function ($bar, a, b) {
    return $bar.sum(a, b);
};


export {Foo};

