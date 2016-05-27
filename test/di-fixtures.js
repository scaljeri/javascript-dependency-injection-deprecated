class BaseDb  {
    constructor(name, fieldList, handle) {
        this.name = name;
        this.fieldList = fielList;
        this.handle = handle;
    }

    persist() {}
}

export class WebSqwl extends BaseDb {
    constructor(name, fieldList, handle) {
        super(name, fieldList, handle);
    }
}

export class IndexDB extends BaseDb {
    constructor(name, fieldList, handle) {
        super(name, fieldList, handle);
    }
}

export class User {
    constructor(email, passwd, storage, role) {  // the `storage` parameter holds an instance
        this.email = email;
        this.passwd = passwd;
        this.storage = storage;
        this.role = role;
    }

    save() {
        this.storage.persist(this);
    }
}

//function handleWebSql() {}
//export { handleWebSql};
