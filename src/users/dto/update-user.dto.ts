export class UpdateUserDto {
  readonly _id: string;
  readonly parentId: string | null;
  childrenId: string[];
  text: string;
}
