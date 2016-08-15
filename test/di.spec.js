import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-fixtures';

let should = chai.should();

describe.only("DI", () => {
    let di;

    beforeEach(() => {
        di = new DI();
    });

    it('should initially have no contracts', () => {
        Object.keys(di.contracts).should.be.of.length(0);
    });

    it('should return null if no contract is specified', () => {
        should.not.exist(di.getInstance());
    });

    it('should return null for a non-existing contract', () => {
        should.not.exist(di.getInstance('iDoNotExist'));
    });

    describe('#register', () => {
        describe('Without params/options', () => {
            let foo, bar;

            beforeEach(() => {
                di.register('$bar', fixtures.BarSimple);
            });

            describe('#getInstance', () => {
                beforeEach(() => {
                    bar = di.getInstance('$bar');
                });

                describe('With 1 argument (the contract name)', () => {
                    it('should have created a contract + factory', () => {
                        Object.keys(di.contracts).should.be.of.length(2);
                        di.contracts.$bar.should.to.be.defined;
                        di.contracts.$barFactory.should.to.be.defined;
                    });

                    it('should have created the instance', () => {
                        bar.should.be.defined;
                        bar.should.be.instanceOf(fixtures.BarSimple);
                    });

                    it('should have created it without constructor arguments', () => {
                        Object.keys(bar.args).should.be.of.length(0);
                    });
                });

                describe('With >1 arguments', () => {
                    beforeEach(() => {
                        di.register('$foo', fixtures.FooSimple);
                        foo = di.getInstance('$foo', 1, '$bar');
                    });

                    it('should have created the instance', () => {
                        foo.should.be.defined;
                        foo.should.be.instanceOf(fixtures.FooSimple);
                    });

                    it('should have created the instance with arguments', () => {
                        foo.args[0].should.equals(1);
                        foo.args[1].should.be.instanceOf(fixtures.BarSimple);
                    });
                });
            });

            describe('Using the auto generated factory', () => {
                let barFactory;

                beforeEach(() => {
                    di.register('$bar', fixtures.BarSimple);
                    di.register('$foo', fixtures.FooSimple);
                });

                describe('Without arguments', () => {
                    beforeEach(() => {
                        barFactory = di.getInstance('$barFactory');
                        bar = barFactory();
                    });

                    it('should create an instance', () => {
                        bar.should.be.defined;
                    });

                    it('should create the instance without arguments', () => {
                       Object.keys(bar.args).should.to.be.of.length(0);
                    });
                });

                describe('With level 1 arguments', () => {
                    beforeEach(() => {
                        barFactory = di.getInstance('$barFactory', '$foo', 2, undefined, 3);
                        bar = barFactory();
                    });

                    it('should create an instance', () => {
                        bar.should.be.defined;
                    });

                    it('should create the instance with arguments', () => {
                        Object.keys(bar.args).should.to.be.of.length(4);
                        bar.args[0].should.be.instanceOf(fixtures.FooSimple);
                        bar.args[1].should.be.equals(2);
                        should.not.exist(bar.args[2]);
                        bar.args[3].should.equals(3);
                    });

                });

                describe('With level 2 arguments', () => {
                });

                describe('With level 1 and level 2 arguments', () => {
                });
            });
        });
    });
});


