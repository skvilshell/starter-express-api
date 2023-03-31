const DatabaseRow = require("./DatabaseRow");

class User extends DatabaseRow {

    constructor (id) {
        super();

        this.row_types["id"] = "int";
        try {
            this.id = parseInt(id);
        } catch(e) {
            this.id = null;
        }

        this.row_types["name"] = "string";
        this.name = null;

        this.row_types["phonenumber"] = "string";
        this.phonenumber = null;

        this.row_types["email"] = "string";
        this.email = null;

        this.row_types["is_email_confirmed"] = "int";
        this.is_email_confirmed = null;

        this.row_types["password"] = "string";
        this.password = null;

        this.row_types["role_id"] = "int";
        this.role_id  = null;

        this.row_types["logout_at"] = "string";
        this.logout_at = null;

        this.row_types["joined_at"] = "string";
        this.joined_at = null;

        this.row_types["last_seen_at"] = "string";
        this.last_seen_at = null;
    }

}

module.exports = User;
