class DatabaseRow {

    constructor () {
        this.row_types = {};
    }

    import (data) {
        var value;
        for (let key in data) {
            value = data[key];
            if (this[key] !== undefined) {
                if (this.row_types[key] != null) {
                    if (this.row_types[key] == "int") {
                        try {
                            this[key] = parseInt(value);
                            continue;
                        } catch(e) {
                            return null;
                        }
                    }
                }
                this[key] = value;
            }
        }
        return this;
    }

    export (exportKeys) {
        var data = {};
        for (let key of exportKeys)
            if (this[key] !== undefined)
                data[key] = this[key];
        return data;
    }

}

module.exports = DatabaseRow;
