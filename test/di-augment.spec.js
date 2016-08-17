import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-augment-fixtures';

let should = chai.should();

describe("DI - Augment", () => {
    let di, bar;

    beforeEach(() => {
        di = new DI();
    });

    describe('Automatic', () => {
        let foo;

        describe('Default', () => {
            beforeEach(() => {
                di.register('$foo', fixtures.Foo, {augment: true});
                di.register('$bar', fixtures.Bar, [1, 2]);
                foo = di.getInstance('$foo', 10, 20);
            });

            it('should augment', () => {
                foo.total.should.equals(30);
            });
        });

        describe('Annotated', () => {
            let qux, garply;

            beforeEach(() => {
                di.register('$bar', fixtures.Bar, [2, 4]);
                di.register('$foo', fixtures.Foo, {augment: true});
                di.register('$qux', fixtures.Qux, {augment: true});
                di.register('$garply', fixtures.Garply, {augment: true});
                qux = di.getInstance('$qux',  8);
                garply = di.getInstance('$garply');
            });

            describe('Classes', () => {
                it('should have been created', () => {
                    qux.should.be.instanceOf(fixtures.Qux);
                });

                it('should be injected', () => {
                    qux.$bar.should.be.instanceOf(fixtures.Bar);
                    qux.$foo.should.be.instanceOf(fixtures.Foo);
                });

                it('should work as expected', () => {
                   qux.sum(100, 1000).should.equals(1114);
                });
            });

            describe('Constructor functions', () => {
                it('should have been created', () => {
                    garply.should.be.instanceOf(fixtures.Garply);
                });

                it('should be injected', () => {
                    garply.$qux.should.be.instanceOf(fixtures.Qux);
                });

                it('should work as expected', () => {
                    garply.sum(100, 1000).should.equals(1115);
                });
            });
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

