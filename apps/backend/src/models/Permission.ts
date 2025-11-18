import { Status, Permission as PermissionType } from '@csisp/types';

export class Permission implements PermissionType {
  id: number;
  name: string;
  code: string;
  description: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    name: string,
    code: string,
    description: string,
    status: Status = Status.Active,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default Permission;
