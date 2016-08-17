export class Bar {
    constructor(a, b) { this.total = this.sum(a, b); }

    sum(a, b) {
        return a + b;
    }
}

function Foo() {

}

Foo.prototype.sum = function ($bar, a, b) {
    return $bar.sum(a, b);
};

//export Foo;

