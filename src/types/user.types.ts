import { Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{}> | null;

export enum EntityType {
  RESUME = "resume",
  AUDIO = "audio",
}
