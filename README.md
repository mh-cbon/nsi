# nsi - node service installer

Install a node package as a service. Compatible with systemd, upstart, chkconfig, launchd, sc.

Tested on windows server 2012, macos 10.9/10.10, fedora 23, centos6, ubuntu 14.04.

# Install

```
npm i @mh-cbon/nsi -g
```

# Usage

```
nsi list [service]
  Where [service] is the name of an existing service.
  If the service name is not provided, it returns the entire list of services.
  The returned data are JSON compatible.
  The content if the tree is system dependent.

nsi install [package source]
  Where [source package] can be a valid source identifier accepted by npm.
  The package must provide one of `npm start script` or `nsi` file to be
  installed.
  nsi will perform necessary operations to install the service and make it start
  at boot.

nsi remove [service]
  Where [service] is the name of an existing service.
  Stop, disable and remove the service.
  It keeps the logs and other data installed by the package during the setup
  and its lifetime.

nsi edit [service]
  Where [service] is the name of an existing service.
  Open the service file definition for edition under one of the available
  text editor under the current system.
  It then performs required operation to make the changes applied.

nsi disable [service]
  Where [service] is the name of an existing service.
  Disables the given service, meaning that it won t start at boot anymore.
  Stops the service immediately.

nsi enable [service]
  Where [service] is the name of an existing service.
  Enables the given service, meaning that it will start at boot.
  Starts the service immediately.

nsi refresh
  Refresh the service manager of the current underlying system.
  Available under macos, systemd, upstart.
  Useful under some circumstances to reflect changes.

nsi start [service]
  Where [service] is the name of an existing service.
  Starts the given service.

nsi restart [service]
  Where [service] is the name of an existing service.
  Restarts the given service.

nsi stop [service]
  Where [service] is the name of an existing service.
  Stops the given service.

nsi reload [service]
  Where [service] is the name of an existing service.
  Reloads the given service.
  Available with chkconfig, systemd, upstart if the package
  provide a reload command.
  Fallback to a restart if the underlying system
  is not able to perform the operation.

nsi validate [package source]
  Ensures that the given package source can be setup as a service.

nsi generate
  Generate the nsi service definition file for the package on the current cwd.

```

### nsi - install

`nsi` will install the service in the user scope where possible (systemd, launchd).

It will fallback to a system wide service in other system (windows, upstart, chkconfig).

Currently it is not possible to install a system service under systemd and launchd.

On windows services are installed, executed via [nssm](http://nssm.cc/).

On windows system, the system will prompt for `UAC` validation. Accept it or move away.

On unix friendly system sudo challenges may pop during the procedure, see below for automation.

### nsi - start/stop/restart/reload

Due to the various capabilities provided by the underlying system all the commands
does not operate with the same behavior depending on the current OS.

The command may, or may not, be synchronous.

It may fail to return the success / failure status of the operation.

### nsi - list

nsi list the services according to the current OS information.

Each system will return different information, they will be reflected in the returned information.

#### macos

```json
{
  "fake-pkg": {
    "pid": "336",
    "status": "-",
    "id": "fake-pkg"
  }
}
```

### nsi - automation

It is possible to automate operations and bypass required `sudo` challenges on unix friendly systems.

Set `yasudo` env variable to your sudo password

```sh
yasudo=<your password to sudo> nsi install @your/package
```

On windows system automation is not possible unless
you are able to start the process from an elevated command.

### nsi - debugging

To enable verbose mode and debug messages define a [DEBUG](https://github.com/visionmedia/debug#windows-note) variable such

```sh
DEBUG=@mh-cbon/nsi nsi list
DEBUG=@mh-cbon/nsi,@mh-cbon/launchd-simple-api nsi list
DEBUG=* nsi list
```

# Generating a service definition for your package

nsi is able to install a package as a service in two cases,

- it provide an npm start script
- it provides a service definition file `nsi.js`

#### npm start script

In such configuration the command is parsed and consumed as is by nsi to setup and install the package.

No configuration of the command is possible.

#### nsi.js file

The `nsi.js` file defines the service commands, arguments, environments variables.

You can easily generate your service definition by using the generate command : `nsi generate`

It s a plain JS object exported via `module.exports`,

```js
var serviceDefinition = {
  nsiversion: '1.0.x',
  author: 'me',
  description: 'whatever',
  start: {
    bin: 'node',
    args: [
      'fake-service.js',
      function (argv, serviceDefinition, then) {
        // do some stuf async like inquirer whatever
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
    some: function (argv, serviceDefinition, then) {
      // do some stuf async like inquirer whatever
      then('the value');
    },
    withspace: 'env with a space',
  },
  prefer_user: 'linus',
  prefer_group: 'torvalds',
  post_install: function (argv, serviceDefinition, then) {
    then(err=null)
  }
}

module.exports = serviceDefinition;
```

You don t need to save `nsi` as a local dependency.

You must provide `nsiversion` and `start` fields.

# Todo

- add `edit` command !!
- add `generate` command !!
- improve this readme
- add system wide service setup
- add sysv support
- add openrc support
- add runinit support
- add more boxes.

# Tests

Here is the recipe to run the tests of this package

- get vagrant from the official website
- add vbguest plugin `vagrant plugin install vbguest`
- add winrm plugin `vagrant plugin install winrm`
- run `sh mocha.sh`
- go on a walk, the shopping or any ride.
- check the logs.
