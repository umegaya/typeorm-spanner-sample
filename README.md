# typeorm-spanner-sample
sample project which introduces typeorm spanner driver. now only table synchronization and basic crud works

# usage
1. pull this repository
2. pull https://github.com/umegaya/typeorm at same directory of this repository exists. your directory looks like this:
```
$ ls typeorm*
typeorm:
CHANGELOG.md		build			node_modules		resources
CONTRIBUTING.md		codecov.yml		ormconfig.json		sample
DEVELOPER.md		docker-compose.yml	ormconfig.json.dist	src
ISSUE_TEMPLATE.md	docs			ormconfig.travis.json	temp
LICENCE			extra			package-lock.json	test
README-zh_CN.md		gulpfile.ts		package.json		tsconfig.json
README.md		tslint.json

typeorm-spanner-sample:
build			index.ts		node_modules		package.json
entities		makefile		package-lock.json	tsconfig.json
```
3. ```npx tsc``` under typeorm directory
4. ```npm install``` under this directory
5. ```make test CRED=/path/to/your-google-credential.json```
6. it should create table Item/User and create/find/update/delete single User record by using EntityManager

