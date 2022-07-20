// IMPORTS 

let express= require('express');
let usersCtrl = require('./routes/usersCtrl');
// Router
exports.router = (()=> {
    var apiRouter = express.Router();
      // Users route
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/updateUser/').put(usersCtrl.updateUser);
    apiRouter.route('/deleteUser/').delete(usersCtrl.deleteUser);
    apiRouter.route('/user/me').get(usersCtrl.getUserme);
    apiRouter.route('/user/:id').get(usersCtrl.getUser);
    apiRouter.route('/users/').get(usersCtrl.getAllUsers);
    apiRouter.route('/login/').post(usersCtrl.login);
  
      return apiRouter;
  })();