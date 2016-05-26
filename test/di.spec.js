import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-fixtures';

chai.should();

describe("DI", function () {
    let di;

    beforeEach(function () {
        di = new DI();

        di.register('user', fixtures.User, [null, 'welcome', 'websql', 'nobody']);
        di.register('websql', fixtures.WebSql, ['userTable', ['email', 'passwd', 'role']], {singleton: true});
        di.register('indexdb', fixtures.IndexDB, ['userTable', ['email', 'passwd', 'role']], {singleton: true});
    });

    it('should exist', function () {
        di.should.be.defined;
    });

    describe('#register', () => {
        it('should be chainable', function () {
            di.register("test", fixtures.User, ['a', 'b']).should.eql(di);
        });
    })
});
/*

 it('should be able to setup a contract', function () {
 expect(Object.keys(di._contracts).length).toEqual(3);
 expect(di._contracts.user.classRef).toBe(User);
 expect(di._contracts.websql.params).toEqual(['userTable', ['email','passwd', 'role']]);
 expect(di._contracts.indexdb.options).toEqual({singleton: true});
 });

 it('should be able to replace an exising contract (without options)', function () {
 di.register('user', User, [null, 'welcome', 'indexdb', 'admin']);

 expect(di._contracts.user.classRef).toBe(User);
 expect(di._contracts.user.params).toEqual([null, 'welcome', 'indexdb', 'admin']);
 });

 it('should be able to replace an exising contract (with options)', function () {
 di.register('websql', WebSql, ['userTable', ['email','passwd', 'role']]);
 di.register('indexdb', IndexDB, ['userTable', ['email','passwd', 'role']], {singleton: false});

 expect(di._contracts.websql.options).toEqual({});
 expect(di._contracts.indexdb.options).toEqual({singleton: false});
 });

 xit('should create an instance for a contract', function () {
 expect(di.getInstance('user', ['john@example.com'])).toBeInstanceof(User);
 expect(di.getInstance('user', ['john@example.com']).email).toEqual('john@example.com');
 expect(di.getInstance('user', ['john@example.com']).role).toEqual('nobody');
 });

 it('should set default parameter to null', function () {
 expect(di.getInstance('user', ['john@example.com', null]).passwd).toBeNull();
 });

 it('should set use default parameters', function () {
 expect(di.getInstance('user', ['john@example.com', undefined]).passwd).toEqual('welcome');
 });

 it("should provide a signleton instance", function () {
 expect(di.getInstance('websql')).toBe(di.getInstance('websql'));
 });

 it("should inject default dependencies", function () {
 var websql = di.getInstance('websql');
 spyOn(websql, 'persist');

 var user = di.getInstance('user', ['john@example.com']);
 user.save();

 expect(websql.persist).toHaveBeenCalledWith(user);

 });

 it('should be able to instantiate contract with different dependencies', function () {
 var user = di.getInstance('user', ['john@example.com', undefined, 'indexdb']),
 indexdb = di.getInstance('indexdb');

 spyOn(indexdb, 'persist');
 user.save();

 expect(indexdb.persist).toHaveBeenCalledWith(user);
 });

 it("should detect circular dependencies", function () {
 di.register('websql', WebSql, ['user']);

 expect(di.getInstance.bind(di, "user")).toThrow("Circular dependency detected for contract user");
 });
 });
 */
