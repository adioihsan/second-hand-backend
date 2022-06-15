const { User, UserDetail } = require("../models");
const response = require("../../utils/formatResponse"); 

module.exports = {
    putUserDetail: async (req, res) => {
        try {
            const jwtData = req.user  // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            const { name, city, address, phone } = req.body;
            const filename = req.file ? req.file.filename : null;
            const user = await User.findOne({  
                where: { id: jwtData.id }, 
                include: { model: UserDetail } 
            });
            console.log("USER : ", user);
            var UserDetailData = {}
            if (!user) { return response(res, 404, false, 'User not found', null) }
            if (filename) {
                UserDetailData = {                      
                    name: name,
                    city: city,
                    address: address,
                    phone: phone,
                    image: req.file.filename
                }
            } else {
                UserDetailData = {                
                    name: name,
                    city: city,
                    address: address,
                    phone: phone
                }
            }
            const updatedUserDetail= await user.UserDetail.update(UserDetailData);
            if (updatedUserDetail) { return response(res, 200, true, 'User Detail Updated!', updatedUserDetail) }
            return response(res, 400, false, 'Update failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else if (error.name === 'SequelizeValidationError') {
                return response(res, 400, false, error.errors[0].message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    getUserDetail: async (req, res) => { 
        try {
            const jwtData = req.user;
            console.log("JWT : ", jwtData);
            const userDetail = await UserDetail.findOne({ 
                where: { user_id: jwtData.id }
            });
            if (!userDetail) { return response(res, 404, false, 'User Detail not found', userDetail) }
            return response(res, 200, true, 'Success', userDetail);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    }
    // TODO : Maaf aku comment nanti dulu ya, kenapa masih usergame
    // getAllApi: (req, res) => {
    //     user.findAll()
    //     .then((usergame) => {
    //         res.status(200).json({ message: "Success", usergame }) 
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // },getAllViews: (req, res) => {
    //     user.findAll()
    //     .then((usergame) => {
    //         //pakai ini untuk views
    //         res.status(200).json({ message: "Success", usergame }) 
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // },
    // getId: (req, res) => {
    //     user.findOne({ where: { id: req.params.id } })
    //     .then((usergame) => {
    //         if (usergame) {
    //             res.status(200).json({ message: "Success", usergame })
    //           } else {
    //             res.status(404).json({ message: 'User Game Tidak di temukan', usergame });
    //           }
    //     console.log(req.params.id, usergame)
    //     })
    //     .catch((error) => res.status(422).json({ message: "Error get data", error })
    //     );
    // },
    // Post: (req, res) => {
    //     user.create({
    //         email: req.body.email,
    //         username: req.body.username,
    //         password: req.body.password,
    //     })
    //         .then((usergame) => {
    //         res.status(201).json({ message: "Success menambahkan data", usergame })
    //     })
    //         .catch((err) => res.status(422).json("Can't create usergame"))
    // },
    // Put: (req, res) => {
    // const { email ,username, password } = req.body
    // user.update(
    //     {
    //         email,
    //         username,
    //         password,
    //     },
    //     {
    //         where: { id: req.params.id},
    //     })
    //     .then((usergame) => {
    //         res.status(201).json({ message: "Success", usergame })
    //       })
    //     .catch((err) => res.status(422).json(err))
    // },
    // Delete: (req, res) => {
    //     user.destroy({ where: { id: req.params.id } })
    //     .then((usergame) => {
    //         res.status(200).json({ message: "usergame dihapus", usergame })
    //     })
    //     .catch((err) => res.status(422).json(err))
    // },
}