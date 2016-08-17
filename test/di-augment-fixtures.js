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

export class Qux {
    constructor(base) {
        // @inject: $bar, $foo
        this.base = base || 9;
    }
    sum(a, b) {
       return this.base + this.$foo.sum(a, b) + this.$bar.total;
    }
}

function Foo(a, b) {
    this.total = this.sum(a, b)
}

Foo.prototype.sum = function ($bar, a, b) {
    return $bar.sum(a, b);
};

export {Foo};

function Garply() {
    // @inject: $qux
    this.sum =  (a, b) => {
        return this.$qux.sum(a, b);
    }
}

export {Garply};


