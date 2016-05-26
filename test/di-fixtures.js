export class WebSqwl {
    constructor(name, fieldList) {
        this._fl = fieldList;
    }

    persist(obj) {
        this._fl.forEach(function (field) {
            console.log('    ' + field + ': ' + obj[field]);
        });
    }
}

export class IndexDB {
    constructor(name, fieldList) {
        this._fl = fieldList;
    }

    persist(obj) {
        console.log('IndexDB will persist:');
        fieldList.forEach(function (field) {
            console.log('    ' + field + ': ' + obj[field]);
        });
    }
}

export class User {
    constructor(email, passwd, storage, role) {  // the `storage` parameter holds an instance
        this._email = email;
        this._passwd = passwd;
        this._storage = storage;
        this._role = role;
    }

    save() {
        this._storage.persist(this);
    }
}