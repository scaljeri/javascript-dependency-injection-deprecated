export default class DI {
    /**
     * DI makes classes accessible by a contract. Instances are created when requested and dependencies are injected into the constructor,
     * facilitating lazy initialization and loose coupling between classes.
     *
     * As an example, consider a User and Persitance classes:
     *
     *     class WebSql {
         *         constructor(name, fieldList)  { ... }
         *         persist(obj) { ... }
         *    }
     *
     *     class IndexDB {
         *         constructor(name, fieldList)  { ... }
         *         persist(obj) { ... }
         *     }
     *
     *     class User {
         *         constructor(email, passwd, storage, role) { ... }
         *         save() { this.storage.persist(this); }
         *     }
     *
     * With these classes in our pocket its time to setup the relations between them. The function that does this has the
     * following signature
     *
     *     function (<contract name>,
     *               <class reference>,
     *               [optional list of constructor arguments],
     *               {optional configuration object} )
     *
     * Or just in code:
     *
     *     var di = new DI();
     *
     *     di.register('$user', User, [null, 'welcome', '$websql', 'nobody']);
     *     di.register('$websql', WebSql, ['userTable', ['email','passwd', 'role']], {singleton: true});
     *     di.register('$indexdb', IndexDB, ['userTable', ['email','passwd', 'role']], {singleton: true});
     *
     * Note that the constructor arguments are default values or contract names. Now it is easy to create
     * instances:
     *
     *     var user1 = di.getInstance('user', 'john@exampe.com'),
     *           -> email: 'john@exampe.com', passwd: 'welcome', storage : WebSQL instance, role: 'nobody'
     *         user2 = di.getInstance('user', 'john@exampe.com', 'newSecret'); // define a new password
     *           -> email: 'john@exampe.com', passwd: 'newSecret', storage : WebSQL instance, role: 'nobody'
     *
     *     if (user1 instanceof User) { ... } // user1 is an instance of User!!
     *
     * But it is also possible to use `IndexDB` as the persistance class:
     *
     *     var user = di.getInstance('user', 'john@exampe.com', null, 'indexdb'), // The password is set to null too!
     *           -> email: 'john@exampe.com', passwd: null, storage : IndexDB instance, role: 'nobody'
     *         root = di.getInstance('user', 'john@exampe.com', undefined, 'indexdb', 'admin');
     *           -> email: 'john@exampe.com', passwd: 'welcome', storage : IndexDB instance, role: 'admin'
     *
     *
     * @class DI
     * @constructor
     **/
    constructor() {
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
     * Register a class by creating a contract. Use {{#crossLink "DI/getInstance:method"}}{{/crossLink}} to obtain
     * an instance from this contract. The <tt>params</tt> parameter is a list of contracts,  and, if needed, normal
     * constructor parameters can be mixed in.
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
     App.di.registerType("ajax", App.AJAX) ;
     App.di.registerType("ajax", App.AJAX, [], { singleton: true }) ;
     App.di.registerType("util", App.Util, ["compress", true, ["wsql", "ls"] ], { singleton: true } ) ;
     **/
    register(contractStr, classRef, params = [], options = {}) {
        if (Array.isArray(classRef))
        {
            options = params;
            params = classRef;
            classRef = null;
        }
        else if (typeof classRef === 'object')
        {
            options = classRef;
            classRef = null;
        }

        if (!Array.isArray(params)) // no params defined
        {
            options = params;
            params = [];
        }

        // --debug-start--
        if (!classRef) 
        {
            if (!options.factoryFor) 
            {
                console.warn(`#register(${contractStr}): 'classRef' is not defined`);
            }
        }
        else if (typeof(classRef) !== 'function')
        {
            console.warn(`#register(${contractStr}): 'classRef' is not a function`);
        }
        // --debug-end--


        if (classRef && options.autoDetect !== false)
        {
            params = params.length === 0 ? this.extractContracts(classRef) : params;
        }

        this.contracts[contractStr] = {
            classRef: classRef,
            params: params,
            options: options
        };

        // Prepare factory if not manually defined
        if (!options.factoryFor && !this.contracts[`${contractStr}Factory`])
        {
            this.contracts[`${contractStr}Factory`] = {
                options: {
                    factoryFor: contractStr
                    , writable: options.writable
                },
                params: []
            };
        }

        return this;
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
    getInstance(contractStr, ...params) {
        let instance = null
            , contract = this.contracts[contractStr];

        if (contract) 
        {
            if (contract.options.singleton)
            {
                instance = this.getSingletonInstance(contractStr, params);
            }
            else //create a new instance every time
            {
                if (contract.options.factoryFor)
                {
                    instance = this.createFactory(contractStr, params);
                }
                else
                {
                    instance = this.createInstance(contractStr, params);
                }
            }
        }

        return instance || (this.depCheck.length === 0 ? null : contractStr);
    }

    /**
     * @private
     * @param contractStr
     * @param initialParams
     * @returns {function()}
     */
    createFactory(contractStr, initialParams) {
        let contract = this.contracts[contractStr]
            , baseParams = this.mergeParams(contract, initialParams);

        return (...params) => {
            return this.getInstance(contract.options.factoryFor, ...this.mergeParams(contract, params, baseParams));
        };
    }

    /**
     * @private
     * @param contract
     * @param params
     */
    mergeParams(contract, newParams = [], initialParams = []) {
        let mergedParams = [];

        initialParams = initialParams.length === 0 ? contract.params : initialParams;

        if (contract.options.writable)
        {
            for (let i = 0; i < Math.max(newParams.length, initialParams.length); i++) {
                mergedParams.push(newParams[i] === undefined ? initialParams[i] : newParams[i]);
            }
        }
        else
        {
            mergedParams = [...initialParams, ...newParams];
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
    createInstance(contractStr, params) {
        let cr, instance
            , self = this
            , contract = this.contracts[contractStr];

        function Dependency()
        {
            cr.apply(this, self.createInstanceList(contractStr, params));
        }

        cr = contract.classRef;

        this.depCheck.push(contractStr);
        Dependency.prototype = cr.prototype;   // Fix instanceof
        instance = new Dependency();           // done
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
    createInstanceList(contractStr, params) {
        let constParams = []
            , contract = this.contracts[contractStr]
            , mergedParams = this.mergeParams(contract, params);

        mergedParams.forEach((item) => {
            if (Array.isArray(item))
            {
                constParams.push(item.reduce(
                        (list, val) => {
                            list.push(this.getInstance(val));

                            return list;
                        }, []));
            }
            else
            {
                constParams.push(this.createInstanceIfContract(item));
            }
        });

        return constParams;
    }

    /** @private
     *
     * Create or reuse a singleton instance
     */
    getSingletonInstance(contractStr, params) {
        let contract = this.contracts[contractStr]
            , mergedParams = this.mergeParams(contract, params);

        if (contract.instance === undefined || (params && params.length > 0))
        {
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
    createInstanceIfContract(contractStr) {                                     // is a contract
        let problemContract
            , constParam = contractStr;

        if (typeof(contractStr) === 'string' && this.contracts[contractStr])  // is 'contract' just a contructor parameter or a contract?
        {
            if (this.depCheck.indexOf(contractStr) === -1)                        // check for circular dependency
            {
                constParam = this.getInstance(contractStr);                    // create the instance
                this.depCheck.pop();                                           // done, remove dependency from the list
            }
            else
            { // circular dependency detected!! --> STOP, someone did something stupid -> fix needed!!
                problemContract = this.depCheck[0];
                this.depCheck.length = 0;                                      // cleanup
                throw Error("Circular dependency detected for contract " + problemContract);
            }
        }

        return constParam;
    }

    extractContracts(classRef) {
        let args = classRef.toString().match(/(?:(?:^function|constructor)[^\(]*\()([^\)]+)/);

        return args === null ? [] : args.slice(-1)[0].replace(/\s/g, '').split(',');
    }
}


