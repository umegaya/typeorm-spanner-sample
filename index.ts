import {createConnection, Connection} from "typeorm";
import {User, Item} from "./entities";

function assert(cond: boolean, msg: string) {
    if (!cond) {
        console.log(`assertion failed(${msg}) at`, (new Error()).stack);
        process.exit(1);
    }
}

createConnection({
    type: "spanner",
    projectId: "gp-01-207304",
    instanceId: "gp01-spanner-database",
    database: "test",
    dropSchema: false,
    migrationsRun: true,
    synchronize: true,
    logging: "all", //["info", "query", "log"],
    entities: [User, Item], 
}).then(async (c: Connection) => {
    console.log("database init");
    //basic CRUD
    //insert, conditional update/delete/upsert
    const repo = c.getRepository(User);
    console.log('insert User');
    const ret1 = await repo.insert({
        first_name: "tommy",
        gender: false,
        data: Buffer.from("buffer string"),
        latest_date: new Date(),
        created_date: new Date('1995-12-17T03:24:00')
    });
    console.log('insert result', ret1.raw[0]);
    assert(ret1.raw[0].id, "id should set");
    assert(ret1.raw[0].level === 1, "level should set");

    const id = ret1.raw[0].id;

    const ret2 = await repo.findOne(id);
    console.log('ret2', ret2);
    if (ret2 != undefined) {
        assert(ret2.id == id, "object should correct");    
        assert(ret2.first_name == "tommy", "object should correct");
    } else {
        assert(false, "object should found");
    }

    const ret3 = await repo.update(id, {
        first_name: "john"
    });
    console.log(ret3);

    const ret4 = await repo.findOne(id);
    assert(ret4 != undefined, "object should found");
    if (ret4 != undefined) {
        assert(ret4.first_name == "john", "object should update");
    } else {
        assert(false, "object should found");        
    }

    const ret5 = await repo.delete(id);
    console.log(ret5);

    const ret6 = await repo.findOne(id);
    assert(ret6 == undefined, "object should not found");

    return c;
});
