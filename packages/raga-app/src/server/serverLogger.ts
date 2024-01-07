import { green } from "ansis";

import { createScopedLogger } from "../common/logUtils";

export const log = createScopedLogger("server", green);
