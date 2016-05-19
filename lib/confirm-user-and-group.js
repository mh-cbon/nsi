var yesNo     = require('../lib/yesno.js');
var inquirer  = require('inquirer');

var confirmUserAndGroup = function (user, group, then) {
  yesNo('The service will run as '+user+':'+group+', do you agreed ?', 'yes', function (err, answer) {
    if (answer==='yes') return then(null, user, group);
    var questions = [
      {
        type: 'input',
        name: 'user_group',
        message: 'Type in user and group in the form %s:%s',
        validate: function (value) {
          if (value.match(/^[^:]+:[^:]+$/)) return true;
          return 'Please enter a valid input';
        }
      }
    ];
    inquirer.prompt(questions).then(function (answers) {
      user  = answers.user_group.match(/^([^:]+):/)[1];
      group = answers.user_group.match(/:([^:]+)$/)[1];
      then(null, user, group)
    });
  })
}

module.exports = confirmUserAndGroup;
