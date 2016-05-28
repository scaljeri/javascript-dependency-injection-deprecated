export default class DI {
    constructor() {
        this.depCheck = []; // used to check for circular dependencies
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
        // container for all registered classes
        Object.defineProperty(this, '_contracts',
                {
                    value: {},
                    enumerable: false // hide it
                }
        );
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
     *      @param {String} [options.noClassRef=false] the reference is not a constructor but something else
     *      @param {String} [options.singleton=false] create a new instance every time
     *      @param {String} [options.description] describes the contract (currently only used by {{#crossLink "DI/listContracts:method"}}{{/crossLink}}).
     * @return {Object} this
     * @example
     App.di.registerType("ajax", App.AJAX) ;
     App.di.registerType("ajax", App.AJAX, [], { singleton: true }) ;
     App.di.registerType("util", App.Util, ["compress", true, ["wsql", "ls"] ], { singleton: true } ) ;
     **/
    register(contract, classRef, params, options) {
        if (params && !Array.isArray(params)) // fix input
        {
            options = params;
            params = [];
        }

        this._contracts[contract] = {
            classRef: classRef,
            params: params || [],
            options: options || {}
        };

        return this;
    }

    /**
     * Returns an instance for the given contract. Use <tt>params</tt> attribute to overwrite the default
     * parameters for this contract. If <tt>params</tt> is defined, the singleton configuration option is ignored.
     *
     * @method getInstance
     * @param  {String} contract name
     * @param  {Array} [params] constructor parameters which, if defined, replaces its default arguments (see {{#crossLink "DI/register:method"}}{{/crossLink}} )
     * @return {Object} Class instance
     * @example
     App.di.register("ajax", ["rest"]) ;
     var ajax = App.di.getInstance("ajax") ;
     ajax = App.di.getInstance("ajax", ["rest", true]) ;    //
     **/
    getInstance(contract, ...params) {
        let instance = null;

        if (this._contracts[contract])                           // it should exist
        {
            if (this._contracts[contract].options.singleton) {
                instance = this.getSingletonInstance(contract, params);
            } else //create a new instance every time
            {
                if (this._contracts[contract].options.notAClass)
                {
                    instance = this._contracts[contract].classRef;
                } else
                {
                    instance = this.createInstance(contract, params);
                }
            }
        }

        return instance;
    }

    /*
     * Returns a new instance of the class matched by the contract. If the contract does not exists an error is thrown.
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
    createInstance(contract, params) {
        let cr, instance = null
                , self = this;

        function Dependency() {
            cr.apply(this, self.createInstanceList(contract, params || []));
        }

        if (this._contracts[contract])             // contract should exist
        {
            cr = this._contracts[contract].classRef;

            this.depCheck.push(contract);
            Dependency.prototype = cr.prototype;   // Fix instanceof
            instance = new Dependency();           // done
            this.depCheck.pop();
        }

        return instance;
    }

    /* convert a list of contracts into a list of instances
     * A dependency list can contain arrays with dependencies too:
     *    ["depA", ["depB", "depC"], "depE"]
     * In this case, the constructor would, for example, look like this:
     *    function constructor(instance, array, instance) { .. }
     * */
    createInstanceList(contract, params) {
        let i, item
                , constParams = []
                , noa = Math.max(params.length, this._contracts[contract].params.length);

        for (i = 0; i < noa; i++) {
            item = (params[i] === undefined || params[i] === null) ? this._contracts[contract].params[i] : params[i];

            if (Array.isArray(item)) {
                constParams.push(this.createInstanceList(contract, item));
            }
            else {
                constParams.push(this.createInstanceIfContract(item));
            }
        }

        return constParams;
    }

    /* Create or reuse a singleton instance */
    getSingletonInstance(contract, params) {
        let config = this._contracts[contract];

        if (params && params.length > 0) {
            params.forEach((arg, index) => {
                if (arg !== null) {
                    config.params[index] = arg;
                }
            });
        }

        if (config.instance === undefined || (params && params.length > 0)) {
            config.instance = this.createInstance(contract, config.params);
        }

        return config.instance;
    }


    createInstanceIfContract(contract) { // is a contract
        let problemContract, constParam = contract;

        if (typeof(contract) === 'string' && this._contracts[contract])     // is 'contract' just a contructor parameter or a contract?
        {
            if (this.depCheck.indexOf(contract) === -1)                          // check for circular dependency
            {
                constParam = this.getInstance(contract);                     // create the instance
                this.depCheck.pop();                                              // done, remove dependency from the list
            }
            else   // circular dependency detected!! --> STOP, someone did something stupid -> fix needed!!
            {
                problemContract = this.depCheck[0];
                this.depCheck.length = 0;                                         // cleanup
                throw Error("Circular dependency detected for contract " + problemContract);
            }
        }

        return constParam;
    }
}


