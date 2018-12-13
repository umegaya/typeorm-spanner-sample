import {Entity, PrimaryColumn, PrimaryGeneratedColumn, Index} from "typeorm";

//must specify entity name to work with minify correctly.
@Entity('Item')
@Index(["item_id"])
export class Item {

	@PrimaryColumn()
    owner_id: string;

	@PrimaryGeneratedColumn()
    item_id: number;    
}
