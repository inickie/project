const express = require("express")
const bcrypt = require("bcryptjs");
const db = require("../config/database")
const { SendCode } = require("../email")

const router = express.Router();

router.post("/", (req, res) => {
    const { FIO, login, email, password } = req.body
    if (!FIO || !login || !email || !password) {
        return res.send("WRONG_REQUEST")
    }
    const roles = "authUser"
    passwordHash = bcrypt.hashSync(password, 8)
    const id_User = db.usersMaxID + 1
    db.usersMaxID += 1
    const currentUser = db.users.filter(el => el.email === email)[0]
    if (currentUser && currentUser.isEmail) {
        return res.send({ success: false })
    }
    let code = Math.random().toString().slice(-6)
    console.log(code)
    db.users.push({
        id_User,
        FIO,
        login,
        email,
        passwordHash,
        roles,
        isEmail: false,
        emailCode: code
    })
    SendCode(email, code)
    res.status(200).send({ message: "success" })
    console.log("POST/SIGNUP/")
})

router.post("/email/confirm", (req, res) => {
    const { email, code } = req.body
    if (!email || !code) {
        return res.send({ success: false })
    }
    const currentUser = db.users.filter(el => el.email === email)[0]
    if (currentUser.isEmail || currentUser.emailCode !== code) {
        return res.send({ success: false })
    }
    currentUser.isEmail = true;
    currentUser.emailCode = null;
    db.users = db.users.map(el => el.id === currentUser.id ? currentUser : el)
    res.send({ success: true })
    console.log("POST/SIGNUP/EMAIL/CONFIRM")
})
module.exports = router