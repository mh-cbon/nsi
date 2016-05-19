var serviceDefinition = {
  nsiversion: '1.0.x',
  author: 'me',
  description: 'whatever',
  start: {
    bin: 'node',
    args: [
      'fake-service.js',
      function (serviceDefinition, then) {
        // do some stuf async
        then(8090);
      },
      '-a',
      '-b',
      'args with a space'
    ]
  },
  reload: {
    bin: 'echo',
    args: [
      'reloaded !!',
    ]
  },
  env: {
    some: 'value',
    withspace: 'env with a space',
  },
  prefer_user: 'linus',
  prefer_group: 'torvalds',
  post_install: function (serviceDefinition, then) {
    then(err=null)
  }
}

module.exports = serviceDefinition;
