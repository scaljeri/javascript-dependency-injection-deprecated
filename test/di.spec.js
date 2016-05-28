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
        Object.keys(di._contracts).should.be.of.length(0);
    });

    describe('#register', () => {
        beforeEach(() => {
            di.register('$userA', fixtures.User, ['user-a@test.com', 'welcome', '$barDb'])
                    .register('$userB', fixtures.User, [null, 'welcome', '$fooDb', 'noob'])
                    .register('$barDb', fixtures.BarDB, ['userTable', ['email', 'passwd', 'role'], fixtures.handleBarDB, '$recordDbFactory'], {singleton: true})
                    .register('$fooDb', fixtures.FooDB, ['userTable', ['email', 'passwd', 'role'], '$handleFooDb'], {singleton: true})
                    .register('$handleFooDb', fixtures.handleFooDB, {notAClass: true})
                    .register('$recordDb', fixtures.RecordDb, [['email, passwd, role'], ['string', 'string', 'string']])
                    .register('$myFactory', null, ['factory@chai.com', 'noPassword', null, null, '000'], {factoryFor: '$userB'});
        });

        it('should be chainable', function () {
            di.register("$test", fixtures.User, ['a', 'b']).should.eql(di);
        });

        it('should be possible to replace an existing contract', () => {
            let NewUser = function () {};

            di._contracts['$userA'].should.be.defined;
            di.register('$userA', NewUser, {});

            di._contracts['$userA'].classRef.should.equals(NewUser);
        });

        it('should contain contracts + factory contracts', () => {
            Object.keys(di._contracts).should.be.of.length(13);
        });

        it('should have 2 $user contracts', () => {
            di._contracts['$userA'].should.be.defined;
            di._contracts['$userA'].classRef.should.equals(fixtures.User);

            di._contracts['$userB'].should.be.defined;
            di._contracts['$userB'].classRef.should.equals(fixtures.User);
        });

        it('should have 2 $user factory contracts', () => {
            di._contracts['$userAFactory'].should.be.defined;
            di._contracts['$userAFactory'].options.factoryFor.should.equals('$userA');

            di._contracts['$userBFactory'].should.be.defined;
            di._contracts['$userBFactory'].options.factoryFor.should.equals('$userB');
        });

        it('should have a $bardb contract', () => {
            di._contracts['$barDb'].should.be.defined;
            di._contracts['$barDb'].classRef.should.equals(fixtures.BarDB);
        });

        it('should have a $foodb contract', () => {
            di._contracts['$fooDb'].should.be.defined;
            di._contracts['$fooDb'].classRef.should.equals(fixtures.FooDB);
        });

        it('should have a $handleFooDb contract', () => {
            di._contracts['$handleFooDb'].should.be.defined;
            di._contracts['$handleFooDb'].classRef.should.equals(fixtures.handleFooDB);
            di._contracts['$handleFooDb'].options.notAClass.should.be.ok;
        });

        describe('#getInstance', () => {
            let userA, userB, barDb, fooDb, noOptions;

            beforeEach(() => {
                userA = di.getInstance('$userA', null, null, null, 'admin', '777');
                userB = di.getInstance('$userB', 'user-b@test.com', null, null, null, '766');
                barDb = di.getInstance('$barDb');
                fooDb = di.getInstance('$fooDb');

                di.register('$noOptions', fixtures.User);
                noOptions = di.getInstance('$noOptions');
            });

            it('should work without options', () => {
                noOptions.should.be.instanceOf(fixtures.User);
            });

            it('should return null if contract doesn\'t exist', () => {
                di.getInstance('$doesNotExist').should.equals('$doesNotExist');
            });

            it('should have initialized user A', () => {
                userA.email.should.equals('user-a@test.com');
                userA.passwd.should.equals('welcome');
                userA.storage.should.equals(barDb);
                userA.role.should.equals('admin');
                userA.permissions.should.equals('777');
                userA.should.be.instanceOf(fixtures.User);
            });

            it('should have inititalized user B', () => {
                userB.email.should.equals('user-b@test.com');
                userB.passwd.should.equals('welcome');
                userB.storage.should.equals(fooDb);
                userB.role.should.equals('noob');
                userB.permissions.should.equals('766');
                userB.should.be.instanceOf(fixtures.User);
            });

            it("should detect circular dependencies", function () {
                di.register('$barDb', {}, ['$userA']);

                (() => {
                    di.getInstance('$userA');
                }).should.throw(Error, /Circular dependency detected for contract \$userA/);
            });

            describe('Factory', () => {
                let myFactory, newUser;
                beforeEach(() => {
                    myFactory = di.getInstance('$myFactory', 'abc@def.ghi', null, null, null, '111');
                    newUser = myFactory('new@mail.com');
                });
                
                it('should inject', () => {
                    barDb.recordFactory.should.be.defined;
                    barDb.recordFactory().should.be.instanceOf(fixtures.RecordDb);
                });

                it('should create a user', () => {
                    newUser.should.be.instanceOf(fixtures.User);
                    newUser.email.should.equals('new@mail.com');
                    newUser.passwd.should.equals('welcome');
                    newUser.storage.should.be.instanceOf(fixtures.FooDB);
                    newUser.role.should.equals('noob');
                    newUser.permissions.should.equals('111');
                });
            });

            describe('Recreate a singleton', () => {
                let oldSingleton, newSingleton;

                beforeEach(() => {
                    oldSingleton = di.getInstance('$barDb'); // Create singleton
                    newSingleton = di.getInstance('$barDb', null, ['e', 'p', 'r']); // Re-create singleton because of the new params
                });

                it('should have create a new singleton', () => {
                    oldSingleton.should.not.equals(newSingleton);
                });

                it('should have updated the params', () => {
                    newSingleton = di.getInstance('$barDb');

                    newSingleton.name.should.equals('userTable');
                    newSingleton.fieldList.should.eql(['e', 'p', 'r']);
                    newSingleton.handle.should.equals(fixtures.handleBarDB);
                });
            });
        });
    });
});
