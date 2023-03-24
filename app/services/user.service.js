const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class UserService {
    constructor(client) {
        this.User = client.db().collection("users");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractUserData(payload) {
        const user = {
            username: payload.username,
            password: payload.password,
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone
        };
        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        return user;
    }

    async register(payload) {
        const user = this.extractUserData(payload);
        const salt = bcrypt.genSaltSync(10);
        const passwordHashed = bcrypt.hashSync(user.password, salt);
        const result = await this.User.findOneAndUpdate(
            user,
            { $set: { password: passwordHashed } },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async login(payload) {
        const user = await this.User.findOne({ "username": payload.username });
        if (user) {
            // check user password with hashed password stored in the database
            const validPassword = await bcrypt.compare(payload.password, user.password);
            if (validPassword) {
                return user;
            } else {
                return false;
            }
        }
    }

    async find(filter) {
        const cursor = await this.User.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findByAddress(address) {
        return await this.find({
            address: { $regex: new RegExp(address), $options: "i" },
        });
    }

    async findById(id) {
        return await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractUserData(payload);
        const result = await this.User.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.User.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async findFavorite() {
        return await this.find({ favorite: true });
    }

    async deleteAll() {
        const result = await this.User.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = UserService;