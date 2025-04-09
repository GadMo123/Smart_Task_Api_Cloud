import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Project } from "./Project";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
