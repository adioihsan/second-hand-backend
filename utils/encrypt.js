const bcrypt = require('bcrypt');

module.exports = {
    encrypt : (password) => {
        const hash = bcrypt.hashSync(password, 10);
        return hash;
    },
    comparePassword : (password, hash) => {
        const isValid = bcrypt.compareSync(password, hash);
        return isValid;
    }
}
