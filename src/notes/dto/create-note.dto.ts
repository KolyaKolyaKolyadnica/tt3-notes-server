export class CreateNoteDto {
  readonly parentId: string | null;
  childrenId: string[];
  text: string;
  userId: string;
}
