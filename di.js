if (typeof exports === 'undefined') {
    exports = window;
}

exports.DI = (function(console, DEBUG) {
    'use strict';

    var depCheck = [] // used to check for circular dependencies
    /**
     * DI makes classes accessible by a contract. Instances are created when requested and dependencies are injected into the constructor,
     * facilitating lazy initialization and loose coupling between classes.
     *
     * As an example, register all contracts during the application initialization
     *
     *      var di = new DI() ;
     *      di.register( 'UserModel'                                                                          // contract name
     *                   , data.ActiveRecord                                                                  // class definiton
     *                   , [ 'User', 'webSql', ['userNameField', 'passwordField', 'accountInfo'], 'websql' ]  // constructor parameters
     *                   , { singleton: TRUE }                                                                // configuration: create a singleton
     *                 )
     *        .register( 'userNameField'
     *                   , data.Field
     *                   , [{ type: 'TEXT',  key: 'username', friendlyName: 'User name' }]
     *                   , {singleton: TRUE}
     *                 )
     *        .register( 'accountInfoField',
     *                   , data.Field
     *                   , [ { type: 'TEXT',  key: 'username', friendlyName: 'User name' }
     *                        , ['encryptFilter', 'compressFilter']
     *                     ]
     *                   , { singleton: TRUE}
     *                 )
     *        .register( 'userRecord'
     *                   , di.getInstance('UserModel')  // create the User model!!
     *                 )
     *        ...
     *
     * Now everywhere in the application create the instances as follows
     *
     *       var User = di.getInstance('User') ;
     *       userRecord = new User({ username: 'John', password: 'Secret' }) ;
     *       // or
     *       userRecord = di.getInstance('userRecord', [{username: 'John', password: 'Secret'}]) ;
     *
     * To give an idea of what this does, below is an example doing the exact same thing but without DI
     *
     *       var userNameField    = new data.Field( { type: 'TEXT',  key: 'username', friendlyName: 'User name' }] ) ;
     *       var accountInfoField = new data.Field( { type: 'TEXT',  key: 'username', friendlyName: 'User name' }
     *                                                   , [encryptFilterInstance, compressFilterInstance] ) ;
     *       ...
     *
     * And create instances like
     *
     *       var User = new data.ActiveRecord( 'User', webSqlInstance, [userNameField, passwordField, accountInfoField] ) ;
     *       var userRecord = new User({username: 'John', password: 'Secret'}) ;
     *
     * @class DI
     * @constructor
     **/
            , DI = function() {
                // container for all registered classes
                Object.defineProperty(this, '_contracts',
                        {
                            value: {},
                            enumerable: false // hide it
                        }
                ) ;
            } ;

    DI.prototype = {
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
         *      @param {String} [options.description] describes the contract (currently only used by {{#crossLink "DI/listContracts:method"}}{{/crossLink}}).
         * @return {Object} this
         * @example
         App.di.registerType("ajax", App.AJAX) ;
         App.di.registerType("ajax", App.AJAX, [], { singleton: true }) ;
         App.di.registerType("util", App.Util, ["compress", true, ["wsql", "ls"] ], { singleton: true } ) ;
         **/
        register: function(contract, classRef, params, options) {
            if ( params && !Array.isArray(params) ) // fix input
            {
                options = params ;
                params = [] ;
            }

            this._contracts[contract] = {
                classRef: classRef,
                params: params || [],
                options: options || {}
            } ;

            return this ;
        },

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
        getInstance: function(contract, params) {
            var instance = null ;

            if ( this._contracts[contract]  )
            {                                      // it should exist
                if (this._contracts[contract].options.singleton )
                {
                    instance = getSingletonInstance.call(this, contract, params) ;
                } else //create a new instance every time
                {
                    instance = createInstance.call(this, contract, params) ;
                }
            }
            return instance ;
        },

        /**
         * List all available contracts with their description to <tt>console.log</tt>
         * @method listContracts
         */
        listContracts: function() {
            var keys = Object.keys(this._contracts) ;

            keys.sort().forEach(function(v) {
                console(v + ', ' + this._contracts[v].options.description) ;
            }.bind(this)) ;
        }
    } ;

    /* ***** PRIVATE HELPERS ***** */

    /* Create or reuse a singleton instance */
    function getSingletonInstance(contract, params) {
        var config = this._contracts[contract] ;

        if ( params )
        {
            config.params = params ;
        }

        if ( config.instance === undefined || params )
        {
            config.instance = createInstance.call(this, contract, config.params) ;
        }

        return config.instance ;
    }

    /* convert a list of contracts into a list of instances
     * A dependency list can contain arrays with dependencies too:
     *    ["depA", ["depB", "depC"], "depE"]
     * In this case, the constructor would, for example, look like this:
     *    function constructor(instance, array, instance) { .. }
     * */
    function createInstanceList(contract, params) {
        var i, item
            , constParams = []
            , noa = Math.max(params.length,  this._contracts[contract].params.length) ;

        for(i = 0; i < noa; i++)
        {
            item = params[i] === undefined ? this._contracts[contract].params[i] : params[i] ;

            if ( Array.isArray(item))
            {
                constParams.push( createInstanceList.call(this, contract, item) ) ;
            }
            else
            {
                constParams.push( createInstanceIfContract.call(this, item) ) ;
            }
        }

        return constParams ;
    }

    function createInstanceIfContract(contract) { // is a contract
        var problemContract, constParam = contract

        if ( typeof(contract) === 'string' && this._contracts[contract] ) {   // is 'contract' just a contructor parameter or a contract?
            if ( depCheck.indexOf(contract) === -1 ) {                        // check for circular dependency
                constParam = this.getInstance(contract) ;                     // create the instance
                depCheck.pop() ;                                              // done, remove dependency from the list
            }
            else { // circular dependency detected!! --> STOP, someone did something stupid -> fix needed!!
                problemContract = depCheck[0] ;
                depCheck.length = 0 ;                                         // cleanup
                throw "Circular dependency detected for contract " + problemContract ;
            }
        }
        return constParam ;
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
    function createInstance(contract, params) {
        var cr, instance = null
            , self = this ;

        function Dependency(){
            cr.apply(this, createInstanceList.call(self, contract, params||[])) ;
        }

        if ( this._contracts[contract]) {           // contract should exist
            cr = this._contracts[contract].classRef ;

            depCheck.push(contract) ;
            Dependency.prototype = cr.prototype ;   // Fix instanceof
            instance = new Dependency() ;           // done
            depCheck.pop() ;
        }
        else if ( DEBUG ) {
            console.warn( 'Contract ' + contract + ' does not exist') ;
        }
        return instance ;
    }

    return DI;
})(console, typeof DEBUG === 'undefined' ? false : DEBUG) ;

// AMD compatible
if (typeof window !== 'undefined' && typeof window.define === "function" && window.define.amd)
{
    window.define('DI', [], function () {
        return window.DI;
    });
}
