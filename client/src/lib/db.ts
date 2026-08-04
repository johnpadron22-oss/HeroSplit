import { init, id } from "@instantdb/react";
import type { AppSchema } from "../../../instant.schema";

export const APP_ID = import.meta.env.VITE_INSTANT_APP_ID as string;

export const db = init<AppSchema>({ appId: APP_ID });

export { id };
