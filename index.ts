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

    await test_query_builder(c);
    await test_basic_crud(c);

    return c;
});

async function test_basic_crud(c: Connection) {
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
}

async function test_query_builder(c: Connection) {
    await c.createQueryBuilder()
        .delete()
        .from(User)
        .execute();

    const NUM_RECORD = 10;
    const ret1 = await c.createQueryBuilder()
        .insert()
        .into(User)
        .values([...Array(NUM_RECORD).keys()].map((i) => {
            const cd = (new Date('1995-12-17T03:24:00'));
            cd.setSeconds(i);
            return {
                first_name: "user" + i,
                gender: false,
                data: Buffer.from(`buffer ${i}`),
                latest_date: new Date(),
                created_date: cd,
                level: i
            };
        }))
        .execute();

    console.log('insert result', ret1);
    assert(ret1.raw.length == NUM_RECORD, "record should be created");
    
    const ret2 = await c.createQueryBuilder()
        .select("*")
        .from(User, "User")
        .where("level <= :high and level >= :low", { high: 7, low: 3 })
        .execute();

    console.log('select result', ret2);
    assert(ret2.length == 5, "record should be selected");
    ret2.sort((a: any, b: any) => a.level - b.level).forEach((r: User, i: number) => {
        const idx = i + 3;
        const cd = (new Date('1995-12-17T03:24:00'));
        cd.setSeconds(idx);
        assert(r.first_name == ("user" + idx), "select content should be correct");
        assert(r.created_date.getTime() == cd.getTime(), "select content should be correct");
        assert(r.data.toString('hex') == Buffer.from(`buffer ${idx}`).toString('hex'), 
            `select content should be correct ${r.data} vs ${Buffer.from(`buffer ${idx}`)}`);
    });

    const ret3 = await c.createQueryBuilder()
        .update(User)
        .set({first_name: "hoge"})
        .where("data = :buf1 or data = :buf2", { buf1: Buffer.from(`buffer 1`), buf2: Buffer.from(`buffer 4`)})
        .execute();

    console.log('update1', ret3);
    assert(ret3.raw.length == 2, "correct record should select");

    const ret6 = await c.createQueryBuilder()
        .update(User)
        .set({first_name: "fuga"})
        .where("created_date >= :date", { date: new Date('1995-12-17T03:24:05') })
        .execute();
    console.log('update2', ret6);
    assert(ret6.raw.length == 5, "correct record should select");


    const ret4 = await c.createQueryBuilder()
        .select("*")
        .from(User, "User")
        .execute();

    ret4.sort((a: any, b: any) => a.level - b.level).forEach((r: User, i: number) => {
        if (i == 1 || i == 4) {
            assert(r.first_name == "hoge", "name should be updated correctly");
        } else if (i >= 5) {
            assert(r.first_name == "fuga", "name should be updated correctly");
        } else {
            assert(r.first_name == "user" + i, "name should be updated correctly");            
        }
    });

    await c.createQueryBuilder()
        .delete()
        .from(User)
        .where("data != :buf1 and data != :buf2", { buf1: Buffer.from(`buffer 1`), buf2: Buffer.from(`buffer 4`)})
        .execute();

    const ret5 = await c.createQueryBuilder()
        .select("*")
        .from(User, "User")
        .execute();

    assert(ret5.length == 2, "correct record should remain");
    ret5.forEach((r: User, i: number) => {
        assert(r.first_name == "hoge", "name should be updated correctly");
    });
}
