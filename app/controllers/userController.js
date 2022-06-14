const { user } = require("../models");


module.exports = {
    getAllApi: (req, res) => {
        user.findAll()
        .then((usergame) => {
            //pakai ini untuk swagger
            res.status(200).json({ message: "Success", usergame }) 
        })
        .catch((err) => {
          console.log(err);
        });
    },getAllViews: (req, res) => {
        user.findAll()
        .then((usergame) => {
            //pakai ini untuk views
            res.status(200).json({ message: "Success", usergame }) 
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getId: (req, res) => {
        user.findOne({ where: { id: req.params.id } })
        .then((usergame) => {
            if (usergame) {
                res.status(200).json({ message: "Success", usergame })
              } else {
                res.status(404).json({ message: 'User Game Tidak di temukan', usergame });
              }
        console.log(req.params.id, usergame)
        })
        .catch((error) => res.status(422).json({ message: "Error get data", error })
        );
    },
    Post: (req, res) => {
        user.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
        })
            .then((usergame) => {
            res.status(201).json({ message: "Success menambahkan data", usergame })
        })
            .catch((err) => res.status(422).json("Can't create usergame"))
    },
    Put: (req, res) => {
    const { email ,username, password } = req.body
    user.update(
        {
            email,
            username,
            password,
        },
        {
            where: { id: req.params.id},
        })
        .then((usergame) => {
            res.status(201).json({ message: "Success", usergame })
          })
        .catch((err) => res.status(422).json(err))
    },
    Delete: (req, res) => {
        user.destroy({ where: { id: req.params.id } })
        .then((usergame) => {
            res.status(200).json({ message: "usergame dihapus", usergame })
        })
        .catch((err) => res.status(422).json(err))
    },
}