(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DI = function () {
    /**
     * DI makes classes accessible by a contract. Instances are created when requested and dependencies are injected into the constructor,
     * facilitating lazy initialization and loose coupling between classes.
     *
     * The classes:
     *
     *      class Bar {
     *          constructor($foo, val) { this.foo = $foo; this.val = val }
     *      }
     *
     *      class Foo {}
     *
     * Setup:
     *
     *     di.register('$bar', Bar);               // $bar         - is the name of the contract (can be anything),
     *                                             // Bar          - the class reference
     *     di.register('$foo', Foo);               // The order of registration is irrelevant (lazy initialization!)
     *
     * Usage:
     *
     *     let bar = di.getInstance('$bar', 10);   // bar instanceof Bar
     *     // bar.foo instanceOf Foo -> true
     *     // bar.val === 10
     *
     * @class DI
     * @constructor
     **/
    function DI() {
        _classCallCheck(this, DI);

        this.reset();
    }

    /**
     * Register a class by creating a contract. Use **getInstance** to obtain
     * an instance from this contract. The **params** parameter is a list of contracts or simple values.
     *
     * @method register
     * @chainable
     * @param {String} contract name of the contract
     * @param {Class} classRef the class bind to this contract
     * @param {Array} [params] list of constructor parameters. Only if a parameter is a string and matches a contract, it
     * will be replaced with the corresponding instance
     * @param {Object} [options] configuration
     *      @param {String} [options.singleton=false] create a new instance every time
     *      @param {String} [options.factoryFor] name of the contract for which it is a factory
     *      @param {String} [options.writable=false]  append (=false) or replace (=true) construtor arguments
     * @return {Object} this
     * @example
     App.di.registerType("$ajax", App.AJAX) ;
     App.di.registerType("$ajax", App.AJAX, [], { singleton: true }) ;
     App.di.registerType("$util", App.Util, ["compress", true, ["$wsql", "ls"] ], { singleton: true } ) ;
     **/


    _createClass(DI, [{
        key: 'register',
        value: function register(contractStr, classRef) {
            var params = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

            var paramsOrigin = 'input';

            if (Array.isArray(classRef)) {
                options = params;
                params = classRef;
                classRef = null;
            } else if (classRef && (typeof classRef === 'undefined' ? 'undefined' : _typeof(classRef)) === 'object') {
                options = classRef;
                classRef = null;
            }

            if (!Array.isArray(params)) // no params defined
                {
                    options = params;
                    params = [];
                }

            // --debug-start--
            if (!classRef) {
                if (!options.factoryFor) {
                    console.warn('#register(' + contractStr + '): \'classRef\' is not defined');
                }
            } else if (typeof classRef !== 'function') {
                console.warn('#register(' + contractStr + '): \'classRef\' is not a function');
            }
            // --debug-end--


            if (params.length === 0 && classRef && options.autoDetect !== false) {
                params = params.length === 0 ? this.extractContracts(classRef) : params;
                paramsOrigin = 'auto';
            }

            this.contracts[contractStr] = {
                classRef: classRef,
                params: params,
                paramsOrigin: paramsOrigin,
                options: options
            };

            // Prepare factory if not manually defined
            if (!options.factoryFor && !this.contracts[contractStr + 'Factory']) {
                this.contracts[contractStr + 'Factory'] = {
                    options: {
                        factoryFor: contractStr,
                        writable: options.writable
                    },
                    params: []
                };
            }

            return this;
        }

        /**
         * Removes a contract
         *
         * @param {String} contractStr name of the contract
         */

    }, {
        key: 'remove',
        value: function remove(contractStr) {
            delete this.contracts[contractStr];
        }

        /**
         * Removes all contracts
         */

    }, {
        key: 'reset',
        value: function reset() {
            /** @private
             *  Used to check for circular dependencies
             * @type {Array}
             */
            this.depCheck = [];

            /**
             * @private
             * Used to store all the registered contracts
             * @type {{}}
             */
            this.contracts = {};
        }

        /**
         * Returns an instance for the given contract. Use <tt>params</tt> attribute to overwrite the default
         * parameters for this contract. If <tt>params</tt> is defined, the singleton will be (re)created and its
         * parameters are updated.
         *
         * @method getInstance
         * @param  {String} contract name
         * @param  {...*} [params] constructor parameters which, if defined, replaces its default arguments (see {{#crossLink "DI/register:method"}}{{/crossLink}} )
         * @return {Object} Class instance
         * @example
         App.di.register("ajax", ["rest"]) ;
         var ajax = App.di.getInstance("ajax") ;
         ajax = App.di.getInstance("ajax", "rest", true) ;
         **/

    }, {
        key: 'getInstance',
        value: function getInstance(contractStr) {
            var instance = null,
                contract = this.contracts[contractStr];

            if (contract) {
                for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    params[_key - 1] = arguments[_key];
                }

                if (contract.options.singleton) {
                    instance = this.getSingletonInstance(contractStr, params);
                } else //create a new instance every time
                    {
                        if (contract.options.factoryFor) {
                            instance = this.createFactory(contractStr, params);
                        } else {
                            instance = this.createInstance(contractStr, params);
                        }
                    }
            }

            return instance;
        }

        /**
         * @private
         * @param contractStr
         * @param initialParams
         * @returns {function()}
         */

    }, {
        key: 'createFactory',
        value: function createFactory(contractStr, initialParams) {
            var _this = this;

            var contract = this.contracts[contractStr],
                baseParams = this.mergeParams(contract, initialParams);

            return function () {
                for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    params[_key2] = arguments[_key2];
                }

                return _this.getInstance.apply(_this, [contract.options.factoryFor].concat(_toConsumableArray(_this.mergeParams(contract, params, baseParams))));
            };
        }

        /**
         * @private
         * @param contract
         * @param params
         */

    }, {
        key: 'mergeParams',
        value: function mergeParams(contract) {
            var _this2 = this;

            var newParams = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
            var initialParams = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

            var mergedParams = [],
                params = void 0;

            if (contract.paramsOrigin === 'auto') {
                params = contract.params.map(function (param) {
                    return _this2.contracts[param] ? param : undefined;
                });
            } else {
                params = contract.params;
            }

            initialParams = initialParams.length === 0 ? params : initialParams;

            if (contract.options.writable) {
                for (var i = 0; i < Math.max(newParams.length, initialParams.length); i++) {
                    mergedParams.push(newParams[i] === undefined ? initialParams[i] : newParams[i]);
                }
            } else {
                mergedParams = [].concat(_toConsumableArray(initialParams), _toConsumableArray(newParams));
            }

            return mergedParams;
        }

        /**
         * @private
         * Returns a new instance of the class matched by the contract.
         *
         * @method createInstance
         * @param {string} contract - the contract name
         * @param {Array} params - list of contracts passed to the constructor. Each parameter which is not a string or
         * an unknown contract, is passed as-is to the constructor
         *
         * @returns {Object}
         * @example
         var storage = App.di.createInstance("data", ["compress", true, "websql"]) ;
         **/

    }, {
        key: 'createInstance',
        value: function createInstance(contractStr, params) {
            var cr = void 0,
                instance = void 0,
                self = this,
                contract = this.contracts[contractStr];

            function Dependency() {
                cr.apply(this, self.createInstanceList(contractStr, params));
            }

            cr = contract.classRef;

            this.depCheck.push(contractStr);
            Dependency.prototype = cr.prototype; // Fix instanceof
            instance = new Dependency(); // done
            this.depCheck.pop();

            return instance;
        }

        /** @private
         * Convert a list of contracts into a list of instances
         * A dependency list can contain arrays with dependencies too:
         *    ["depA", ["depB", "depC"], "depE"]
         * In this case, the constructor would, for example, look like this:
         *    function constructor(instance, array, instance) { .. }
         * */

    }, {
        key: 'createInstanceList',
        value: function createInstanceList(contractStr, params) {
            var _this3 = this;

            var constParams = [],
                contract = this.contracts[contractStr],
                mergedParams = this.mergeParams(contract, params);

            mergedParams.forEach(function (item) {
                if (Array.isArray(item)) {
                    constParams.push(item.reduce(function (list, c) {
                        list.push(_this3.contracts[c] ? _this3.getInstance(c) : c);
                        return list;
                    }, []));
                } else {
                    constParams.push(_this3.createInstanceIfContract(item));
                }
            });

            return constParams;
        }

        /** @private
         *
         * Create or reuse a singleton instance
         */

    }, {
        key: 'getSingletonInstance',
        value: function getSingletonInstance(contractStr, params) {
            var contract = this.contracts[contractStr],
                mergedParams = this.mergeParams(contract, params);

            if (contract.instance === undefined || params && params.length > 0) {
                contract.params = mergedParams;
                contract.instance = this.createInstance(contractStr);
            }

            return contract.instance;
        }

        /** @private
         *
         * @param contract
         * @returns {*}
         */

    }, {
        key: 'createInstanceIfContract',
        value: function createInstanceIfContract(contractStr) {
            // is a contract
            var problemContract = void 0,
                constParam = contractStr;

            if (typeof contractStr === 'string' && this.contracts[contractStr]) // is 'contract' just a contructor parameter or a contract?
                {
                    if (this.depCheck.indexOf(contractStr) === -1) // check for circular dependency
                        {
                            constParam = this.getInstance(contractStr); // create the instance
                            this.depCheck.pop(); // done, remove dependency from the list
                        } else {
                        // circular dependency detected!! --> STOP, someone did something stupid -> fix needed!!
                        problemContract = this.depCheck[0];
                        this.depCheck.length = 0; // cleanup
                        throw Error("Circular dependency detected for contract " + problemContract);
                    }
                }

            return constParam;
        }
    }, {
        key: 'extractContracts',
        value: function extractContracts(classRef) {
            var args = classRef.toString().match(/(?:(?:^function|constructor)[^\(]*\()([^\)]+)/);

            return args === null ? [] : args.slice(-1)[0].replace(/\s/g, '').split(',');
        }
    }]);

    return DI;
}();
window.DI = DI;
exports.default = DI;
},{}]},{},[1]);
