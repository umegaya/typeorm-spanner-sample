import {Entity, PrimaryGeneratedColumn, Column, Index} from "typeorm";

//must specify entity name to work with minify correctly.
@Entity('User')
export class User {

	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
    @Index()
    first_name: string;
    
	@Column({nullable: true})
    @Index({spatial: true, unique: true})
    my_number: string;

    @Column({default: true})
    gender: boolean;

    @Column({default: 1, nullable: true}) // alter column should be nullable at spanner
    @Index()
    level: number;

    @Column({type: 'bytes', nullable: true})
    data: Buffer;

	@Column({precision: 6, type: 'timestamp', nullable: true})
	latest_date: Date;

	@Column({precision: 6, type: 'timestamp', nullable: true})
    created_date: Date;
}
