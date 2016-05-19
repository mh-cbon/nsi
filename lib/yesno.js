
var inquirer = require('inquirer')

yesNo.auto = false;

function yesNo (title, def, then) {
  var q =   {
    type: 'input',
    name: 'answer',
    message: title,
    default: def,
    choices: [
      'yes',
      'no',
    ]
  };
  if (yesNo.auto) {
    console.log(title);
    console.log("Automatic answer %j", def);
    then(null, def)
  } else {
    inquirer.prompt(q).then(function (answers) {
        then(null, answers.answer);
    });
  }
}

module.exports = yesNo;
