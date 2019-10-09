import {SpannerDDLTransformer, MakeDebug} from "typeorm/driver/spanner/SpannerDDLTransformer";
import {SpannerExtendSchemaSources} from "typeorm/driver/spanner/SpannerRawTypes";
const parserFactory = require('sql-ddl-to-json-schema');



const sqls = [
	"ALTER TABLE `User` CHANGE `latest_date` `latest_date` int NOT NULL;",
	"CREATE TABLE `Trend` (" + 
	"	`id` varchar(255) NOT NULL," + 
	"	`date` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6)," +
	"	`disable` enum ('False', 'True', '0', '1') NOT NULL DEFAULT 'False'," + 
	"   `disable2` tinyint NOT NULL DEFAULT 0," + 
	"	`manage_user_id` varchar(127) NOT NULL, " + 
	"	`comment` varchar(255) NULL, " + 
	"	`query` varchar(255) NULL, " + 
	"	PRIMARY KEY (`id`)" + 
	") ENGINE=InnoDB;",
	"CREATE TABLE `User` (" + 
	"  `id` int NOT NULL AUTO_INCREMENT," + 
	"  `name` varchar(255) NOT NULL DEFAULT `fuga`," + 
	"  `name2` varchar(255) NOT NULL DEFAULT `hoge`," + 
	"  `data` varbinary(255) NOT NULL," + 
	"  INDEX name_idx(`name`, `name2` DESC)," +
	"  UNIQUE name2_idx(`name2`)," +
	"  PRIMARY KEY (`id`)" + 
	") ENGINE=InnoDB;", 
	"ALTER TABLE `User` ADD `latest_date` timestamp(6) NULL AFTER `register_date`;", 
	"ALTER TABLE `User` ADD `latest_date` timestamp(6) NULL FIRST;", 
	"DROP TABLE `User`;", 
	"RENAME TABLE `User` to `User2`;", 
	"ALTER TABLE `User` DROP `latest_date`;",
	"ALTER TABLE `User` MODIFY `latest_date` int(11) NOT NULL;",
	"ALTER TABLE `User` CHANGE `latest_date` `last_date` timestamp(6) NOT NULL;",
	"ALTER TABLE `User` ADD FULLTEXT INDEX latest_date_and_id(`id`, `latest_date`);",
	"ALTER TABLE `User` ADD UNIQUE INDEX latest_date_and_id(`id`, `latest_date`);",
	"ALTER TABLE `User` ADD SPATIAL INDEX `latest_date_and_id`(`id`, `latest_date`);",
	"ALTER TABLE `User` DROP INDEX `latest_date_and_id`;",
	"DROP INDEX `latest_date_and_id` ON `User`;", 
	"CREATE UNIQUE INDEX `latest_date_and_id` ON `User`(`id`, `latest_date`);", 
];

const fixtures = [
    `ALTER TABLE User ALTER COLUMN latest_date int64`,
    [
        `CREATE TABLE Trend (id string(255) NOT NULL,date timestamp  ,disable string(max) NOT NULL ,disable2 bool NOT NULL ,manage_user_id string(127) NOT NULL,comment string(255) ,query string(255) ) PRIMARY KEY (id);`, 
        `{"Trend":{"date":{"type":"default","value":"\\"CURRENT_TIMESTAMP(6)\\""},"disable":{"type":"default","value":"\\"False\\""},"disable2":{"type":"default","value":"0"}}}`,
    ],
    [
        `CREATE TABLE User (id int64 NOT NULL ,name string(255) NOT NULL ,name2 string(255) NOT NULL ,data bytes(255) NOT NULL) PRIMARY KEY (id);CREATE INDEX name_idx ON User(name,name2 DESC);CREATE UNIQUE INDEX name2_idx ON User(name2)`,
        `{"User":{"id":{"type":"generator","value":"increment"},"name":{"type":"default","value":"\\"fuga\\""},"name2":{"type":"default","value":"\\"hoge\\""}}}`
    ],
    `ALTER TABLE User ADD COLUMN latest_date timestamp AFTER register_date`,
    `ALTER TABLE User ADD COLUMN latest_date timestamp FIRST`,
    `DROP TABLE User`,
    `RENAME TABLE User TO User2`,
    `ALTER TABLE User DROP COLUMN latest_date`,
    `ALTER TABLE User ALTER COLUMN latest_date int64`,
    new Error("changing column name latest_date => last_date is not supported"),
    `CREATE INDEX latest_date_and_id ON User(id,latest_date)`,
    `CREATE UNIQUE INDEX User_idx_id_latest_date ON User(id,latest_date)`,
    `CREATE NULL_FILTERED INDEX latest_date_and_id ON User(id,latest_date)`,
    `DROP INDEX latest_date_and_id`,
    `DROP INDEX latest_date_and_id`,
    `CREATE UNIQUE INDEX latest_date_and_id ON User(id,latest_date)`    
];

for (const sql of sqls) {
	console.log(`--------------------- test transform of [${sql}]`)
	const idx = sqls.indexOf(sql);
	const parser = (new parserFactory("mysql")).parser;
    parser.feed(sql);
    const schemaSources: SpannerExtendSchemaSources = {};
	const t = MakeDebug(new SpannerDDLTransformer((v: any) => JSON.stringify(v)));
	//console.log('parser', parser);
	const f = fixtures[idx];
	try {
		const tsql = t.transform(parser.results[0], schemaSources);

		let ok = true;
		if (f instanceof Error) {
			console.log(`error intended but not happen: ${tsql.trim()}`);
			process.exit(1);
		} else if (typeof(f) !== 'string') {
			ok = (f[0] == tsql.trim() && f[1] == JSON.stringify(schemaSources));
			console.log(f[0] == tsql.trim(), f[1] == JSON.stringify(schemaSources));
		} else {
			ok = f === tsql.trim();
			if (!ok) {
				console.log(f, tsql.trim(), f == tsql.trim());
			}
		}
		if (!ok) {
			console.log(`sql=[${sql}], transform=[${tsql}], exSchemas=${JSON.stringify(schemaSources)}`);
			process.exit(1);
		}
	} catch (e) {
		if (f instanceof Error) {
			if (f.message.trim() == e.message.trim()) {
				continue;
			}
			console.log(`error intended but message differs: [${f.message.trim()}]/[${e.message.trim()}]`);
		} else {
			console.log(`unexpected error: ${e.message}`);
		}
		process.exit(1);
	}
}

