describe("DI", function () {
    "use strict";

    var ns = {};

    // mock some classes
    ns.Obj1 = function (a) {
        if (a)
            this.args = arguments;
    };
    ns.Obj2 = function (a) {
        if (a)
            this.args = arguments;
    };

    ns.Obj3 = function (a) {
        if (a)
            this.args = arguments;
    };
    ns.Obj4 = function (a) {
        if (a)
            this.args = arguments;
    };

    beforeEach(function () {
        // create DI
        ns.di = new window.DI();
        // create default contracts
        ns.di._contracts.ajax = {
            classRef: ns.Obj1,
            params: ['rest', true],
            options: {
                singleton: true
            }
        };
        ns.di._contracts.rest = {
            classRef: ns.Obj2,
            params: ['http://bar.foo.com'],
            options: {
                singleton: true
            }
        };
        ns.di._contracts.basket = {
            classRef: ns.Obj3,
            params: [[1, 2], ['rest'], 'test'],
            options: {}
        };
    });

    it("should exist", function () {
        expect(window.DI).toBeDefined(); // the class
        expect(ns.di).toBeDefined(); // the instance
    });

    it("should be able to setup a contract", function () {
        expect(ns.di.register("obj1", ns.Obj1, ['a', 'b'], {
            singleton: true
        })).toBe(ns.di);
        expect(Object.keys(ns.di._contracts).length).toEqual(4);
        expect(ns.di._contracts['obj1'].classRef).toBe(ns.Obj1);
        expect(ns.di._contracts['obj1'].params).toEqual(['a', 'b']);
        expect(ns.di._contracts['obj1'].options).toEqual({
            singleton: true
        });

        expect(ns.di.register("obj2", ns.Obj2, {
            singleton: true
        })).toBe(ns.di);
        expect(Object.keys(ns.di._contracts).length).toEqual(5);
        expect(ns.di._contracts['obj2'].classRef).toBe(ns.Obj2);
        expect(ns.di._contracts['obj2'].params).toEqual([]);
        expect(ns.di._contracts['obj2'].options).toEqual({
            singleton: true
        });

        expect(ns.di.register("obj3", ns.Obj3)).toBe(ns.di);
        expect(Object.keys(ns.di._contracts).length).toEqual(6);
        expect(ns.di._contracts['obj3'].classRef).toBe(ns.Obj3);
        expect(ns.di._contracts['obj3'].params).toEqual([]);
        expect(ns.di._contracts['obj3'].options).toEqual({});
    });

    // test createInstance
    it("should create an instance for a contract", function () {
        expect(ns.di.getInstance('rest')).toBeInstanceof(ns.Obj2);
        expect(ns.di.getInstance('rest').args[0]).toEqual('http://bar.foo.com');
    });

    it("should provide a signleton instance", function () {
        var ajax = ns.di.getInstance('ajax');
        expect(ajax).toBeInstanceof(ns.Obj1);
        expect(ns.di.getInstance('ajax')).toBe(ajax); // check singleton
    });

    it("should inject dependencies for contract instance", function () {
        var ajax, ajax1, basket;

        // inject 1 dependency
        ajax = ns.di.getInstance('ajax');
        expect(ajax.args[0]).toBeInstanceof(ns.Obj2); // check constructor arguments
        expect(ajax.args[0].args[0]).toEqual('http://bar.foo.com'); // and the constructor argument arguments


        // inject 1 dependency at creation time
        ajax1 = ns.di.getInstance('ajax', ['basket', 'rest']);
        expect(ajax1).not.toBe(ajax);
        expect(ajax1.args[0]).toBeInstanceof(ns.Obj3);
        expect(ajax1.args[1]).toBeInstanceof(ns.Obj2);

        // complex dependencies
        basket = ns.di.getInstance('basket');
        expect(basket).toBeInstanceof(ns.Obj3);
        expect(basket.args[0]).toBeAnArray();
        expect(basket.args.length).toEqual(3);
        expect(basket.args[0][0]).toEqual(1);
        expect(basket.args[0][1]).toEqual(2);
        expect(basket.args[1][0]).toEqual(ns.di.getInstance('rest'));
        expect(basket.args[2]).toEqual('test');
    });
    it("should detect circular dependencies", function () {
        // create curcular dependency
        ns.di._contracts.rest = {
            classRef: ns.Obj2,
            params: ['http://bar.foo.com', 'ajax'],
            options: {
                singleton: true
            }
        };
        expect(ns.di.getInstance.bind(ns.di, "ajax")).toThrow("Circular dependency detected for contract ajax");
    });
});