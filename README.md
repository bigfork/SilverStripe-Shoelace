#SilverStripe Clean Install#

Bare bones theme for use with SilverStripe 3.
Designed to be used with [SCSS](http://sass-lang.com).

By Colin Richardson [Bigfork Ltd](http://www.bigfork.co.uk/).

This is aimed heavily at stuff we use so may not be that useful to anyone else. Sorry.


#### Site deployment
```grunt push``` has been added to make website deployment and updates easier. it uses a modified [grunt-deployments module](https://github.com/stnvh/grunt-deployments) and the [grunt-ssh module](https://github.com/andrewrjones/grunt-ssh) to do so.

The syntax for this function is as follows:

##### grunt push

```grunt push:[test/live]:[dir]:[true/false]:[true/false]```

the first argument is either ```test``` or ```live```, which determines the staging type of the site (which part of the server it's uploaded to).

the second argument is the directory in which the site is deployed to / receeds in.

the third argument (which is optional, default ```false```) determines if you want to deploy (init & pull from master) an existing site rather than update an existing one.

the fourth argument (which is optional, default ```false```) determines if the local database should be uploaded to the server, set to true if so.

##### examples

```grunt push:live:newsite:true:true```

this initialises & pulls the site to the live part of the server in the directory ```newsite``` and uploads the database too.

```grunt push:test:fork```

this updates the existing site in the test part of the server in the directory ```fork``` and does not upload the database.

**NOTE:** *As mentioned before, this stuff has been built to work around our setup and will most likely not work anywhere else.*