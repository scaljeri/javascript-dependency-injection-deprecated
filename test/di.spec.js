import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-fixtures';

chai.should();

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
              .register('$barDb', fixtures.BarDB, ['userTable', ['email', 'passwd', 'role'], fixtures.handleBarDB], {singleton: true})
              .register('$fooDb', fixtures.FooDB, ['userTable', ['email', 'passwd', 'role'], '$handleFooDb'], {singleton: true})
              .register('$handleFooDb', fixtures.handleFooDB, {notAClass: true});
        });

        it('should be chainable', function () {
            di.register("$test", fixtures.User, ['a', 'b']).should.eql(di);
        });

        it('should be possible to replace an existing contract', () => {
            let NewUser = function () {}

            di._contracts['$userA'].should.be.defined;
            di.register('$userA', NewUser, {});

            di._contracts['$userA'].classRef.should.equals(NewUser);
        });

        it('should contain contracts', () => {
            Object.keys(di._contracts).should.be.of.length(5);
        });

        it('should have a 2 $user contracts', () => {
            di._contracts['$userA'].should.be.defined;
            di._contracts['$userA'].classRef.should.equals(fixtures.User);

            di._contracts['$userB'].should.be.defined;
            di._contracts['$userB'].classRef.should.equals(fixtures.User);
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
            let userA, userB, bardb, foodb;

            beforeEach(() => {
                userA = di.getInstance('$userA', null, null, null, 'admin', '777');
                userB = di.getInstance('$userB', 'user-b@test.com', null, null, null, '766');
                bardb = di.getInstance('$barDb');
                foodb = di.getInstance('$fooDb');
            });

            it('should have initialized user A', () => {
                userA.email.should.equals('user-a@test.com');
                userA.passwd.should.equals('welcome');
                userA.storage.should.equals(bardb);
                userA.role.should.equals('admin');
                userA.permissions.should.equals('777');
            });

            it('should have inititalized user B', () => {
                userB.email.should.equals('user-b@test.com');
                userB.passwd.should.equals('welcome');
                userB.storage.should.equals(foodb);
                userB.role.should.equals('noob');
                userB.permissions.should.equals('766');
            });

            it("should detect circular dependencies", function () {
                di.register('$barDb', {}, ['$userA']);

                (() => {
                    di.getInstance('$userA');
                }).should.throw(Error, /Circular dependency detected for contract \$userA/);
            });

        });
    });
});
