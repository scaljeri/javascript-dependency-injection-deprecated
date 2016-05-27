class BaseDb  {
    constructor(name, fieldList, handle) {
        this.name = name;
        this.fieldList = fieldList;
        this.handle = handle;
    }

    persist() {}
}

export class BarDB extends BaseDb {
    constructor(name, fieldList, handle) {
        super(name, fieldList, handle);
    }
}

export class FooDB extends BaseDb {
    constructor(name, fieldList, handle) {
        super(name, fieldList, handle);
    }
}

export class User {
    constructor(email, passwd, storage, role, permissions=711) {
        this.permissions = permissions;
        this.email = email;
        this.passwd = passwd;
        this.storage = storage;
        this.role = role;
    }

    save() {
        this.storage.persist(this);
    }
}

let handleFooDB = {};
function handleBarDB() {}
export { handleBarDB, handleFooDB };
