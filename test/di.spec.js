import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-fixtures';

let should = chai.should();

describe("DI", () => {
    let di;

    beforeEach(() => {
        di = new DI();
    });

    it('should be defined', () => {
        di.should.be.defined;
    });

    it('should habe no contracts', () => {
        Object.keys(di.contracts).should.be.of.length(0);
    });

    describe('#register', () => {
        beforeEach(() => {
            di.register('$machineFactory', fixtures.MachineFactory, ['Tesla', '$engineFactory', '$inventory'], {singleton: true})
                    .register('$engine', fixtures.Engine, ['Model S', 'pk', 'mph', ['p1', 'p2', '$enginePartFactory']], { writable: true})
                    .register('$engineModelS', fixtures.Engine, ['Model S', 'pk', 'mph'])
                    .register('$enginePart', fixtures.EnginePart)
                    .register('$enginePartFactoryModelS', null, ['oil'], {factoryFor: '$enginePart'})
                    .register('$enginePartFactoryModelX', null, ['oil'], {factoryFor: '$enginePart', writable: true})
                    .register('$user', fixtures.User, [,,'welcome', 'employee', '711'], {writable: true})
                    .register('$inventory', fixtures.inventory, {isClass: false})
                    .register('$placeOrder', fixtures.placeOrder, {isClass: false});

        });

        it('should be possible to replace an existing contract', () => {
            di.contracts['$user'].should.be.defined;
            di.register('$user', function (){}, {});

            di.contracts['$user'].classRef.should.not.equals(fixtures.User);
        });

        it('should contain contracts + factory contracts', () => {
            di.contracts['$user'].should.be.defined;
            di.contracts['$userFactory'].should.be.defined;
        });

        describe('#getInstance', () => {
            let factory, engineModelX, engineModelS, employee, boss, inventory, placeOrder;

            beforeEach(() => {
                factory = di.getInstance('$machineFactory', 'Elon Musk', 8000);
                engineModelS = di.getInstance('$engineModelS', 'min', 'max');
                engineModelX = di.getInstance('$engine', 'pkt', undefined, 'min');
                employee = di.getInstance('$user', 'John Doe', 'johndoe@tesla.com');
                boss = di.getInstance('$user', 'Elon Musk', 'elon@tesla.com', undefined, 'boss', '777');
                inventory = di.getInstance('$inventory');
                placeOrder = di.getInstance('$placeOrder');
            });

            it('should create instance without options', () => {
                inventory.should.equals(fixtures.inventory);
            });

            it('should return null if it doesn\'t exist', () => {
                should.not.exist(di.getInstance('$doesNotExist'));
            });

            it('should have created an instance without options (factory)', ()=> {
                factory.args[0].should.equals('Tesla');
                factory.args[1].should.be.instanceOf(Function);
                factory.args[2].should.equals(fixtures.inventory);
                factory.args[3].should.equals('Elon Musk');
                factory.args[4].should.equals(8000);
            });

            it('should have initialized the boss', () => {
                boss.args[0].should.equals('Elon Musk');
                boss.args[1].should.equals('elon@tesla.com');
                boss.args[2].should.equals('welcome');
                boss.args[3].should.equals('boss');
                boss.args[4].should.equals('777');
            });

            it('should have initialized the employee', () => {
                employee.args[0].should.equals('John Doe');
                employee.args[1].should.equals('johndoe@tesla.com');
                employee.args[2].should.equals('welcome');
                employee.args[3].should.equals('employee');
                employee.args[4].should.equals('711');
            });

            it('should have processed array arguments with contracts', () => {
                engineModelX.args[3][0].should.equals('p1');
                engineModelX.args[3][1].should.equals('p2');
                engineModelX.args[3][2].should.be.a('function');
                engineModelX.args[3][2]().should.be.instanceOf(fixtures.EnginePart);
            });

            it("should detect circular dependencies", function () {
                di.register('$user', function () {}, ['$user']);

                (() => {
                    di.getInstance('$user');
                }).should.throw(Error, /Circular dependency detected for contract \$user/);
            });

            describe('Factory', () => {
                let userFactory, newUser, enginePartFactory, newModelS;

                beforeEach(() => {
                    // writable === true
                    userFactory = di.getInstance('$userFactory', 'default', 'default@mail.com', 'secret', undefined, '111');
                    newUser = userFactory('Lucas Calje', undefined, undefined, 'admin');

                    // writable === false
                    enginePartFactory = di.getInstance('$enginePartFactoryModelS', 'hoses');
                    newModelS = enginePartFactory('cylinder', 'pistons');
                });

                it('should create a user', () => {
                    newUser.should.be.instanceOf(fixtures.User);
                });

                it('should have updated params', () => {
                    newUser.args[0].should.equals('Lucas Calje') ;
                    newUser.args[1].should.equals('default@mail.com') ;
                    newUser.args[2].should.equals('secret') ;
                    newUser.args[3].should.equals('admin') ;
                });

                it('should ingore params if not writable', () => {
                    newModelS.args[0].should.equals('oil');
                });
            });

            describe('Recreate a singleton', () => {
                let newFactory, newFactoryWithParams;

                beforeEach(() => {
                    newFactory = di.getInstance('$machineFactory');
                    newFactoryWithParams = di.getInstance('$machineFactory', 'all models');
                });

                it('should have create a new singleton', () => {
                    factory.should.equals(newFactory);
                });

                it('should create new Singleton', () => {
                   factory.should.not.equals(newFactoryWithParams);
                });
            });
        });
    });
});
