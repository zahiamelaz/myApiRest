var asyncLib = require('async');
var models = require('../models');
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.Utils')
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,10}$/

module.exports = {
//function register
register: (req, res) => {
//params
        let nom = req.body.nom;
        let prenom = req.body.prenom;
        let email = req.body.email;
        let mdp = req.body.mdp;
        let role = req.body.role;

        if (email == null || nom == null || prenom == null || mdp == null) {
            return res.status(400).json({error: "An error occurred,champs vide"})
        }
        if (username.length >= 13 || username.length <= 4) {
            return res.status(400).json({ error: 'An error occurred,champs vide (must be length 5 - 12)' });
          }

        if(!EMAIL_REGEX.test(email)) {
            return res.status(400).json({'error': 'An error occurred,Email not valid'})
        }

        if(!PASSWORD_REGEX.test(mdp)) {
            return res.status(403).json({'error': 'An error occurred,Password not valid'})
        }

        //Verifier si le user exist sinon créer un user

        asyncLib.waterfall([
            (done) => {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email }
                })
                .then((userFound) => {
                    done(null, userFound)
                })
                .catch((err) => {
                    return res.status(400).json({'error': 'An error occurred'})
                })
            },
            (userFound, done) => {
                if(!userFound) {
                    bcrypt.hash(mdp, 5, (err, bcryptedmdp) => {
                        done(null, userFound, bcryptedmdp)
                    })
                }
                else {
                    return res.status(409).json({'error': 'User Already exists'})
                }
            },
            (userFound, bcryptedmdp, done) => {
                
                let newUser = models.User.create({
                    nom: nom,
                    prenom: prenom,
                    email: email,
                    mdp: bcryptedmdp,
                    role: role
                })
                .then((newUser) => {
                    done(newUser)
                })
                .catch((err) => {
                    return res.status(400).json({'error': 'An error occurred'})
                })
            }
        ], (newUser) => {
            if(newUser){
                return res.status(201).json({'success': 'user successfuly created'})
            }
            else {
                return res.status(400).json({ 'error': 'An error occurred'})
            }
        })
    },
    getUserme: function(req, res) {
        // Getting auth header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
          return res.status(400).json({ 'error': 'wrong token' });
    
        models.User.findOne({
          attributes: [ 'id', 'email', 'nom','prenom', 'bio' ],
          where: { id: userId }
        }).then(function(user) {
          if (user) {
            res.status(201).json(user);
          } else {
            res.status(404).json({ 'error': 'user not found' });
          }
        }).catch(function(err) {
          res.status(500).json({ 'error': 'cannot fetch user' });
        });
      },

    updateUser: (req, res) => {

        let headerAuth  = req.headers['authorization'];
        let userId = jwtUtils.getUserId(headerAuth);

        let nom = req.body.nom;
        let prenom = req.body.prenom;
        let role = req.body.role;

        asyncLib.waterfall([
            (done) => {
                models.User.findOne({
                    attributes: ['id', 'nom', 'prenom', 'email', 'role'],
                    where: { id: userId }
                })
                .then((userFound) => {
                    done(null, userFound);
                })
                .catch((err) => {
                    return res.status(400).json({ 'error': 'An error occurred' });
                });
            },
            (userFound, done) => {
              if(userFound) {
                userFound.update({
                    nom: (nom ? nom: userFound.nom),
                    prenom: (prenom ? prenom : userFound.prenom),
                    role: (role ? role : userFound.role)
                })
                .then((userFound) => {
                    done(userFound);
                })
                .catch((err) => {
                    res.status(400).json({ 'error': 'An error occurred' });
                });
              }
              else {
                res.status(404).json({ 'error': 'An error occurred' });
              }
            },
          ], 
          (userFound) => {
            if (userFound) {
                res.status(200).json({'success': 'User successfuly modified'})
            } 
            else {
              return res.status(400).json({ 'error': 'An error occurred' });
            }
          });
    },

    deleteUser: (req, res) => {
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);

        asyncLib.waterfall([
            (done) => {
                models.User.destroy({
                    where: { id: userId }
                })
                .then((userFound) => {
                    done(userFound)
                })
                .catch((err) => {
                    return res.status(400).json({ 'error': 'An error occurred' });
                });
            }],
            (userFound) => {
                if (userFound) {
                    return res.status(200).json({'success':`User successfuly deleted`})
                }
                else {
                    return res.status(404).json({ 'error': 'User was not found' });
                }
            });
    },

      getUser: (req, res) => {
        let userId = req.params.id
    
        models.User.findOne({
            attributes: [ 'id', 'nom', 'prenom', 'email', 'role' ],
            where: { id: userId }
          })
          .then((user) => {
            if (user) {
              res.status(201).json(user);
            }
            else {
              res.status(404).json({ 'error': 'user not found' });
            }
          })
          .catch((err) => {
            res.status(500).json({ 'error': 'cannot fetch user' });
          });
      },  

   getAllUsers:(req, res) => {
    
        models.User.findAll({
            attributes: [ 'id', 'nom', 'prenom', 'email', 'role' ]
        })
        .then((users) => {
            res.status(200).json(users)
        })
        .catch((err) => {
            res.status(400).json({ 'error': 'An error occurred' });
        });
    },
//FUNCTION LOGIN
    login: (req, res) => {
    
        // Params
        var email    = req.body.email;
        var password = req.body.password;
    
        if (email == null ||  password == null) {
          return res.status(400).json({ 'error': 'missing parameters' });
        }
    
        asyncLib.waterfall([
          (done) => {
            models.User.findOne({
                where: { email: email }
            })
            .then((userFound) => {
                done(null, userFound);
            })
            .catch((err) => {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });
          },
          (userFound, done) => {
            if (userFound) {
              bcrypt.compare(password, userFound.password, (errBycrypt, resBycrypt) => {
                done(null, userFound, resBycrypt);
              });
            } 
            else {
              return res.status(404).json({ 'error': 'user not exist in DB' });
            }
          },
          (userFound, resBycrypt, done) => {
            if(resBycrypt) {
              done(userFound);
            } 
            else {
              return res.status(403).json({ 'error': 'invalid password' });
            }
          }
        ], 
        (userFound) => {
          if (userFound) {
            return res.status(201).json({
              'id': userFound.id,
              'token': jwtUtils.generateTokenForUser(userFound)
            });
          } 
          else {
            return res.status(500).json({ 'error': 'cannot log on user' });
          }
        });
      }
}
  