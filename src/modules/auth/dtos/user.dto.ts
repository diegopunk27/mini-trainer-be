export class UserDto {
  id: number;
  email: string;
  roleId: number;
  roleName: string;
  permissions?: string[];
}
