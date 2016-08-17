import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-augment-fixtures';

let should = chai.should();

describe.only("DI - Augment", () => {
    let di, bar;

    beforeEach(() => {
        di = new DI();
    });

    describe('Automatic', () => {
        let foo;

        beforeEach(() => {
            di.register('$foo', fixtures.Foo, {augment: true});
            di.register('$bar', fixtures.Bar, [1, 2]);
            foo = di.getInstance('$foo', 10, 20);
        });

        it('should augment', () => {
            foo.total.should.equals(30);
        });
    });

    describe('Manual', () => {
        let baz;

        beforeEach(() => {
            di.register('$baz', fixtures.Baz, {augment: ['$bar']});
            di.register('$bar', fixtures.Bar);
            baz = di.getInstance('$baz', 100);
        });

        it('should have a $bar', () => {
            baz.$bar.should.be.instanceOf(fixtures.Bar);
        });

        it('should use $bar', () => {
            baz.sum(1, 2).should.equals(103);
        });
    });
});

